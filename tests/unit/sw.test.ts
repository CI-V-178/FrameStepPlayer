import { it, expect, vi } from "vitest";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
async function worker(fetcher: ReturnType<typeof vi.fn>) {
  const listeners: Record<string, (e: any) => void> = {};
  const self = {
    addEventListener: (name: string, fn: (e: any) => void) => {
      listeners[name] = fn;
    },
    location: { origin: "https://app.test" },
    clients: { claim: vi.fn(), get: vi.fn() },
    skipWaiting: vi.fn(),
  };
  const cache = { match: vi.fn(), put: vi.fn() };
  runInNewContext(await readFile("public/sw.js", "utf8"), {
    self,
    fetch: fetcher,
    Headers,
    Response,
    URL,
    crypto,
    setTimeout,
    clearTimeout,
    caches: { open: async () => cache, keys: async () => [], delete: vi.fn() },
  });
  return {
    listeners,
    self,
    cache,
    request: async (
      path: string,
      clientId = "tab-a",
      headers: Record<string, string> = {},
    ) => {
      let promise: Promise<Response> | undefined;
      listeners.fetch({
        request: new Request("https://app.test" + path, { headers }),
        clientId,
        respondWith: (p: Promise<Response>) => {
          promise = p;
        },
      });
      return promise;
    },
  };
}
it("SWはRangeと206を維持し、クライアントごとのメモリトークンを使う", async () => {
  const response = new Response("bytes", {
      status: 206,
      headers: { "Content-Range": "bytes 2-6/10" },
    }),
    f = vi.fn().mockResolvedValue(response),
    w = await worker(f);
  w.listeners.message({
    source: { id: "tab-a" },
    data: { type: "TOKEN", token: "a" },
  });
  w.listeners.message({
    source: { id: "tab-b" },
    data: { type: "TOKEN", token: "b" },
  });
  expect(
    await w.request("/drive-stream/video", "tab-a", { Range: "bytes=2-6" }),
  ).toBe(response);
  expect(f.mock.calls[0][1].headers.get("Range")).toBe("bytes=2-6");
  expect(f.mock.calls[0][1].headers.get("Authorization")).toBe("Bearer a");
  expect(f.mock.calls[0][0]).toContain("supportsAllDrives=true");
  await w.request("/drive-stream/video", "tab-b");
  expect(f.mock.calls[1][1].headers.get("Authorization")).toBe("Bearer b");
});
it("SWの401はページからトークンを再取得して1回だけ再送", async () => {
  const f = vi
      .fn()
      .mockResolvedValueOnce(new Response("", { status: 401 }))
      .mockResolvedValueOnce(new Response("ok", { status: 206 })),
    w = await worker(f);
  w.listeners.message({
    source: { id: "tab-a" },
    data: { type: "TOKEN", token: "old" },
  });
  w.self.clients.get.mockResolvedValue({
    postMessage: (data: any) =>
      w.listeners.message({
        source: { id: "tab-a" },
        data: { type: "TOKEN_REPLY", requestId: data.requestId, token: "new" },
      }),
  });
  expect((await w.request("/drive-stream/v"))?.status).toBe(206);
  expect(f).toHaveBeenCalledTimes(2);
  expect(f.mock.calls[1][1].headers.get("Authorization")).toBe("Bearer new");
});
it("assetsだけキャッシュし、APIや動画をキャッシュしない", async () => {
  const f = vi.fn().mockResolvedValue(new Response("asset")),
    w = await worker(f);
  await w.request("/assets/app.js");
  expect(w.cache.put).toHaveBeenCalledTimes(1);
  expect(await w.request("/other.mp4")).toBeUndefined();
});
