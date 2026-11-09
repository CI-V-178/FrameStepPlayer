import { accessToken } from "./auth";
import { memoName } from "../memo/vtt";
export interface DriveFile {
  id: string;
  name: string;
  size: string;
  mimeType: string;
  parents?: string[];
  createdTime?: string;
  videoMediaMetadata?: { durationMillis?: string };
}
export class DriveError extends Error {
  constructor(public status: number) {
    super("Google ドライブ API: " + status);
  }
}
const base = "https://www.googleapis.com/drive/v3/files";
export async function driveFetch(
  url: string,
  init: RequestInit = {},
): Promise<Response> {
  for (let attempt = 0; attempt < 2; attempt++) {
    const headers = new Headers(init.headers);
    headers.set(
      "Authorization",
      "Bearer " + (await accessToken(attempt === 1)),
    );
    const r = await fetch(url, { ...init, headers });
    if (r.status === 401 && attempt === 0) continue;
    if (!r.ok) throw new DriveError(r.status);
    return r;
  }
  throw new DriveError(401);
}
export const metadata = async (id: string): Promise<DriveFile> =>
  (
    await driveFetch(
      base +
        "/" +
        encodeURIComponent(id) +
        "?fields=id,name,size,mimeType,parents,createdTime,videoMediaMetadata(durationMillis)&supportsAllDrives=true",
    )
  ).json();
export const mediaUrl = (id: string) =>
  base + "/" + encodeURIComponent(id) + "?alt=media&supportsAllDrives=true";
export const range = async (id: string, start: number, end: number) =>
  (
    await driveFetch(mediaUrl(id), {
      headers: { Range: "bytes=" + start + "-" + end },
    })
  ).arrayBuffer();
const escaped = (s: string) => s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
async function list(q: string) {
  return (
    await (
      await driveFetch(
        base +
          "?" +
          new URLSearchParams({
            q: q + " and trashed=false",
            fields: "files(id,name,parents)",
            supportsAllDrives: "true",
            includeItemsFromAllDrives: "true",
          }),
      )
    ).json()
  ).files as { id: string; name: string; parents?: string[] }[];
}
export async function findMemo(videoId: string) {
  const files = await list(
    "appProperties has { key='framestepVideoId' and value='" +
      escaped(videoId) +
      "' }",
  );
  return files[0] || null;
}
export const readMemo = async (id: string) =>
  (await driveFetch(mediaUrl(id))).text();
let fallbackFolder: string | undefined;
async function folder() {
  if (fallbackFolder) return fallbackFolder;
  const found = await list(
    "appProperties has { key='framestepFolder' and value='1' }",
  );
  if (found[0]) return (fallbackFolder = found[0].id);
  const r = await driveFetch(base + "?supportsAllDrives=true", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: "FrameStep メモ",
      mimeType: "application/vnd.google-apps.folder",
      appProperties: { framestepFolder: "1" },
    }),
  });
  return (fallbackFolder = (await r.json()).id as string);
}
export async function saveMemo(
  video: DriveFile,
  id: string | undefined,
  vtt: string,
): Promise<string> {
  if (id) {
    await driveFetch(
      "https://www.googleapis.com/upload/drive/v3/files/" +
        encodeURIComponent(id) +
        "?uploadType=media&supportsAllDrives=true",
      {
        method: "PATCH",
        headers: { "Content-Type": "text/vtt; charset=UTF-8" },
        body: vtt,
      },
    );
    return id;
  }
  const create = async (parent: string | undefined) => {
    const boundary = "framestep_" + crypto.randomUUID();
    const metadata = {
      name: memoName(video.name),
      mimeType: "text/vtt",
      ...(parent ? { parents: [parent] } : {}),
      appProperties: { framestepVideoId: video.id },
    };
    const body =
      "--" +
      boundary +
      "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      "\r\n--" +
      boundary +
      "\r\nContent-Type: text/vtt; charset=UTF-8\r\n\r\n" +
      vtt +
      "\r\n--" +
      boundary +
      "--";
    return (
      await (
        await driveFetch(
          "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
          {
            method: "POST",
            headers: {
              "Content-Type": "multipart/related; boundary=" + boundary,
            },
            body,
          },
        )
      ).json()
    ).id as string;
  };
  if (fallbackFolder) return create(fallbackFolder);
  try {
    return await create(video.parents?.[0]);
  } catch (e) {
    if (e instanceof DriveError && (e.status === 403 || e.status === 404))
      return create(await folder());
    throw e;
  }
}
export async function downloadVideo(
  file: DriveFile,
  progress: (n: number) => void,
) {
  const response = await driveFetch(mediaUrl(file.id)),
    reader = response.body?.getReader();
  if (!reader) return response.blob();
  const chunks: Uint8Array<ArrayBuffer>[] = [];
  let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    bytes += value.length;
    progress(Math.min(100, Math.round((bytes / Number(file.size)) * 100)));
  }
  return new Blob(chunks, { type: file.mimeType });
}
