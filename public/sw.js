const CACHE = "framestep-assets-v1";
const tokens = new Map(),
  waiting = new Map();
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) =>
  event.waitUntil(
    (async () => {
      await self.clients.claim();
      for (const name of await caches.keys())
        if (name.startsWith("framestep-assets-") && name !== CACHE)
          await caches.delete(name);
    })(),
  ),
);
self.addEventListener("message", (event) => {
  if (event.data?.type === "TOKEN" && event.source?.id)
    tokens.set(event.source.id, event.data.token);
  if (event.data?.type === "TOKEN_REPLY") {
    const pending = waiting.get(event.data.requestId);
    if (pending && event.source?.id === pending.clientId) {
      tokens.set(event.source.id, event.data.token);
      pending.resolve(event.data.token);
      waiting.delete(event.data.requestId);
    }
  }
});
async function refresh(clientId) {
  const client = await self.clients.get(clientId);
  if (!client) return "";
  return new Promise((resolve) => {
    const requestId = crypto.randomUUID();
    const timer = setTimeout(() => {
      waiting.delete(requestId);
      resolve("");
    }, 8000);
    waiting.set(requestId, {
      clientId,
      resolve: (token) => {
        clearTimeout(timer);
        resolve(token);
      },
    });
    client.postMessage({ type: "TOKEN_REQUEST", requestId });
  });
}
async function stream(event, id) {
  const clientId = event.clientId;
  let token = tokens.get(clientId) || (await refresh(clientId));
  for (let attempt = 0; attempt < 2; attempt++) {
    if (!token) return new Response("", { status: 401 });
    const headers = new Headers({ Authorization: "Bearer " + token });
    const range = event.request.headers.get("Range");
    if (range) headers.set("Range", range);
    const response = await fetch(
      "https://www.googleapis.com/drive/v3/files/" +
        encodeURIComponent(id) +
        "?alt=media&supportsAllDrives=true",
      { headers },
    );
    if (response.status !== 401 || attempt === 1) return response;
    token = await refresh(clientId);
  }
  return new Response("", { status: 401 });
}
self.addEventListener("fetch", (event) => {
  const u = new URL(event.request.url);
  if (u.origin !== self.location.origin || event.request.method !== "GET")
    return;
  if (u.pathname.startsWith("/drive-stream/")) {
    event.respondWith(stream(event, decodeURIComponent(u.pathname.slice(14))));
    return;
  }
  if (u.pathname.startsWith("/assets/"))
    event.respondWith(
      (async () => {
        const cache = await caches.open(CACHE),
          hit = await cache.match(event.request);
        if (hit) return hit;
        const response = await fetch(event.request);
        if (response.ok) await cache.put(event.request, response.clone());
        return response;
      })(),
    );
  else if (event.request.mode === "navigate")
    event.respondWith(fetch(event.request));
});
