type TokenResponse = {
  access_token?: string;
  expires_in?: number;
  error?: string;
};
type TokenClient = {
  requestAccessToken: (options: { prompt: string }) => void;
};
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (options: {
            client_id: string;
            scope: string;
            callback: (r: TokenResponse) => void;
            error_callback: () => void;
          }) => TokenClient;
        };
      };
      picker: PickerSDK;
    };
    gapi?: { load: (name: string, callback: () => void) => void };
  }
}
interface PickerDocument {
  id: string;
}
interface PickerData {
  action: string;
  docs?: PickerDocument[];
}
interface PickerBuilder {
  setOAuthToken(t: string): this;
  setDeveloperKey(t: string): this;
  setAppId(t: string): this;
  addView(v: unknown): this;
  setCallback(cb: (data: PickerData) => void): this;
  setLocale(locale: string): this;
  build(): { setVisible(v: boolean): void };
}
interface DocsView {
  setMimeTypes(mime: string): this;
  setMode(mode: string): this;
}
interface PickerSDK {
  PickerBuilder: new () => PickerBuilder;
  DocsView: new (id: string) => DocsView;
  DocsViewMode: { LIST: string };
  ViewId: { DOCS_VIDEOS: string };
  Action: { PICKED: string; CANCEL: string };
}
export const configured = !!(
  import.meta.env.VITE_GOOGLE_CLIENT_ID &&
  import.meta.env.VITE_GOOGLE_API_KEY &&
  import.meta.env.VITE_GOOGLE_APP_ID
);
let token = "",
  expires = 0,
  client: TokenClient | undefined,
  inflight: Promise<string> | undefined;
const listeners = new Set<(token: string) => void>();
export const onToken = (fn: (t: string) => void) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};
export function seedToken(value: string) {
  token = value;
  expires = Date.now() + 3600000;
  listeners.forEach((fn) => fn(token));
}
function script(src: string) {
  return new Promise<void>((resolve, reject) => {
    const old = document.querySelector<HTMLScriptElement>(
      'script[src="' + src + '"]',
    );
    if (old?.dataset.loaded) return resolve();
    const s = old || document.createElement("script");
    s.onload = () => {
      s.dataset.loaded = "1";
      resolve();
    };
    s.onerror = () => {
      s.remove();
      reject(new Error("Google ログインできませんでした"));
    };
    if (!old) {
      s.src = src;
      s.async = true;
      document.head.append(s);
    }
  });
}
export async function accessToken(
  force = false,
  interactive = false,
): Promise<string> {
  if (!force && token && Date.now() < expires - 60000) return token;
  if (inflight) return inflight;
  inflight = (async () => {
    await script("https://accounts.google.com/gsi/client");
    return new Promise<string>((resolve, reject) => {
      client = window.google!.accounts.oauth2.initTokenClient({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (r) => {
          if (!r.access_token || r.error)
            return reject(new Error("Google ログインできませんでした"));
          token = r.access_token;
          expires = Date.now() + (r.expires_in || 3600) * 1000;
          listeners.forEach((fn) => fn(token));
          resolve(token);
        },
        error_callback: () =>
          reject(new Error("Google ログインできませんでした")),
      });
      client.requestAccessToken({ prompt: interactive ? "consent" : "" });
    });
  })();
  try {
    return await inflight;
  } finally {
    inflight = undefined;
  }
}
export async function pickVideo(): Promise<string | null> {
  const t = await accessToken(false, true);
  await script("https://apis.google.com/js/api.js");
  await new Promise<void>((r) => window.gapi!.load("picker", r));
  const p = window.google!.picker;
  return new Promise((resolve) =>
    new p.PickerBuilder()
      .setOAuthToken(t)
      .setDeveloperKey(import.meta.env.VITE_GOOGLE_API_KEY)
      .setAppId(import.meta.env.VITE_GOOGLE_APP_ID)
      .setLocale("ja")
      .addView(
        new p.DocsView(p.ViewId.DOCS_VIDEOS)
          .setMode(p.DocsViewMode.LIST)
          .setMimeTypes("video/mp4,video/quicktime"),
      )
      .setCallback((data) => {
        if (data.action === p.Action.PICKED)
          resolve(data.docs?.[0]?.id || null);
        if (data.action === p.Action.CANCEL) resolve(null);
      })
      .build()
      .setVisible(true),
  );
}
