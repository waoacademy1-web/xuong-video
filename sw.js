const V = "xuong-gh28", FILES = ["./quan-ly-ma.html", "./icon-ma.png", "./icon-ma-512.png", "./manifest-ma.json", "./fonts.css", "./fonts/be-vietnam-pro-latin-500-normal.woff2", "./fonts/be-vietnam-pro-latin-700-normal.woff2", "./fonts/be-vietnam-pro-latin-800-normal.woff2", "./fonts/be-vietnam-pro-latin-900-normal.woff2", "./fonts/be-vietnam-pro-latin-ext-500-normal.woff2", "./fonts/be-vietnam-pro-latin-ext-700-normal.woff2", "./fonts/be-vietnam-pro-latin-ext-800-normal.woff2", "./fonts/be-vietnam-pro-latin-ext-900-normal.woff2", "./fonts/be-vietnam-pro-vietnamese-500-normal.woff2", "./fonts/be-vietnam-pro-vietnamese-700-normal.woff2", "./fonts/be-vietnam-pro-vietnamese-800-normal.woff2", "./fonts/be-vietnam-pro-vietnamese-900-normal.woff2", "./fonts/playfair-display-latin-700-italic.woff2", "./fonts/playfair-display-latin-900-italic.woff2", "./fonts/playfair-display-latin-ext-700-italic.woff2", "./fonts/playfair-display-latin-ext-900-italic.woff2", "./fonts/playfair-display-vietnamese-700-italic.woff2", "./fonts/playfair-display-vietnamese-900-italic.woff2", "./icon.png", "./index.html", "./lib/mp4-muxer.js", "./lib/ort.bundle.min.mjs", "./manifest.json", "./ocr/tesseract-core-lstm.wasm.js", "./ocr/tesseract-core-simd-lstm.wasm.js", "./ocr/tesseract.min.js", "./ocr/vie_chu.wasm", "./ocr/worker.min.js", "./phan_4/tts/kk_am.json", "./phan_4/tts/kk_giong.wasm", "./phan_4/tts/kk_giong_bac.wasm", "./phan_1/tts/kk_mo_hinh_0.wasm", "./phan_1/tts/kk_mo_hinh_1.wasm", "./phan_2/tts/kk_mo_hinh_2.wasm", "./phan_2/tts/kk_mo_hinh_3.wasm", "./phan_3/tts/kk_mo_hinh_4.wasm", "./phan_3/tts/kk_mo_hinh_5.wasm", "./phan_4/tts/ort-wasm-simd-threaded.wasm"];
// trang (index.html) luôn lấy bản mới khi có mạng; file nặng (giọng, phông, thư viện) lấy lại từ bộ nhớ cũ, không tải lại
const FRESH = f => f.endsWith("/") || f.endsWith("index.html") || f.endsWith("manifest.json") || f.endsWith("quan-ly-ma.html") || f.endsWith("manifest-ma.json");
self.addEventListener("install", e => e.waitUntil((async () => {
  const c = await caches.open(V);
  for (const f of FILES) {
    if (!FRESH(f) && await c.match(f)) continue;
    try {
      const old = !FRESH(f) && await caches.match(f);
      if (old) await c.put(f, old); else await c.add(new Request(f, { cache: "reload" }));
    } catch (err) { }
  }
  self.skipWaiting();
})()));
self.addEventListener("activate", e => e.waitUntil((async () => {
  for (const k of await caches.keys()) if (k.startsWith("xuong-") && k !== V) await caches.delete(k);
  await self.clients.claim();
})()));
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(V), p = u.pathname.endsWith("/") ? u.pathname + "index.html" : u.pathname;
    if (e.request.mode === "navigate" || p.endsWith("/index.html")) {
      // có mạng: lấy trang mới (chờ tối đa 5 giây), không mạng: dùng trang đã lưu
      try {
        const r = await Promise.race([fetch(p, { cache: "no-store" }), new Promise((_, no) => setTimeout(() => no(new Error("chậm")), 5000))]);
        if (r.ok) { c.put(p, r.clone()); return r; }
      } catch (err) { }
      return (await c.match(p, { ignoreSearch: true })) || (await caches.match(p, { ignoreSearch: true })) || (await c.match("index.html")) || Response.error();
    }
    const hit = (await c.match(p, { ignoreSearch: true })) || (await caches.match(p, { ignoreSearch: true }));
    if (hit) return hit;
    try { const r = await fetch(e.request); if (r.ok) c.put(p, r.clone()); return r; }
    catch (err) { return Response.error(); }
  })());
});
