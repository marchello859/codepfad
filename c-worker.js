self.document = { baseURI: new URL("vendor/", self.location.href).href, currentScript: null };
self.onmessage = async (e) => {
  try { importScripts(e.data.url); } catch (err) { postMessage({ t: "unavailable", s: String(err) }); return; }
  postMessage({ t: "ready" });
  const input = e.data.stdin || "";
  let i = 0;
  try {
    await self.picocjs.RunInteractively(e.data.code, () => (i < input.length ? input.charCodeAt(i++) : null), (txt) => postMessage({ t: "out", s: txt + "\n" }));
    postMessage({ t: "done" });
  } catch (err) {
    postMessage({ t: "unavailable", s: String(err && err.message || err) });
  }
};
