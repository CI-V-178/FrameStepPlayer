import { createFile, type MP4BoxBuffer, type Movie } from "mp4box";
export const acceptedFps = (fps: number) =>
  Number.isFinite(fps) && fps >= 59 && fps <= 60.5;
export type ReadRange = (start: number, end: number) => Promise<ArrayBuffer>;
export async function readVideoInfo(
  size: number,
  read: ReadRange,
): Promise<{ fps: number; duration: number }> {
  return new Promise((resolve, reject) => {
    let done = false;
    const parser = createFile(),
      timer = setTimeout(() => fail(), 8000);
    const fail = () => {
      if (!done) {
        done = true;
        clearTimeout(timer);
        reject(new Error("この動画の fps を判定できませんでした"));
      }
    };
    parser.onError = () => fail();
    parser.onReady = (info: Movie) => {
      if (done) return;
      const track = info.videoTracks[0];
      if (!track || !track.duration || !track.timescale) return fail();
      const fps = track.nb_samples / (track.duration / track.timescale);
      if (!Number.isFinite(fps)) return fail();
      done = true;
      clearTimeout(timer);
      resolve({ fps, duration: track.duration / track.timescale });
    };
    const append = (data: ArrayBuffer, start: number) => {
      const buffer = data as MP4BoxBuffer;
      buffer.fileStart = start;
      parser.appendBuffer(buffer);
    };
    void (async () => {
      try {
        const chunk = 2 * 1024 * 1024;
        append(await read(0, Math.min(size, chunk) - 1), 0);
        if (!done && size > chunk) {
          const start = Math.max(chunk, size - chunk);
          append(await read(start, size - 1), start);
        }
        if (!done) {
          parser.flush();
          if (!done) fail();
        }
      } catch {
        fail();
      }
    })();
  });
}
export async function detectFps(
  size: number,
  read: ReadRange,
): Promise<number> {
  return (await readVideoInfo(size, read)).fps;
}
export async function require60(size: number, read: ReadRange) {
  const fps = await detectFps(size, read);
  if (!acceptedFps(fps))
    throw new Error(
      "60fps の動画のみ対応しています（この動画：" + fps.toFixed(2) + "fps）",
    );
  return fps;
}
