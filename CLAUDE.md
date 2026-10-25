# Codepfad

Lern-App für C, Python und JavaScript. Installierbare Web-App (PWA) auf GitHub Pages plus Android-APK (WebView-Hülle, die die Pages-Adresse lädt).

## Aufbau
- `index.html`, `styles.css`, `app.js`: Oberfläche und Logik (Vanilla JS, keine Build-Schritte).
- `lessons/<sprache>.js`: Kursinhalte. Jede Lektion: `id`, `level` (1–3), `title`, `mins`, `body` (Blöcke `["p", text]`, `["code", quelltext, {run:false, stdin}]`, `["tip", text]`), `quiz` (`q`, optional `code`, `opts` (4), `a` (Index), `why`), `task` (`prompt`, `starter`, optional `stdin`, `expect`).
- Neue Sprache: `lessons/<key>.js` anlegen, in `index.html` einbinden, in `LANG_ORDER`, `KW`, `RX` in `app.js` ergänzen, Interpreter in `runCode` verdrahten, Datei in `CORE` von `sw.js` und in `pages.yml` aufnehmen.
- `c-worker.js` (PicoC/WebAssembly), `js-worker.js`: Ausführung in Workern. `vendor/`: Interpreter (picoc-web 1.1.0, skulpt 1.2.0, JSCPP 2.0.6 als Rückfall).
- `sw.js`: Offline-Cache. **Bei jeder Änderung `CACHE` in `sw.js` und `APP.version` in `app.js` erhöhen**, sonst sehen installierte Apps das Update erst spät.
- `android/`: WebView-App. Wird nur neu gebaut, wenn sich `android/` ändert (`.github/workflows/android.yml`); Inhalte aktualisieren sich über die Web-App.

## Prüfen
- Übungen: Für jede neue Aufgabe muss eine richtige Lösung `expect` treffen und der `starter` darf es nicht.
- Lokal testen: `python -m http.server` im Projektordner, dann http://localhost:8000.

## Veröffentlichen
Commit auf `main` und pushen. `pages.yml` veröffentlicht die Web-App, `android.yml` baut bei Änderungen in `android/` die APK und hängt sie an das Release `apk`.
