"use strict";
/* App-Version: bei jeder Änderung auch CACHE in sw.js erhöhen */
const APP = {
  version: "1.1.0",
  apk: "https://github.com/marchello859/codepfad/releases/download/apk/codepfad.apk",
  claude: "https://claude.ai/artifact/N8smC6QFFw6uwJ6qgoPX8Y"
};
const LANG_ORDER = ["c", "py", "js"];

/* =====================================================================
   Hilfsfunktionen
   ===================================================================== */
const $ = (sel, root = document) => root.querySelector(sel);
function esc(s) { return String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }
function inline(t) {
  return esc(t).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}
function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function today() { const d = new Date(); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); }

const KW = {
  c: new Set("auto break case char const continue default do double else enum extern float for goto if inline int long register return short signed sizeof static struct switch typedef union unsigned void volatile while NULL bool true false".split(" ")),
  py: new Set("False None True and as assert async await break class continue def del elif else except finally for from global if import in is lambda nonlocal not or pass raise return try while with yield self".split(" ")),
  js: new Set("async await break case catch class const continue debugger default delete do else export extends false finally for function get if import in instanceof let new null of return set static super switch this throw true try typeof undefined var void while yield".split(" "))
};
const RX = {
  c: /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(^[ \t]*#\w+)|(\b\d+(?:\.\d+)?[fFuUlL]*\b)|([A-Za-z_]\w*)/gm,
  py: /(#.*)|([fFrRbB]?"""[\s\S]*?"""|[fFrRbB]?"(?:\\.|[^"\\\n])*"|[fFrRbB]?'(?:\\.|[^'\\\n])*')|(@\w+)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_]\w*)/gm,
  js: /(\/\/.*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(#\w+)|(\b\d+(?:\.\d+)?n?\b)|([A-Za-z_$][\w$]*)/gm
};
function hl(code, lang) {
  const rx = new RegExp(RX[lang].source, "gm");
  const kw = KW[lang];
  let out = "", last = 0, m;
  while ((m = rx.exec(code))) {
    out += esc(code.slice(last, m.index));
    const t = m[0];
    let cls = m[1] ? "com" : m[2] ? "str" : m[3] ? "pre" : m[4] ? "num" : kw.has(t) ? "kw" : (/^\s*\(/.test(code.slice(rx.lastIndex, rx.lastIndex + 3)) ? "fn" : "");
    out += cls ? '<span class="t-' + cls + '">' + esc(t) + "</span>" : esc(t);
    last = rx.lastIndex;
  }
  return out + esc(code.slice(last));
}

/* Kleiner Markdown-Renderer für Antworten von Claude */
function md(src) {
  const parts = String(src).split(/```[^\n]*\n?/);
  let html = "";
  parts.forEach((part, i) => {
    if (i % 2 === 1) { html += "<pre><code>" + esc(part.replace(/\n$/, "")) + "</code></pre>"; return; }
    const lines = part.split("\n");
    let list = null, para = [];
    const flushP = () => { if (para.length) { html += "<p>" + inline(para.join(" ")) + "</p>"; para = []; } };
    const flushL = () => { if (list) { html += "<" + list.t + ">" + list.items.map(x => "<li>" + inline(x) + "</li>").join("") + "</" + list.t + ">"; list = null; } };
    for (const raw of lines) {
      const l = raw.trim();
      let mm;
      if (!l) { flushP(); flushL(); continue; }
      if ((mm = l.match(/^#{1,4}\s+(.*)/))) { flushP(); flushL(); html += "<h4>" + inline(mm[1]) + "</h4>"; continue; }
      if ((mm = l.match(/^[-*•]\s+(.*)/))) { flushP(); if (!list || list.t !== "ul") { flushL(); list = { t: "ul", items: [] }; } list.items.push(mm[1]); continue; }
      if ((mm = l.match(/^\d+[.)]\s+(.*)/))) { flushP(); if (!list || list.t !== "ol") { flushL(); list = { t: "ol", items: [] }; } list.items.push(mm[1]); continue; }
      flushL(); para.push(l);
    }
    flushP(); flushL();
  });
  return html;
}

/* =====================================================================
   Fortschritt (lokal + Sync über das Claude-Konto)
   ===================================================================== */
const LS_KEY = "codepfad.progress.v1";
const LS_DRAFT = "codepfad.drafts.v1";
function blank() { return { done: {}, task: {}, quiz: {}, extra: 0, days: [], lang: "c", updated: 0, resetAt: 0 }; }
function loadLocal() { try { const v = JSON.parse(localStorage.getItem(LS_KEY)); return v && typeof v === "object" ? Object.assign(blank(), v) : blank(); } catch (e) { return blank(); } }
function saveLocal() { try { localStorage.setItem(LS_KEY, JSON.stringify(P)); } catch (e) {} }
function merge(a, b) {
  // Ein neueres Zurücksetzen gewinnt: Daten, die älter sind als der Reset, fallen weg
  const ra = a.resetAt || 0, rb = b.resetAt || 0;
  if (rb > ra && (a.updated || 0) <= rb) a = Object.assign(blank(), { lang: a.lang, updated: a.updated });
  if (ra > rb && (b.updated || 0) <= ra) b = Object.assign(blank(), { lang: b.lang, updated: b.updated });
  const r = blank();
  r.resetAt = Math.max(ra, rb);
  for (const k of ["done", "task"]) r[k] = Object.assign({}, a[k], b[k]);
  r.quiz = Object.assign({}, a.quiz);
  for (const [k, v] of Object.entries(b.quiz || {})) r.quiz[k] = Math.max(r.quiz[k] || 0, v || 0);
  r.extra = Math.max(a.extra || 0, b.extra || 0);
  r.days = [...new Set([...(a.days || []), ...(b.days || [])])].sort().slice(-180);
  const newer = (b.updated || 0) > (a.updated || 0) ? b : a;
  r.lang = COURSES[newer.lang] ? newer.lang : "c";
  r.updated = Math.max(a.updated || 0, b.updated || 0);
  return r;
}
let P = loadLocal();

const sync = { ref: null, state: "local", writing: false, dirty: false, timer: null };
function syncLabel() {
  return {
    local: "Nur auf diesem Gerät",
    synced: G ? "Automatisch synchronisiert" : "Mit deinem Konto synchronisiert",
    saving: "Gleicht ab …",
    error: "Offline, wird später abgeglichen",
    auth: "Sync-Schlüssel ungültig, bitte neu verbinden"
  }[sync.state];
}
function paintSync() {
  for (const el of document.querySelectorAll("[data-sync]")) { el.dataset.s = sync.state; const s = el.querySelector("span"); if (s) s.textContent = syncLabel(); }
  const side = $("#sync-side"); side.dataset.s = sync.state; side.querySelector("span").textContent = syncLabel();
}
function touch() {
  const d = today();
  if (!P.days.includes(d)) P.days.push(d);
  P.updated = Date.now();
  saveLocal();
  if (G && G.gist) { clearTimeout(gTimer); gTimer = setTimeout(gSync, 2000); }
  if (!sync.ref) return;
  clearTimeout(sync.timer);
  sync.timer = setTimeout(flush, 1200);
}

/* ---------- Automatischer Abgleich über ein privates GitHub-Gist ----------
   Jedes Gerät liest beim Start, beim Zurückkehren in die App und jede Minute den Stand aus dem Gist,
   führt ihn mit dem eigenen zusammen (nichts geht verloren) und schreibt nur, wenn sich etwas geändert hat. */
const GS_KEY = "codepfad.gistsync.v1";
const GIST_FILE = "codepfad-fortschritt.json";
let G = (() => { try { const v = JSON.parse(localStorage.getItem(GS_KEY)); return v && v.token ? v : null; } catch (e) { return null; } })();
let gTimer = null, gBusy = false, gAgain = false;
function gSave() { try { if (G) localStorage.setItem(GS_KEY, JSON.stringify(G)); else localStorage.removeItem(GS_KEY); } catch (e) {} }
function canon(v) {
  if (Array.isArray(v)) return "[" + v.map(canon).join(",") + "]";
  if (v && typeof v === "object") return "{" + Object.keys(v).sort().map(k => JSON.stringify(k) + ":" + canon(v[k])).join(",") + "}";
  return JSON.stringify(v);
}
async function ghApi(path, opts, token) {
  const res = await fetch("https://api.github.com" + path, Object.assign({ cache: "no-store" }, opts || {}, {
    headers: { Authorization: "Bearer " + (token || G.token), Accept: "application/vnd.github+json", "Content-Type": "application/json" }
  }));
  if (res.status === 401 || res.status === 403) throw { code: "auth" };
  if (res.status === 404) throw { code: "missing" };
  if (!res.ok) throw { code: "http" };
  return res.json();
}
async function gFindOrCreate(token) {
  for (let page = 1; page <= 10; page++) {
    const list = await ghApi("/gists?per_page=100&page=" + page, null, token);
    const hit = list.find(g => g.files && g.files[GIST_FILE]);
    if (hit) return hit.id;
    if (list.length < 100) break;
  }
  const g = await ghApi("/gists", { method: "POST", body: JSON.stringify({
    description: "Codepfad: Lernfortschritt (wird automatisch synchronisiert)", public: false,
    files: { [GIST_FILE]: { content: JSON.stringify(P) } }
  }) }, token);
  return g.id;
}
async function gConnect(token) {
  token = token.trim();
  const gist = await gFindOrCreate(token);
  G = { token, gist };
  gSave();
  await gSync();
}
async function gSync() {
  if (!G || !G.gist) return;
  if (gBusy) { gAgain = true; return; }
  gBusy = true; sync.state = "saving"; paintSync();
  try {
    let g;
    try { g = await ghApi("/gists/" + G.gist); }
    catch (e) { if (e.code !== "missing") throw e; G.gist = await gFindOrCreate(G.token); gSave(); g = await ghApi("/gists/" + G.gist); }
    const f = g.files && g.files[GIST_FILE];
    let remote = null;
    if (f) {
      let txt = f.content;
      if (f.truncated) txt = await (await fetch(f.raw_url, { cache: "no-store" })).text();
      try { remote = Object.assign(blank(), JSON.parse(txt)); } catch (e) { remote = null; }
    }
    const before = canon(P);
    if (remote) P = merge(P, remote);
    if (canon(P) !== before) { saveLocal(); if (S.view !== "play") render(); }
    if (!remote || canon(P) !== canon(remote)) {
      await ghApi("/gists/" + G.gist, { method: "PATCH", body: JSON.stringify({ files: { [GIST_FILE]: { content: JSON.stringify(P) } } }) });
    }
    sync.state = "synced";
  } catch (e) {
    sync.state = e && e.code === "auth" ? "auth" : "error";
  }
  gBusy = false; paintSync();
  if (gAgain) { gAgain = false; gSync(); }
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") gSync(); });
window.addEventListener("online", () => gSync());
setInterval(() => { if (document.visibilityState === "visible") gSync(); }, 60 * 1000);
async function flush() {
  if (!sync.ref) return;
  if (sync.writing) { sync.dirty = true; return; }
  sync.writing = true; sync.state = "saving"; paintSync();
  try {
    await sync.ref.set(JSON.parse(JSON.stringify(P)));
    sync.state = "synced";
  } catch (e) {
    if (e && (e.code === "invalid_argument" || e.code === "revoked" || e.code === "not_granted")) { sync.ref = null; sync.state = "local"; }
    else sync.state = "error";
  }
  sync.writing = false; paintSync();
  if (sync.dirty) { sync.dirty = false; flush(); }
}
async function initSync() {
  if (!window.claude || !window.claude.use) return;
  try {
    const [user, db] = await Promise.all([window.claude.use("user"), window.claude.use("db")]);
    if (!user || !db) return;
    const id = await user.id();
    if (!id) return;
    const ref = db.doc("data/users/" + id + "/progress");
    const snap = await ref.get();
    sync.ref = ref;
    sync.state = "synced";
    if (snap.exists) {
      const before = JSON.stringify(P);
      P = merge(P, snap.data());
      saveLocal();
      if (JSON.stringify(P) !== before && S.view !== "play") render();
      if (JSON.stringify(P) !== JSON.stringify(Object.assign(blank(), snap.data()))) flush();
    } else if (P.updated) {
      flush();
    }
    paintSync();
  } catch (e) { sync.ref = null; sync.state = "local"; paintSync(); }
}

/* XP wird aus dem Fortschritt berechnet, damit das Zusammenführen zweier Geräte nie doppelt zählt */
function xp() {
  return Object.keys(P.done).length * 15 + Object.keys(P.task).length * 25 + Object.values(P.quiz).filter(v => v === 1).length * 10 + (P.extra || 0) * 10;
}
function streak() {
  const set = new Set(P.days);
  const d = new Date();
  if (!set.has(today())) d.setDate(d.getDate() - 1);
  let n = 0;
  for (;;) {
    const k = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
    if (!set.has(k)) break;
    n++; d.setDate(d.getDate() - 1);
  }
  return n;
}

/* =====================================================================
   Zustand der Oberfläche
   ===================================================================== */
const S = {
  lang: COURSES[P.lang] ? P.lang : "c",
  view: "path",
  lessonId: null,
  answers: {},          // Frage-Schlüssel -> gewählte Option (nur diese Sitzung)
  quiz: null,           // laufendes Quiz
  quizLevel: 0,
  gen: { level: 2, busy: false, error: "" },
  task: null,           // Übung, die gerade im Editor gelöst wird
  drafts: (() => { try { return JSON.parse(localStorage.getItem(LS_DRAFT)) || {}; } catch (e) { return {}; } })(),
  ai: false
};
function course() { return COURSES[S.lang]; }
function lessonById(id) { for (const k of LANG_ORDER) { const l = COURSES[k].lessons.find(x => x.id === id); if (l) return { l, lang: k }; } return null; }
function draft(lang) { return S.drafts[lang] || { code: COURSES[lang].starter, stdin: "" }; }
function saveDraft(lang, d) { S.drafts[lang] = d; try { localStorage.setItem(LS_DRAFT, JSON.stringify(S.drafts)); } catch (e) {} }

/* =====================================================================
   Icons
   ===================================================================== */
const I = {
  path: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V5a2 2 0 0 1 2-2h12v15H6a2 2 0 0 0-2 2Z"/><path d="M8 7h6M8 11h4"/></svg>',
  quiz: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5M13.5 4l-3 16"/></svg>',
  prog: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
  run: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15a1 1 0 0 0 1.5.9l12-7.5a1 1 0 0 0 0-1.8l-12-7.5A1 1 0 0 0 7 4.5Z"/></svg>',
  spark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/></svg>',
  edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 7-5 5 5 5M16 7l5 5-5 5"/></svg>'
};
const NAV = [["path", "Lernen", I.path], ["quiz", "Quiz", I.quiz], ["play", "Live-Code", I.play], ["prog", "Fortschritt", I.prog]];

/* =====================================================================
   Rendering
   ===================================================================== */
function renderChrome() {
  const navView = S.view === "lesson" ? "path" : S.view;
  const items = NAV.map(([v, label, icon]) => '<button data-act="nav" data-view="' + v + '"' + (navView === v ? ' aria-current="page"' : "") + ">" + icon + "<span>" + label + "</span></button>").join("");
  $("#tabbar").innerHTML = items;
  $("#side-nav").innerHTML = items;
  $("#lang-seg").innerHTML = LANG_ORDER.map(k => '<button data-act="lang" data-lang="' + k + '" aria-pressed="' + (S.lang === k) + '">' + COURSES[k].name + "</button>").join("");
}

function render() {
  renderChrome();
  const main = $("#main");
  if (S.view === "lesson") main.innerHTML = viewLesson();
  else if (S.view === "quiz") main.innerHTML = viewQuiz();
  else if (S.view === "play") { main.innerHTML = viewPlay(); mountEditor(); }
  else if (S.view === "prog") main.innerHTML = viewProg();
  else main.innerHTML = viewPath();
  paintSync();
}

function go(view, extra) {
  Object.assign(S, extra || {});
  S.view = view;
  render();
  window.scrollTo(0, 0);
}

/* ---------- Lernpfad ---------- */
function nextLesson(lang) {
  const ls = COURSES[lang].lessons;
  return ls.find(l => !P.done[l.id]) || null;
}
function viewPath() {
  const c = course();
  const total = c.lessons.length;
  const done = c.lessons.filter(l => P.done[l.id]).length;
  const nxt = nextLesson(S.lang);
  let html = '<div class="wrap">';
  html += '<section class="card hero"><span class="eyebrow">' + esc(c.name) + " · Lernpfad</span>"
    + "<h1>Von 0 bis Profi in " + esc(c.name) + "</h1><p>" + esc(c.intro) + "</p>"
    + '<div class="meter" aria-hidden="true"><span style="width:' + Math.round(done / total * 100) + '%"></span></div>'
    + '<div class="stats"><span>' + done + " von " + total + " Lektionen</span><span>" + xp() + " XP</span></div>"
    + '<div class="row">' + (nxt ? '<button class="btn primary" data-act="open" data-id="' + nxt.id + '">' + (done ? "Weiter mit " : "Starten mit ") + esc(nxt.title) + I.next + "</button>"
      : '<span class="lvl lvl-1">' + I.check + "Alle Lektionen abgeschlossen</span>")
    + '<button class="btn" data-act="nav" data-view="play">' + I.edit + "Live-Code öffnen</button></div></section>";
  for (const lv of [1, 2, 3]) {
    const ls = c.lessons.filter(l => l.level === lv);
    const d = ls.filter(l => P.done[l.id]).length;
    html += '<section class="level"><div class="level-head"><span class="lvl lvl-' + lv + '">Stufe ' + lv + "</span><h2>" + LEVELS[lv] + '</h2><span class="count">' + d + "/" + ls.length + '</span></div><ol class="lessons">';
    for (const l of ls) {
      const idx = c.lessons.indexOf(l) + 1;
      const isDone = !!P.done[l.id], isTask = !!P.task[l.id];
      html += '<li><button class="lesson-row' + (isDone ? " is-done" : "") + '" data-act="open" data-id="' + l.id + '">'
        + '<span class="ln-num">' + (isDone ? I.check.replace("<svg", '<svg width="18" height="18"') : idx) + "</span>"
        + '<span><span class="ln-title">' + esc(l.title) + '</span><span class="ln-meta">' + l.mins + " Min · " + l.quiz.length + " Fragen · Übung" + (isTask ? " gelöst" : "") + "</span></span>"
        + '<span class="ln-state"><span class="star' + (isTask ? " on" : "") + '" title="' + (isTask ? "Übung gelöst" : "Übung offen") + '">' + I.star + "</span></span>"
        + "</button></li>";
    }
    html += "</ol></section>";
  }
  return html + "</div>";
}

/* ---------- Lektion ---------- */
function codeBlock(src, lang, opts) {
  opts = opts || {};
  const tryBtn = opts.tryAttrs ? '<button ' + opts.tryAttrs + ">" + I.edit + "Im Editor ausprobieren</button>" : "";
  return '<figure class="code"><div class="code-bar"><span>' + esc(COURSES[lang].name) + "</span>" + tryBtn + "</div><pre><code>" + hl(src, lang) + "</code></pre></figure>";
}
function questionHTML(key, q, lang, order) {
  order = order || q.opts.map((_, i) => i);
  const chosen = S.answers[key];
  const answered = chosen !== undefined;
  const textOpts = q.opts.every(o => /\s/.test(o) && !/[;(){}=\[\]]/.test(o) || /^[A-Za-zÄÖÜäöü]/.test(o) && !/[;(){}=\[\]"']/.test(o));
  let html = '<div class="q" data-qkey="' + esc(key) + '"><p class="q-text">' + inline(q.q) + "</p>";
  if (q.code) html += codeBlock(q.code, lang);
  html += '<div class="opts">';
  order.forEach((oi, pos) => {
    let cls = "opt" + (textOpts ? " v-text" : "");
    if (answered) { if (oi === q.a) cls += " right"; else if (oi === chosen) cls += " wrong"; }
    html += '<button class="' + cls + '" data-act="answer" data-key="' + esc(key) + '" data-i="' + oi + '"' + (answered ? " disabled" : "") + '><span class="k">' + "ABCD"[pos] + '</span><span class="v">' + esc(q.opts[oi]) + "</span></button>";
  });
  html += "</div>";
  if (answered) {
    const ok = chosen === q.a;
    html += '<div class="why"><span class="verdict ' + (ok ? "ok" : "no") + '">' + (ok ? "Richtig!" : "Nicht ganz. Richtig ist " + "ABCD"[order.indexOf(q.a)] + ".") + "</span><p>" + inline(q.why || "") + "</p>"
      + '<div class="row">' + (key.startsWith("qz-") ? "" : '<button class="btn small ghost" data-act="retry" data-key="' + esc(key) + '">Nochmal versuchen</button>')
      + '<button class="btn small ghost ai-only" data-act="why" data-key="' + esc(key) + '">' + I.spark + "Claude erklären lassen</button></div>"
      + '<div class="answer" data-out="why-' + esc(key) + '"></div></div>';
  }
  return html + "</div>";
}
function viewLesson() {
  const found = lessonById(S.lessonId);
  if (!found) return viewPath();
  const { l, lang } = found;
  const c = COURSES[lang];
  const idx = c.lessons.indexOf(l);
  let html = '<div class="wrap"><div><button class="back" data-act="nav" data-view="path">' + I.back + "Lernpfad " + esc(c.name) + "</button></div>";
  html += '<article class="lesson"><div class="lesson-meta"><span class="lvl lvl-' + l.level + '">Stufe ' + l.level + " · " + LEVELS[l.level] + "</span><span>Lektion " + (idx + 1) + " von " + c.lessons.length + "</span><span>" + l.mins + " Min</span></div>";
  html += "<h1>" + esc(l.title) + "</h1>";
  l.body.forEach((b, bi) => {
    if (b[0] === "p") html += "<p>" + inline(b[1]) + "</p>";
    else if (b[0] === "tip") html += '<aside class="tip"><strong>Merke</strong><p>' + inline(b[1]) + "</p></aside>";
    else if (b[0] === "code") {
      const runnable = !(b[2] && b[2].run === false);
      html += codeBlock(b[1], lang, runnable ? { tryAttrs: 'data-act="try" data-id="' + l.id + '" data-b="' + bi + '"' } : {});
    }
  });
  html += "</article>";

  html += '<section class="card" style="padding:0"><div style="padding:18px 18px 4px"><div class="section-title"><h2>Prüfe dein Wissen</h2><span class="muted">' + l.quiz.filter((q, i) => P.quiz[l.id + ":" + i] === 1).length + "/" + l.quiz.length + " richtig</span></div></div>";
  l.quiz.forEach((q, i) => { html += questionHTML(l.id + ":" + i, q, lang); });
  html += "</section>";

  html += '<section class="card task"><div class="section-title"><h2>Übung</h2>' + (P.task[l.id] ? '<span class="state ok">' + I.check.replace("<svg", '<svg width="18" height="18"') + "Gelöst</span>" : '<span class="muted">+25 XP</span>') + "</div>"
    + "<p>" + inline(l.task.prompt) + "</p>"
    + '<div class="row"><button class="btn primary" data-act="task" data-id="' + l.id + '">' + I.edit + "Im Live-Code lösen</button></div></section>";

  html += '<section class="card tutor ai-only"><div class="section-title"><h2>Frag den Tutor</h2><span class="muted">Claude erklärt dir die Lektion</span></div>'
    + '<div class="chips">'
    + ["Erklär das noch genauer", "Erklär es einfacher", "Zeig mir mehr Beispiele", "Typische Fehler dazu?", "Gib mir eine Zusatzaufgabe"].map(t => '<button class="chip" data-act="tutor" data-q="' + esc(t) + '">' + esc(t) + "</button>").join("")
    + '</div><form class="ask" data-act="tutor-form"><input id="tutor-q" placeholder="Eigene Frage zu dieser Lektion" autocomplete="off"><button class="btn primary" type="submit">Fragen</button></form>'
    + '<div class="answer" data-out="tutor"></div></section>';

  const prev = c.lessons[idx - 1], next = c.lessons[idx + 1];
  html += '<div class="lesson-nav">'
    + (prev ? '<button class="btn ghost" data-act="open" data-id="' + prev.id + '">' + I.back + esc(prev.title) + "</button>" : "<span></span>")
    + '<button class="btn primary" data-act="complete" data-id="' + l.id + '">' + (P.done[l.id] ? (next ? "Weiter zur nächsten Lektion" : "Zurück zum Lernpfad") : "Lektion abschließen") + I.next + "</button></div>";
  return html + "</div>";
}

/* ---------- Quiz-Modus ---------- */
function poolFor(lang, level) {
  const out = [];
  for (const l of COURSES[lang].lessons) {
    if (level && l.level !== level) continue;
    l.quiz.forEach((q, i) => out.push({ key: l.id + ":" + i, q, from: l.title }));
  }
  return out;
}
function startQuiz(items, label) {
  S.quiz = { label, items: items.map(it => ({ ...it, order: shuffle(it.q.opts.map((_, i) => i)), skey: "qz-" + Math.random().toString(36).slice(2, 8) })), pos: 0, right: 0, wrong: [] };
  for (const it of S.quiz.items) delete S.answers[it.skey];
  go("quiz");
}
function viewQuiz() {
  const c = course();
  let html = '<div class="wrap">';
  const Q = S.quiz;
  if (Q && Q.pos < Q.items.length) {
    const it = Q.items[Q.pos];
    const answered = S.answers[it.skey] !== undefined;
    html += '<div class="quiz-top"><button class="back" data-act="quit-quiz">' + I.back + 'Beenden</button><div class="meter"><span style="width:' + Math.round(Q.pos / Q.items.length * 100) + '%"></span></div><span>' + (Q.pos + 1) + " / " + Q.items.length + "</span></div>";
    html += '<section class="card" style="padding:0">' + '<div style="padding:16px 18px 0" class="from">' + esc(Q.label) + (it.from ? " · aus „" + esc(it.from) + "“" : "") + "</div>" + questionHTML(it.skey, it.q, S.lang, it.order) + "</section>";
    if (answered) html += '<div class="row" style="justify-content:flex-end"><button class="btn primary" data-act="quiz-next">' + (Q.pos + 1 < Q.items.length ? "Nächste Frage" : "Auswertung") + I.next + "</button></div>";
    return html + "</div>";
  }
  if (Q) {
    const pct = Math.round(Q.right / Q.items.length * 100);
    html += '<section class="card result"><span class="eyebrow">' + esc(Q.label) + '</span><span class="score">' + Q.right + " / " + Q.items.length + "</span><p>"
      + (pct === 100 ? "Perfekt. Zeit für die nächste Stufe." : pct >= 70 ? "Stark. Wiederhole die falschen Fragen, dann sitzt es." : "Guter Anfang. Lies die passenden Lektionen noch einmal und versuch es erneut.") + "</p>"
      + '<div class="row">' + (Q.wrong.length ? '<button class="btn primary" data-act="quiz-wrong">' + Q.wrong.length + " falsche wiederholen</button>" : "")
      + '<button class="btn" data-act="quit-quiz">Neues Quiz</button></div></section>';
    return html + "</div>";
  }
  const lvls = [[0, "Alle"], [1, "Einsteiger"], [2, "Fortgeschritten"], [3, "Profi"]];
  const pool = poolFor(S.lang, S.quizLevel);
  html += '<section class="card hero"><span class="eyebrow">' + esc(c.name) + " · Quiz</span><h1>Teste dich mit Code-Fragen</h1><p>Zufällige Multiple-Choice-Fragen aus allen Lektionen. Antworten werden gemischt, nach jeder Frage siehst du die Erklärung.</p>"
    + '<div class="field"><label>Stufe</label><div class="seg" role="group" aria-label="Stufe">' + lvls.map(([v, t]) => '<button data-act="qlevel" data-v="' + v + '" aria-pressed="' + (S.quizLevel === v) + '">' + t + "</button>").join("") + "</div></div>"
    + '<div class="row"><button class="btn primary" data-act="quiz-start"' + (pool.length ? "" : " disabled") + ">" + Math.min(10, pool.length) + " Fragen starten" + I.next + '</button><span class="muted">' + pool.length + " Fragen verfügbar</span></div></section>";
  html += '<section class="card ai-only"><div class="tutor"><div class="section-title"><h2>Neue Fragen von Claude</h2><span class="muted">unbegrenzt üben</span></div>'
    + "<p class=\"muted\">Claude schreibt dir fünf frische Fragen auf deinem Niveau, mit Code und Erklärung.</p>"
    + '<div class="seg" role="group" aria-label="Niveau">' + [1, 2, 3].map(v => '<button data-act="glevel" data-v="' + v + '" aria-pressed="' + (S.gen.level === v) + '">' + LEVELS[v] + "</button>").join("") + "</div>"
    + '<div class="row"><button class="btn primary" data-act="gen"' + (S.gen.busy ? " disabled" : "") + ">" + I.spark + (S.gen.busy ? '<span class="dots">Claude schreibt Fragen</span>' : "5 Fragen erzeugen") + "</button></div>"
    + (S.gen.error ? '<p class="answer"><span class="err">' + esc(S.gen.error) + "</span></p>" : "")
    + "</div></section>";
  return html + "</div>";
}

/* ---------- Live-Code ---------- */
function viewPlay() {
  const c = course();
  const d = draft(S.lang);
  const t = S.task && S.task.lang === S.lang ? S.task : null;
  let html = '<div class="wrap wide">';
  if (t) {
    const l = lessonById(t.id).l;
    html += '<div class="pg-task"><div class="row"><span class="eyebrow">Übung · ' + esc(l.title) + '</span><button class="btn small ghost" data-act="task-close">Übung schließen</button></div><p>' + inline(l.task.prompt) + "</p>"
      + (t.result ? '<div class="verdict-bar ' + (t.result === "ok" ? "ok" : "no") + '">' + (t.result === "ok" ? "Gelöst! +25 XP. Die Ausgabe stimmt." : "Noch nicht. Erwartet wird:\n" + esc(l.task.expect)).replace(/\n/g, "<br>") + "</div>" : "")
      + (t.result === "ok" ? '<div class="row"><button class="btn small" data-act="open" data-id="' + l.id + '">' + I.back + "Zurück zur Lektion</button></div>" : "")
      + "</div>";
  }
  const examples = [];
  c.lessons.forEach(l => l.body.forEach((b, bi) => { if (b[0] === "code" && !(b[2] && b[2].run === false)) examples.push([l.id + ":" + bi, l.title]); }));
  html += '<div class="pg-grid"><div class="ed-card"><div class="ed-bar"><span class="file">' + esc(c.file) + "</span>"
    + '<select id="pg-example" aria-label="Beispiel laden"><option value="">Beispiel laden</option>' + examples.map(([v, t2]) => '<option value="' + v + '">' + esc(t2) + "</option>").join("") + "</select>"
    + '<button data-act="pg-reset">Zurücksetzen</button></div>'
    + '<div class="editor"><div class="gutter"><div class="gutter-in" id="gutter"></div></div><div class="ed-area"><pre class="ed-hl" id="ed-hl" aria-hidden="true"></pre>'
    + '<textarea id="pg-code" spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" aria-label="Code-Editor"></textarea></div></div>'
    + '<div class="keybar" id="keybar">' + keybarKeys().map(k => '<button type="button" data-key="' + esc(k[1]) + '">' + esc(k[0]) + "</button>").join("") + "</div></div>";
  html += '<div class="run-col"><div class="row"><button class="btn primary" id="run-btn" data-act="run">' + I.run + "Ausführen</button>"
    + '<button class="btn ai-only" data-act="review">' + I.spark + "Code von Claude prüfen lassen</button></div>"
    + '<details class="stdin"' + (d.stdin ? " open" : "") + '><summary>Eingabe (stdin), eine Zeile pro Eingabe</summary><textarea id="pg-stdin" spellcheck="false" aria-label="Eingabe">' + esc(d.stdin || "") + "</textarea></details>"
    + '<div class="console"><div class="console-bar"><span>Ausgabe</span><span id="run-state"></span></div><pre id="pg-out"><span class="sys">Drück auf Ausführen, um dein Programm zu starten.</span></pre></div>'
    + '<div class="answer" data-out="review"></div>'
    + '<p class="engine-note">' + engineNote() + "</p></div></div>";
  return html + "</div>";
}
function engineNote() {
  if (S.lang === "c") return cEngine === "picoc"
    ? "C läuft direkt im Browser über PicoC, einen C-Interpreter als WebAssembly. Zeiger, structs, malloc und die Standardbibliothek sind dabei. Für große Projekte nimmst du später gcc oder clang. Strg + Enter führt den Code aus."
    : "C läuft hier über den Ersatz-Interpreter JSCPP, weil dein Browser kein WebAssembly lädt. Er kennt Grundlagen, Zeiger und Arrays, aber keine structs und kein malloc.";
  if (S.lang === "py") return "Python läuft im Browser über Skulpt, einen Python-3-Interpreter in JavaScript. Die Sprache und viele Standardfunktionen sind dabei, große Bibliotheken wie numpy nicht.";
  return "JavaScript läuft in einem abgeschotteten Worker deines Browsers. console.log, Timer und async/await funktionieren wie gewohnt.";
}
function keybarKeys() {
  const base = [["Tab", "\t"], ["{", "{"], ["}", "}"], ["(", "("], [")", ")"], ["[", "["], ["]", "]"], [";", ";"], ["\"", "\""], ["'", "'"], ["=", "="], ["<", "<"], [">", ">"], ["+", "+"], ["-", "-"], ["*", "*"], ["/", "/"], ["%", "%"], ["&", "&"], ["|", "|"], ["!", "!"]];
  if (S.lang === "py") return [["Tab", "\t"], [":", ":"], ["(", "("], [")", ")"], ["[", "["], ["]", "]"], ["{", "{"], ["}", "}"], ["\"", "\""], ["'", "'"], ["=", "="], ["<", "<"], [">", ">"], ["+", "+"], ["-", "-"], ["*", "*"], ["/", "/"], ["%", "%"], ["#", "#"], ["_", "_"]];
  if (S.lang === "c") return base.concat([["#", "#"], ["\\n", "\\n"], ["%d", "%d"]]);
  return base.concat([["=>", " => "], ["`", "`"], ["$", "$"]]);
}

/* ---------- Fortschritt ---------- */
function viewProg() {
  const allQuiz = Object.values(P.quiz);
  const acc = allQuiz.length ? Math.round(allQuiz.filter(v => v === 1).length / allQuiz.length * 100) + " %" : "–";
  const doneAll = Object.keys(P.done).length;
  const totalAll = LANG_ORDER.reduce((s, k) => s + COURSES[k].lessons.length, 0);
  let html = '<div class="wrap"><section class="hero" style="padding:0"><span class="eyebrow">Fortschritt</span><h1>Dein Stand</h1></section>';
  html += '<div class="tiles"><div class="tile"><b>' + xp() + '</b><span>XP gesamt</span></div><div class="tile"><b>' + streak() + '</b><span>Tage in Folge</span></div>'
    + '<div class="tile"><b>' + doneAll + "/" + totalAll + '</b><span>Lektionen</span></div><div class="tile"><b>' + acc + "</b><span>Quiz-Trefferquote</span></div></div>";
  html += '<section class="card lang-prog"><h2>Sprachen</h2>';
  for (const k of LANG_ORDER) {
    const ls = COURSES[k].lessons;
    const d = ls.filter(l => P.done[l.id]).length, t = ls.filter(l => P.task[l.id]).length;
    html += '<div><div class="row"><strong>' + COURSES[k].name + "</strong><span>" + d + "/" + ls.length + " Lektionen · " + t + " Übungen</span></div>"
      + '<div class="meter"><span style="width:' + Math.round(d / ls.length * 100) + '%"></span></div></div>';
  }
  html += "</section>";
  html += '<section class="card tutor"><h2>Auf allen Geräten synchronisieren</h2>';
  if (G) {
    html += '<div class="sync" data-sync data-s="' + sync.state + '"><i></i><span>' + syncLabel() + "</span></div>"
      + '<p class="muted">Dein Fortschritt liegt in einem privaten Gist in deinem GitHub-Konto. Jedes verbundene Gerät gleicht ihn beim Öffnen, beim Zurückkehren in die App und jede Minute automatisch ab.</p>'
      + '<p class="muted">Weiteres Gerät verbinden: Öffne dort Codepfad → Fortschritt und füge denselben Sync-Schlüssel ein.</p>'
      + '<div class="row"><button class="btn small primary" data-act="gsync">Jetzt abgleichen</button><button class="btn small" data-act="gcopy">Sync-Schlüssel kopieren</button>'
      + (S.confirmDisconnect ? '<span class="confirm"><span>Dieses Gerät trennen?</span><button class="btn small" data-act="gdisconnect-yes">Ja, trennen</button><button class="btn small ghost" data-act="gdisconnect-no">Abbrechen</button></span>'
        : '<button class="btn small ghost" data-act="gdisconnect">Gerät trennen</button>') + "</div>"
      + (S.gNote ? '<p class="muted">' + esc(S.gNote) + "</p>" : "");
  } else {
    html += '<p class="muted">Einmal pro Gerät einrichten, danach ist dein Fortschritt auf Handy und PC automatisch gleich. Gespeichert wird in einem privaten Gist in deinem GitHub-Konto.</p>'
      + '<ol class="steps">'
      + '<li>Erstelle einen Sync-Schlüssel bei GitHub: <a href="https://github.com/settings/tokens/new?scopes=gist&amp;description=Codepfad-Sync" target="_blank" rel="noopener">Schlüssel erstellen</a>. Stelle bei „Expiration“ <strong>No expiration</strong> ein, lass nur „gist“ angehakt und klicke unten auf „Generate token“.</li>'
      + "<li>Kopiere den Schlüssel (beginnt mit <code>ghp_</code>) und füge ihn hier ein.</li>"
      + "<li>Auf deinem anderen Gerät denselben Schlüssel einfügen. Fertig.</li></ol>"
      + '<form class="ask" data-act="gconnect-form"><input id="gtoken" type="password" autocomplete="off" spellcheck="false" placeholder="ghp_…" aria-label="Sync-Schlüssel"><button class="btn primary" type="submit"' + (S.gBusyConnect ? " disabled" : "") + ">" + (S.gBusyConnect ? "Verbinde …" : "Verbinden") + "</button></form>"
      + (S.gNote ? '<p class="muted">' + esc(S.gNote) + "</p>" : "")
      + '<p class="muted">Der Schlüssel darf nur Gists lesen und schreiben und bleibt auf deinem Gerät.</p>';
  }
  html += "</section>";
  html += '<details class="card tutor"><summary><strong>Ohne GitHub: Fortschritt per Code übertragen</strong></summary>'
    + '<p class="muted">Kopiere hier deinen Code und füge ihn auf dem anderen Gerät ein. Beide Stände werden zusammengeführt.</p>'
    + '<div class="row"><button class="btn small" data-act="export">Meinen Code kopieren</button></div>'
    + (S.exportCode ? '<textarea id="export-code" class="code-field" readonly aria-label="Dein Fortschritts-Code">' + esc(S.exportCode) + "</textarea>" + (S.exportNote ? '<p class="muted">' + esc(S.exportNote) + "</p>" : "") : "")
    + '<textarea id="import-code" class="code-field" placeholder="Code vom anderen Gerät hier einfügen" aria-label="Code vom anderen Gerät"></textarea>'
    + '<div class="row"><button class="btn small primary" data-act="import">Code übernehmen</button>' + (S.importNote ? '<span class="muted">' + esc(S.importNote) + "</span>" : "") + "</div></details>";
  if (!S.ai && APP.claude) html += '<section class="card tutor"><h2>KI-Tutor</h2><p class="muted">Erklärungen, Code-Prüfung und neue Fragen von Claude gibt es in der <a href="' + esc(APP.claude) + '" target="_blank" rel="noopener">Claude-Version von Codepfad</a>. Dort wird dein Fortschritt auch über dein Claude-Konto abgeglichen.</p></section>';
  html += '<section class="card tutor"><h2>App installieren</h2><div class="howto">'
    + "<div><strong>Samsung Galaxy S24</strong><p>" + (APP.apk ? 'Lade die <a href="' + esc(APP.apk) + '">Codepfad-APK</a> herunter und öffne sie. Android fragt einmal, ob du Apps aus dieser Quelle erlauben willst. Alternativ in Chrome: Menü → „App installieren“.' : "Öffne die App in Chrome, tippe auf das Menü und wähle „App installieren“.") + "</p></div>"
    + "<div><strong>Windows 11</strong><p>Öffne die App in Edge oder Chrome und klicke in der Adressleiste auf das Installieren-Symbol, oder im Menü auf „Apps“ → „Diese Website als App installieren“. Codepfad bekommt ein eigenes Fenster und einen Eintrag im Startmenü.</p></div>"
    + "</div>" + (installEvent ? '<div class="row"><button class="btn primary" data-act="install">Codepfad jetzt installieren</button></div>' : "")
    + '<p class="muted">Version ' + esc(APP.version) + ". Updates kommen automatisch, sobald du online bist.</p></section>";
  html += '<section class="card tutor"><h2>Zurücksetzen</h2><p class="muted">Löscht alle Lektionen, Übungen und Quiz-Ergebnisse auf allen Geräten.</p>'
    + (S.confirmReset ? '<div class="confirm"><span>Wirklich alles löschen?</span><button class="btn small" style="color:var(--bad)" data-act="reset-yes">Ja, löschen</button><button class="btn small ghost" data-act="reset-no">Abbrechen</button></div>'
      : '<div class="row"><button class="btn small" data-act="reset">Fortschritt zurücksetzen</button></div>') + "</section>";
  return html + "</div>";
}

/* =====================================================================
   Editor
   ===================================================================== */
let ED = null;
function mountEditor() {
  const ta = $("#pg-code"), pre = $("#ed-hl"), gut = $("#gutter");
  const d = draft(S.lang);
  ta.value = d.code;
  const lang = S.lang;
  const paint = () => {
    pre.innerHTML = hl(ta.value, lang) + "\n";
    const n = ta.value.split("\n").length;
    let g = "";
    for (let i = 1; i <= n; i++) g += i + "\n";
    gut.textContent = g;
    syncScroll();
  };
  const syncScroll = () => {
    pre.style.transform = "translate(" + (-ta.scrollLeft) + "px," + (-ta.scrollTop) + "px)";
    gut.style.transform = "translateY(" + (-ta.scrollTop) + "px)";
  };
  let saveT;
  const persist = () => { clearTimeout(saveT); saveT = setTimeout(() => saveDraft(lang, { code: ta.value, stdin: $("#pg-stdin") ? $("#pg-stdin").value : "" }), 300); };
  ta.addEventListener("input", () => { paint(); persist(); });
  ta.addEventListener("scroll", syncScroll);
  $("#pg-stdin").addEventListener("input", persist);
  const indentUnit = lang === "js" ? "  " : "    ";
  const insert = (text) => {
    ta.focus();
    const s = ta.selectionStart, e = ta.selectionEnd;
    ta.setRangeText(text, s, e, "end");
    paint(); persist();
  };
  ta.addEventListener("keydown", (ev) => {
    if (ev.key === "Tab" && !ev.ctrlKey && !ev.altKey && !ev.metaKey) {
      ev.preventDefault();
      if (ev.shiftKey) {
        const s = ta.selectionStart, lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
        const lead = ta.value.slice(lineStart).match(/^ */)[0].length;
        const rm = Math.min(lead, indentUnit.length);
        if (rm) { ta.setRangeText("", lineStart, lineStart + rm, "preserve"); ta.selectionStart = ta.selectionEnd = Math.max(lineStart, s - rm); paint(); persist(); }
      } else insert(indentUnit);
    } else if (ev.key === "Enter" && !ev.isComposing) {
      ev.preventDefault();
      const s = ta.selectionStart;
      const lineStart = ta.value.lastIndexOf("\n", s - 1) + 1;
      const line = ta.value.slice(lineStart, s);
      let ind = line.match(/^[ \t]*/)[0];
      const trimmed = line.trimEnd();
      if (/[{(\[]$/.test(trimmed) || (lang === "py" && /:$/.test(trimmed))) ind += indentUnit;
      const after = ta.value.slice(s, s + 1);
      if (/[{(\[]$/.test(trimmed) && /[}\)\]]/.test(after)) {
        insert("\n" + ind + "\n" + ind.slice(indentUnit.length));
        ta.selectionStart = ta.selectionEnd = s + 1 + ind.length;
      } else insert("\n" + ind);
    } else if ((ev.ctrlKey || ev.metaKey) && ev.key === "Enter") {
      ev.preventDefault(); runCode();
    }
  });
  const kb = $("#keybar");
  kb.addEventListener("pointerdown", (ev) => { if (ev.target.closest("button")) ev.preventDefault(); });
  kb.addEventListener("click", (ev) => {
    const b = ev.target.closest("button"); if (!b) return;
    const k = b.dataset.key;
    insert(k === "\t" ? indentUnit : k);
  });
  $("#pg-example").addEventListener("change", (ev) => {
    const v = ev.target.value; if (!v) return;
    const [id, bi] = v.split(":");
    const { l } = lessonById(id);
    const b = l.body[+bi];
    setEditor(runnable(b[1], S.lang), (b[2] && b[2].stdin) || "");
    ev.target.value = "";
  });
  ED = { ta, paint, set: (code, stdin) => { ta.value = code; $("#pg-stdin").value = stdin || ""; if (stdin) $(".stdin").open = true; paint(); saveDraft(lang, { code, stdin: stdin || "" }); ta.scrollTop = 0; } };
  paint();
}
function setEditor(code, stdin) { if (ED) ED.set(code, stdin); }
function runnable(src, lang) {
  if (lang !== "c" || /\bmain\s*\(/.test(src)) return src;
  let body = src.split("\n").filter(l => !/^\s*#include/.test(l)).join("\n");
  // Typdefinitionen gehören vor main
  const types = [];
  body = body.replace(/^struct\s+\w+\s*\{[\s\S]*?^\};[ \t]*\n?/gm, (m) => { types.push(m.trim()); return ""; }).trim();
  return "#include <stdio.h>\n#include <string.h>\n#include <stdlib.h>\n\n" + (types.length ? types.join("\n\n") + "\n\n" : "") + "int main(void) {\n" + body.split("\n").map(l => l ? "    " + l : l).join("\n") + "\n    return 0;\n}\n";
}

/* =====================================================================
   Code ausführen
   ===================================================================== */
const CDN = {
  picoc: new URL("vendor/picoc.js", location.href).href,
  jscpp: "vendor/jscpp.min.js",
  sk: "vendor/skulpt.min.js",
  skstd: "vendor/skulpt-stdlib.js"
};
const scriptCache = {};
function loadScript(src) {
  if (!scriptCache[src]) {
    scriptCache[src] = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src; s.async = true;
      s.onload = resolve;
      s.onerror = () => { delete scriptCache[src]; reject(new Error("Der Interpreter konnte nicht geladen werden. Prüfe deine Internetverbindung.")); };
      document.head.appendChild(s);
    });
  }
  return scriptCache[src];
}
/* C: PicoC (WebAssembly) in einem Worker, damit Endlosschleifen abgebrochen werden können.
   Kann der Browser kein WebAssembly laden, springt JSCPP ein. */
let cEngine = "picoc";
function runPicoc(code, stdin, out, err, onStatus) {
  return new Promise((resolve) => {
    const w = new Worker("c-worker.js");
    let ended = false, timer;
    const end = (v) => { if (ended) return; ended = true; clearTimeout(timer); w.terminate(); resolve(v); };
    timer = setTimeout(() => end("unavailable"), 45000);
    w.onmessage = (e) => {
      const m = e.data;
      if (m.t === "ready") {
        if (onStatus) onStatus("läuft …");
        clearTimeout(timer);
        timer = setTimeout(() => { err("Abgebrochen: Das Programm lief länger als 6 Sekunden (Endlosschleife?).\n"); end("ok"); }, 6000);
      } else if (m.t === "out") {
        const pe = m.s.match(/^file\.c:(\d+):(\d+)\s+(.*)/);
        if (pe) err("Fehler in Zeile " + pe[1] + ", Spalte " + pe[2] + ": " + pe[3] + "\n");
        else out(m.s);
      } else if (m.t === "done") {
        end("ok");
      } else if (m.t === "unavailable") end("unavailable");
    };
    w.onerror = (e) => { e.preventDefault(); end("unavailable"); };
    w.postMessage({ code, stdin, url: CDN.picoc });
  });
}
async function runC(code, stdin, out, err, onStatus) {
  if (cEngine === "picoc") {
    const r = await runPicoc(code, stdin, out, err || out, onStatus);
    if (r === "ok") return 0;
    cEngine = "jscpp";
  }
  await loadScript(CDN.jscpp);
  const J = window.JSCPP && (window.JSCPP.run ? window.JSCPP : window.JSCPP.default);
  return J.run(code.replace(/\(\s*void\s*\)/g, "()"), stdin || "", { stdio: { write: (s) => out(String(s)) } });
}
async function runPy(code, stdin, out) {
  await loadScript(CDN.sk);
  await loadScript(CDN.skstd);
  const lines = stdin ? stdin.split("\n") : [];
  const start = Date.now();
  window.Sk.configure({
    output: (s) => out(s),
    read: (f) => { const files = window.Sk.builtinFiles && window.Sk.builtinFiles.files; if (!files || files[f] === undefined) throw "Datei nicht gefunden: " + f; return files[f]; },
    __future__: window.Sk.python3,
    inputfunTakesPrompt: true,
    inputfun: (p) => { const v = lines.length ? lines.shift() : ""; out((p || "") + v + "\n"); return v; },
    yieldLimit: 100
  });
  await window.Sk.misceval.asyncToPromise(
    () => window.Sk.importMainWithBody("<stdin>", false, code, true),
    { "*": () => { if (Date.now() - start > 6000) throw new Error("Zeitlimit von 6 Sekunden überschritten (Endlosschleife?)"); } }
  );
}
function runJS(code, stdin, out, err) {
  return new Promise((resolve) => {
    const w = new Worker("js-worker.js");
    let ended = false;
    const end = (msg) => { if (ended) return; ended = true; clearTimeout(timer); w.terminate(); if (msg) err(msg); resolve(); };
    const timer = setTimeout(() => end("Abgebrochen: Das Programm lief länger als 6 Sekunden (Endlosschleife oder offener Timer?).\n"), 6000);
    w.onmessage = (e) => { const { t, s } = e.data; if (t === "out") out(s); else if (t === "err") err(s); else if (t === "done") end(); };
    w.onerror = (e) => { e.preventDefault(); end((e.message || "Fehler") + "\n"); };
    w.postMessage({ code, stdin });
  });
}
function errText(e) {
  if (!e) return "Unbekannter Fehler";
  if (typeof e === "string") return e;
  if (e.toString && e.toString !== Object.prototype.toString) return e.toString();
  return e.message || String(e);
}
let running = false;
let lastRun = { out: "", err: "" };
async function runCode() {
  if (running || !ED) return;
  running = true;
  const code = ED.ta.value, stdin = $("#pg-stdin").value, lang = S.lang;
  const pre = $("#pg-out"), state = $("#run-state"), btn = $("#run-btn");
  pre.textContent = ""; state.textContent = "läuft …"; btn.disabled = true;
  let stdout = "", stderr = "";
  const out = (s) => { stdout += s; pre.appendChild(document.createTextNode(s)); pre.scrollTop = pre.scrollHeight; };
  const err = (s) => { stderr += s; const sp = document.createElement("span"); sp.className = "e"; sp.textContent = s; pre.appendChild(sp); pre.scrollTop = pre.scrollHeight; };
  const t0 = performance.now();
  try {
    if (lang === "c") {
      state.textContent = "lädt C-Interpreter …";
      const exit = await runC(code, stdin, out, err, (s) => { state.textContent = s; });
      if (exit !== 0 && exit !== undefined) err("\nProgramm beendet mit Code " + exit + "\n");
    } else if (lang === "py") {
      if (!window.Sk) state.textContent = "lädt Python …";
      await runPy(code, stdin, out);
    } else {
      await runJS(code, stdin, out, err);
    }
  } catch (e) {
    err((stdout && !stdout.endsWith("\n") ? "\n" : "") + errText(e) + "\n");
  }
  const ms = Math.round(performance.now() - t0);
  if (!stdout && !stderr) { const sp = document.createElement("span"); sp.className = "sys"; sp.textContent = "(keine Ausgabe)"; pre.appendChild(sp); }
  state.textContent = "fertig in " + ms + " ms";
  btn.disabled = false;
  running = false;
  lastRun = { out: stdout, err: stderr };
  touch();
  checkTask(stdout, stderr);
}
function norm(s) { const l = String(s).replace(/\r/g, "").split("\n").map(x => x.trimEnd()); while (l.length && !l[l.length - 1]) l.pop(); return l; }
function checkTask(stdout, stderr) {
  const t = S.task;
  if (!t || t.lang !== S.lang) return;
  const l = lessonById(t.id).l;
  const want = norm(l.task.expect), got = norm(stdout);
  const ok = !stderr.trim() && got.length >= want.length && want.every((w, i) => got[got.length - want.length + i] === w);
  t.result = ok ? "ok" : "no";
  if (ok && !P.task[t.id]) { P.task[t.id] = true; touch(); }
  // nur den Übungsbanner neu zeichnen, Editor bleibt erhalten
  const box = $(".pg-task");
  if (box) {
    const tmp = document.createElement("div");
    tmp.innerHTML = viewPlay();
    box.replaceWith(tmp.querySelector(".pg-task"));
  }
}

/* =====================================================================
   Claude (Tutor, Erklärungen, Code-Review, neue Fragen)
   ===================================================================== */
let samplePromise = null;
function getSample() {
  if (!samplePromise) samplePromise = (window.claude && window.claude.use) ? window.claude.use("sample").catch(() => null) : Promise.resolve(null);
  return samplePromise;
}
function aiOff() { S.ai = false; document.documentElement.dataset.ai = "0"; }
const ERR = {
  rate_limited: "Gerade zu viele Anfragen. Versuch es in einer Minute noch einmal.",
  session_expired: "Bitte melde dich bei Claude erneut an.",
  refused: "Claude hat diese Anfrage abgelehnt. Formuliere die Frage anders.",
  empty_completion: "Claude hat keine Antwort geschrieben. Frag etwas kürzer.",
  prompt_too_large: "Der Code ist zu lang für eine Frage. Kürze ihn etwas.",
  invalid_json: "Die Fragen kamen in einem unlesbaren Format. Versuch es noch einmal."
};
const HIDE = ["not_granted", "sampling_disabled", "not_declared", "capability_disabled", "capability_removed"];
let activeCtl = null;
async function ask(prompt, outEl, opts) {
  const sample = await getSample();
  if (!sample) { aiOff(); return; }
  if (activeCtl) activeCtl.abort();
  const ctl = new AbortController(); activeCtl = ctl;
  outEl.innerHTML = '<div class="thinking"><span class="dots">Claude denkt nach</span><button class="btn small ghost" type="button">Stopp</button></div>';
  outEl.querySelector("button").onclick = () => ctl.abort();
  try {
    await sample(prompt, Object.assign({ signal: ctl.signal, onText: ({ text }) => { outEl.innerHTML = md(text); } }, opts || {}));
  } catch (e) {
    const code = e && e.code;
    if (code === "cancelled") { outEl.innerHTML = e.text ? md(e.text) : ""; }
    else if (HIDE.includes(code)) { outEl.innerHTML = ""; aiOff(); }
    else outEl.innerHTML = (e && e.text ? md(e.text) : "") + '<p class="err">' + esc(ERR[code] || "Verbindung unterbrochen. Versuch es noch einmal.") + "</p>";
  } finally { if (activeCtl === ctl) activeCtl = null; }
}
function lessonText(l) {
  return l.body.map(b => b[0] === "code" ? "```\n" + b[1] + "\n```" : b[1]).join("\n\n");
}
const TUTOR_RULES = "Du bist ein geduldiger, sehr präziser Programmier-Tutor in der Lern-App Codepfad. Antworte auf Deutsch, klar gegliedert, mit kurzen Absätzen. Code steht immer in Markdown-Codeblöcken mit drei Backticks. Erkläre genau, warum etwas so ist, nicht nur wie. Bleib beim Thema der Lektion und passe die Tiefe an das Niveau an.";
function tutorAsk(question) {
  const found = lessonById(S.lessonId); if (!found) return;
  const { l, lang } = found;
  const prompt = TUTOR_RULES + "\n\nSprache: " + COURSES[lang].name + "\nNiveau: " + LEVELS[l.level] + "\nLektion: " + l.title + "\n\nInhalt der Lektion:\n" + lessonText(l) + "\n\nAnliegen des Lernenden: " + question;
  ask(prompt, $('[data-out="tutor"]'));
}
function findQuestion(key) {
  if (key.startsWith("qz-")) { const it = S.quiz && S.quiz.items.find(x => x.skey === key); return it ? { q: it.q, lang: S.lang } : null; }
  const [id, i] = key.split(":");
  const f = lessonById(id); return f ? { q: f.l.quiz[+i], lang: f.lang } : null;
}
function whyAsk(key) {
  const f = findQuestion(key); if (!f) return;
  const { q, lang } = f;
  const chosen = S.answers[key];
  const prompt = TUTOR_RULES + "\n\nEin Lernender hat diese Multiple-Choice-Frage zu " + COURSES[lang].name + " beantwortet.\nFrage: " + q.q + (q.code ? "\nCode:\n```\n" + q.code + "\n```" : "")
    + "\nOptionen:\n" + q.opts.map((o, i) => "- " + o + (i === q.a ? " (richtig)" : "")).join("\n")
    + "\nGewählt: " + q.opts[chosen] + (chosen === q.a ? " (richtig)" : " (falsch)")
    + "\n\nErkläre Schritt für Schritt, was hier passiert und warum die richtige Antwort stimmt" + (chosen === q.a ? "" : " und wo der Denkfehler bei der gewählten Antwort liegt") + ". Höchstens 180 Wörter.";
  ask(prompt, document.querySelector('[data-out="why-' + CSS.escape(key) + '"]'));
}
function reviewAsk() {
  const code = ED ? ED.ta.value : "";
  const t = S.task && S.task.lang === S.lang ? lessonById(S.task.id).l : null;
  const prompt = TUTOR_RULES + "\n\nPrüfe diesen " + COURSES[S.lang].name + "-Code eines Lernenden." + (t ? "\nAufgabe: " + t.task.prompt + "\nErwartete Ausgabe:\n" + t.task.expect : "")
    + "\n\nCode:\n```\n" + code.slice(0, 12000) + "\n```\n\nLetzte Ausgabe:\n```\n" + (lastRun.out + lastRun.err).slice(0, 3000) + "\n```"
    + "\n\nGib Feedback in drei Teilen: 1. Was funktioniert, 2. Fehler oder Risiken (mit Zeilenbezug), 3. Ein konkreter Verbesserungsvorschlag mit Code. "
    + (t ? "Verrate die vollständige Lösung nicht, wenn die Aufgabe noch nicht gelöst ist, sondern gib einen Hinweis." : "") + " Höchstens 250 Wörter.";
  ask(prompt, $('[data-out="review"]'));
}
async function generateQuestions() {
  const sample = await getSample();
  if (!sample) { aiOff(); return; }
  S.gen.busy = true; S.gen.error = ""; render();
  const lang = S.lang, level = S.gen.level;
  const prompt = "Erstelle 5 neue Multiple-Choice-Fragen auf Deutsch zur Programmiersprache " + COURSES[lang].name + " für das Niveau „" + LEVELS[level] + "“ "
    + "(Einsteiger = Grundlagen wie Ausgabe, Variablen, Bedingungen, Schleifen; Fortgeschritten = Funktionen, Datenstrukturen, Zeiger bzw. Referenzen; Profi = Speicher, Nebenläufigkeit, Sprachdetails, Fallstricke). "
    + "Mindestens 3 Fragen enthalten ein kurzes Code-Snippet (höchstens 8 Zeilen) und fragen nach der Ausgabe oder einem Fehler. Genau eine Option ist richtig, die falschen Optionen sind plausible typische Irrtümer. "
    + "Prüfe jede Antwort sorgfältig, sie muss exakt stimmen.\n"
    + 'Antworte nur mit einem JSON-Array aus 5 Objekten dieser Form: {"frage": string, "code": string (leer, wenn kein Code), "optionen": [4 strings], "richtig": Index 0-3, "erklaerung": string (1-3 Sätze)}';
  try {
    const data = await sample.json(prompt, { cache: false, modelTier: level === 3 ? "complex" : "default" });
    const items = (Array.isArray(data) ? data : []).filter(x => x && typeof x.frage === "string" && Array.isArray(x.optionen) && x.optionen.length === 4 && Number.isInteger(x.richtig) && x.richtig >= 0 && x.richtig < 4)
      .map(x => ({ key: null, from: "", generated: true, q: { q: x.frage, code: (x.code || "").trim() || undefined, opts: x.optionen.map(String), a: x.richtig, why: String(x.erklaerung || "") } }));
    S.gen.busy = false;
    if (!items.length) { S.gen.error = "Die Fragen kamen unvollständig an. Versuch es noch einmal."; render(); return; }
    startQuiz(items, "Neue Fragen von Claude · " + LEVELS[level]);
  } catch (e) {
    S.gen.busy = false;
    if (HIDE.includes(e && e.code)) { aiOff(); S.gen.error = ""; }
    else if (e && e.code !== "cancelled") S.gen.error = ERR[e.code] || "Verbindung unterbrochen. Versuch es noch einmal.";
    render();
  }
}

/* =====================================================================
   Ereignisse
   ===================================================================== */
document.addEventListener("click", (ev) => {
  const el = ev.target.closest("[data-act]");
  if (!el || el.tagName === "FORM") return;
  const act = el.dataset.act;
  switch (act) {
    case "nav": if (el.dataset.view === "quiz" && S.view !== "quiz" && S.quiz && S.quiz.pos >= S.quiz.items.length) S.quiz = null; go(el.dataset.view); break;
    case "lang":
      if (S.lang !== el.dataset.lang) {
        S.lang = el.dataset.lang; P.lang = S.lang; S.quiz = null; touch();
        if (S.view === "lesson") S.view = "path";
        render();
      }
      break;
    case "open": {
      const f = lessonById(el.dataset.id);
      if (f) { S.lang = f.lang; go("lesson", { lessonId: el.dataset.id }); }
      break;
    }
    case "try": {
      const { l, lang } = lessonById(el.dataset.id);
      const b = l.body[+el.dataset.b];
      S.lang = lang; S.task = null;
      saveDraft(lang, { code: runnable(b[1], lang), stdin: (b[2] && b[2].stdin) || "" });
      go("play");
      break;
    }
    case "task": {
      const { l, lang } = lessonById(el.dataset.id);
      S.lang = lang;
      S.task = { id: l.id, lang, result: null };
      saveDraft(lang, { code: l.task.starter, stdin: l.task.stdin || "" });
      go("play");
      break;
    }
    case "task-close": S.task = null; render(); break;
    case "complete": {
      const id = el.dataset.id;
      const { l, lang } = lessonById(id);
      if (!P.done[id]) { P.done[id] = true; touch(); }
      const ls = COURSES[lang].lessons, nx = ls[ls.indexOf(l) + 1];
      if (nx) go("lesson", { lessonId: nx.id }); else go("path");
      break;
    }
    case "answer": {
      const key = el.dataset.key, i = +el.dataset.i;
      if (S.answers[key] !== undefined) break;
      S.answers[key] = i;
      const f = findQuestion(key);
      const ok = f && i === f.q.a;
      if (key.startsWith("qz-")) {
        const it = S.quiz.items[S.quiz.pos];
        if (ok) S.quiz.right++; else S.quiz.wrong.push(it);
        if (it.key) P.quiz[it.key] = Math.max(P.quiz[it.key] || 0, ok ? 1 : 0);
        else if (ok) P.extra = (P.extra || 0) + 1;
      } else {
        P.quiz[key] = Math.max(P.quiz[key] || 0, ok ? 1 : 0);
      }
      touch();
      rerenderQuestion(key);
      break;
    }
    case "retry": delete S.answers[el.dataset.key]; rerenderQuestion(el.dataset.key); break;
    case "why": whyAsk(el.dataset.key); break;
    case "tutor": tutorAsk(el.dataset.q); break;
    case "qlevel": S.quizLevel = +el.dataset.v; render(); break;
    case "glevel": S.gen.level = +el.dataset.v; render(); break;
    case "quiz-start": {
      const pool = shuffle(poolFor(S.lang, S.quizLevel)).slice(0, 10);
      startQuiz(pool, COURSES[S.lang].name + " · " + (S.quizLevel ? LEVELS[S.quizLevel] : "Alle Stufen"));
      break;
    }
    case "quiz-next": S.quiz.pos++; render(); window.scrollTo(0, 0); break;
    case "quiz-wrong": startQuiz(S.quiz.wrong, "Wiederholung"); break;
    case "quit-quiz": S.quiz = null; render(); break;
    case "gen": if (!S.gen.busy) generateQuestions(); break;
    case "run": runCode(); break;
    case "review": reviewAsk(); break;
    case "pg-reset": {
      const t = S.task && S.task.lang === S.lang ? lessonById(S.task.id).l : null;
      setEditor(t ? t.task.starter : course().starter, t ? (t.task.stdin || "") : "");
      break;
    }
    case "reset": S.confirmReset = true; render(); break;
    case "reset-no": S.confirmReset = false; render(); break;
    case "reset-yes": {
      const lang = P.lang;
      P = blank(); P.lang = lang; S.answers = {}; S.confirmReset = false;
      P.updated = P.resetAt = Date.now(); saveLocal(); if (sync.ref) flush(); gSync();
      render();
      break;
    }
    case "export": {
      S.exportCode = "CP1." + btoa(unescape(encodeURIComponent(JSON.stringify(P))));
      S.exportNote = "";
      navigator.clipboard.writeText(S.exportCode).then(() => { S.exportNote = "Kopiert. Füge den Code auf dem anderen Gerät ein."; render(); })
        .catch(() => { S.exportNote = "Markiere den Code und kopiere ihn von Hand."; render(); const t = $("#export-code"); if (t) t.select(); });
      render();
      break;
    }
    case "import": {
      const raw = ($("#import-code").value || "").trim();
      try {
        if (!raw.startsWith("CP1.")) throw new Error();
        const data = JSON.parse(decodeURIComponent(escape(atob(raw.slice(4)))));
        P = merge(P, Object.assign(blank(), data));
        touch();
        S.importNote = "Übernommen. Dein Stand ist jetzt zusammengeführt.";
      } catch (e) { S.importNote = "Der Code ist ungültig. Kopiere ihn noch einmal vollständig."; }
      render();
      break;
    }
    case "gsync": S.gNote = ""; gSync(); break;
    case "gcopy":
      navigator.clipboard.writeText(G.token).then(() => { S.gNote = "Schlüssel kopiert. Füge ihn auf dem anderen Gerät unter Fortschritt ein."; render(); })
        .catch(() => { S.gNote = "Kopieren ging nicht. Erstelle für das andere Gerät einfach einen neuen Schlüssel bei GitHub."; render(); });
      break;
    case "gdisconnect": S.confirmDisconnect = true; render(); break;
    case "gdisconnect-no": S.confirmDisconnect = false; render(); break;
    case "gdisconnect-yes": G = null; gSave(); S.confirmDisconnect = false; S.gNote = ""; sync.state = sync.ref ? "synced" : "local"; render(); break;
    case "install": if (installEvent) { installEvent.prompt(); installEvent.userChoice.finally(() => { installEvent = null; render(); }); } break;
    case "reload":
      navigator.serviceWorker.getRegistration().then((r) => { if (r && r.waiting) r.waiting.postMessage("skip"); else location.reload(); });
      break;
  }
});
document.addEventListener("submit", async (ev) => {
  if (ev.target.closest("[data-act='gconnect-form']")) {
    ev.preventDefault();
    const token = $("#gtoken").value.trim();
    if (!token) return;
    S.gBusyConnect = true; S.gNote = ""; render();
    try { await gConnect(token); S.gNote = "Verbunden. Dein Fortschritt wird ab jetzt automatisch abgeglichen."; }
    catch (e) { G = null; gSave(); S.gNote = e && e.code === "auth" ? "GitHub hat den Schlüssel abgelehnt. Prüfe, ob „gist“ angehakt war, und kopiere ihn vollständig." : "Keine Verbindung zu GitHub. Prüfe dein Internet und versuch es noch einmal."; }
    S.gBusyConnect = false; render();
    return;
  }
  const f = ev.target.closest("[data-act='tutor-form']");
  if (!f) return;
  ev.preventDefault();
  const inp = $("#tutor-q");
  const q = inp.value.trim();
  if (q) { tutorAsk(q); inp.value = ""; }
});
function rerenderQuestion(key) {
  const node = document.querySelector('.q[data-qkey="' + CSS.escape(key) + '"]');
  if (S.view === "quiz") { render(); return; }
  if (!node) { render(); return; }
  const f = findQuestion(key);
  const tmp = document.createElement("div");
  tmp.innerHTML = questionHTML(key, f.q, f.lang);
  node.replaceWith(tmp.firstElementChild);
  // Zähler "x/3 richtig" aktualisieren
  const found = lessonById(S.lessonId);
  const cnt = document.querySelector(".card .section-title .muted");
  if (found && cnt) cnt.textContent = found.l.quiz.filter((q, i) => P.quiz[found.l.id + ":" + i] === 1).length + "/" + found.l.quiz.length + " richtig";
}

/* =====================================================================
   Start
   ===================================================================== */
let installEvent = null;
window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); installEvent = e; if (S.view === "prog") render(); });
window.addEventListener("appinstalled", () => { installEvent = null; });

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (!reloading) { reloading = true; location.reload(); } });
  navigator.serviceWorker.register("sw.js").then((reg) => {
    const offer = (w) => {
      if (!w || !navigator.serviceWorker.controller) return;
      const bar = document.createElement("div");
      bar.className = "update-bar";
      bar.innerHTML = "<span>Neue Version von Codepfad verfügbar.</span><button class=\"btn small primary\" data-act=\"reload\">Jetzt aktualisieren</button>";
      document.body.appendChild(bar);
    };
    if (reg.waiting) offer(reg.waiting);
    reg.addEventListener("updatefound", () => {
      const w = reg.installing;
      w.addEventListener("statechange", () => { if (w.state === "installed") offer(w); });
    });
    setInterval(() => reg.update().catch(() => {}), 30 * 60 * 1000);
  }).catch(() => {});
}

render();
initSync();
gSync();
getSample().then((s) => { if (s) { S.ai = true; document.documentElement.dataset.ai = "1"; } });
