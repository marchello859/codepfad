const fmt = (v, d = 0) => {
  if (typeof v === "string") return d ? "'" + v + "'" : v;
  if (typeof v === "function") return "[Function " + (v.name || "anonym") + "]";
  if (Array.isArray(v)) return d > 2 ? "[Array]" : (v.length ? "[ " + v.map(x => fmt(x, d + 1)).join(", ") + " ]" : "[]");
  if (v instanceof Error) return v.name + ": " + v.message;
  if (v instanceof Promise) return "Promise { <pending> }";
  if (v instanceof Map) return "Map(" + v.size + ") { " + [...v].map(([k, x]) => fmt(k, d + 1) + " => " + fmt(x, d + 1)).join(", ") + " }";
  if (v instanceof Set) return "Set(" + v.size + ") { " + [...v].map(x => fmt(x, d + 1)).join(", ") + " }";
  if (v && typeof v === "object") {
    if (d > 2) return "[Object]";
    const name = v.constructor && v.constructor !== Object ? v.constructor.name + " " : "";
    const keys = Object.keys(v);
    return name + (keys.length ? "{ " + keys.map(k => k + ": " + fmt(v[k], d + 1)).join(", ") + " }" : "{}");
  }
  if (typeof v === "bigint") return v + "n";
  if (Object.is(v, -0)) return "-0";
  return String(v);
};
const send = (t, s) => postMessage({ t, s });
const line = (a) => a.map(x => fmt(x)).join(" ") + "\n";
console.log = console.info = console.debug = (...a) => send("out", line(a));
console.warn = console.error = (...a) => send("err", line(a));
console.table = (x) => send("out", fmt(x) + "\n");
const fail = (err) => send("err", (err && err.name ? err.name + ": " + err.message : "Fehler: " + fmt(err)) + "\n");
self.onunhandledrejection = (ev) => { ev.preventDefault(); fail(ev.reason); };
self.onmessage = async (e) => {
  const lines = e.data.stdin ? e.data.stdin.split("\n") : [];
  self.prompt = () => (lines.length ? lines.shift() : null);
  const st = setTimeout, ct = clearTimeout, si = setInterval, ci = clearInterval;
  const live = new Set();
  let mainDone = false, finished = false;
  const check = () => {
    if (mainDone && !live.size && !finished) st(() => { if (!live.size && !finished) { finished = true; send("done"); } }, 0);
  };
  self.setTimeout = (f, ms, ...a) => {
    const id = st(() => { live.delete(id); try { if (typeof f === "function") f(...a); } catch (err) { fail(err); } check(); }, ms);
    live.add(id); return id;
  };
  self.clearTimeout = (id) => { live.delete(id); ct(id); check(); };
  self.setInterval = (f, ms, ...a) => {
    const id = si(() => { try { f(...a); } catch (err) { fail(err); } }, Math.max(ms || 0, 10));
    live.add(id); return id;
  };
  self.clearInterval = (id) => { live.delete(id); ci(id); check(); };
  try {
    const AsyncFn = Object.getPrototypeOf(async function () {}).constructor;
    await new AsyncFn(e.data.code)();
  } catch (err) { fail(err); }
  mainDone = true;
  check();
};
