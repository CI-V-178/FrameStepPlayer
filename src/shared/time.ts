export const FPS = 60;
export const frameAt = (time: number) => Math.floor(time * FPS + 1e-3);
export const lastFrame = (duration: number) =>
  Math.max(0, Math.ceil(duration * FPS - 1e-3) - 1);
export const clampFrame = (frame: number, duration: number) =>
  Math.max(0, Math.min(lastFrame(duration), frame));
export const frameTime = (frame: number, duration: number) =>
  Math.max(
    0,
    Math.min(
      Math.max(0, duration - 0.5 / FPS),
      (clampFrame(frame, duration) + 0.5) / FPS,
    ),
  );
export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds || 0)),
    m = Math.floor(s / 60);
  return (
    (s >= 3600 ? Math.floor(s / 3600) + ":" : "") +
    String(s >= 3600 ? m % 60 : m).padStart(2, "0") +
    ":" +
    String(s % 60).padStart(2, "0")
  );
}
