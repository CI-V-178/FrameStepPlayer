import { it, expect, vi, afterEach } from "vitest";
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.resetModules();
});
it("drive.fileのみ・401を1回再認証・以後は打ち切る", async () => {
  vi.resetModules();
  let options: Record<string, unknown> = {},
    prompt: unknown;
  vi.stubGlobal("document", {
    querySelector: () => ({ dataset: { loaded: "1" } }),
  });
  vi.stubGlobal("window", {
    google: {
      accounts: {
        oauth2: {
          initTokenClient: (o: Record<string, unknown>) => {
            options = o;
            return {
              requestAccessToken: (p: unknown) => {
                prompt = p;
                (o.callback as (r: unknown) => void)({
                  access_token: "renewed",
                  expires_in: 3600,
                });
              },
            };
          },
        },
      },
    },
  });
  const auth = await import("../../src/features/drive/auth");
  auth.seedToken("initial");
  const fetcher = vi
    .fn()
    .mockResolvedValueOnce(new Response("", { status: 401 }))
    .mockResolvedValueOnce(new Response("{}"));
  vi.stubGlobal("fetch", fetcher);
  const { driveFetch } = await import("../../src/features/drive/api");
  await driveFetch("https://www.googleapis.com/test");
  expect(options.scope).toBe("https://www.googleapis.com/auth/drive.file");
  expect(prompt).toEqual({ prompt: "" });
  expect(
    (fetcher.mock.calls[1][1].headers as Headers).get("Authorization"),
  ).toBe("Bearer renewed");
  fetcher.mockReset().mockResolvedValue(new Response("", { status: 401 }));
  await expect(
    driveFetch("https://www.googleapis.com/test"),
  ).rejects.toMatchObject({ status: 401 });
  expect(fetcher).toHaveBeenCalledTimes(2);
});
it("Pickerにトークン・APIキー・App ID・動画MIMEを指定", async () => {
  vi.resetModules();
  vi.stubEnv("VITE_GOOGLE_APP_ID", "123");
  vi.stubEnv("VITE_GOOGLE_API_KEY", "key");
  const received: Record<string, unknown> = {};
  let cb: (d: unknown) => void = () => {};
  class Builder {
    setOAuthToken(t: string) {
      received.token = t;
      return this;
    }
    setDeveloperKey(t: string) {
      received.key = t;
      return this;
    }
    setAppId(t: string) {
      received.app = t;
      return this;
    }
    setLocale() {
      return this;
    }
    addView() {
      return this;
    }
    setCallback(fn: (d: unknown) => void) {
      cb = fn;
      return this;
    }
    build() {
      return {
        setVisible: () => cb({ action: "picked", docs: [{ id: "video" }] }),
      };
    }
  }
  vi.stubGlobal("document", {
    querySelector: () => ({ dataset: { loaded: "1" } }),
  });
  vi.stubGlobal("window", {
    gapi: { load: (_: string, r: () => void) => r() },
    google: {
      picker: {
        PickerBuilder: Builder,
        DocsView: class {
          setMode(mode: string) {
            received.mode = mode;
            return this;
          }
          setMimeTypes(m: string) {
            received.mime = m;
            return this;
          }
        },
        DocsViewMode: { LIST: "list" },
        ViewId: { DOCS_VIDEOS: "videos" },
        Action: { PICKED: "picked", CANCEL: "cancel" },
      },
    },
  });
  const auth = await import("../../src/features/drive/auth");
  auth.seedToken("token");
  expect(await auth.pickVideo()).toBe("video");
  expect(received).toEqual({
    token: "token",
    key: "key",
    app: "123",
    mime: "video/mp4,video/quicktime",
    mode: "list",
  });
});
