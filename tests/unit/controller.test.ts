import { it, expect, vi } from "vitest";
import { FrameController } from "../../src/features/player/controller";
class Video extends EventTarget {
  duration = 10;
  currentTime = 0;
  pause = vi.fn();
  callback: () => void = () => {};
  requestVideoFrameCallback(cb: () => void) {
    this.callback = cb;
    return 1;
  }
  cancelVideoFrameCallback() {}
}
it("seekedと描画を待ち、追加入力は1件だけ保持", async () => {
  const v = new Video(),
    c = new FrameController(v as unknown as HTMLVideoElement, () => {});
  c.step(1);
  c.step(1);
  c.step(1);
  expect(c.frame).toBe(2);
  expect(v.currentTime).toBe(0.025);
  v.callback();
  await Promise.resolve();
  expect(v.currentTime).toBe(0.025);
  v.dispatchEvent(new Event("seeked"));
  await Promise.resolve();
  expect(v.currentTime).toBe(2.5 / 60);
  v.dispatchEvent(new Event("seeked"));
  v.callback();
  await Promise.resolve();
  expect(c.seeking).toBe(false);
  c.dispose();
});
it("描画待ちは150msまで、論理フレームを維持", async () => {
  vi.useFakeTimers();
  const v = new Video(),
    c = new FrameController(v as unknown as HTMLVideoElement, () => {});
  c.step(1);
  v.dispatchEvent(new Event("seeked"));
  await vi.advanceTimersByTimeAsync(149);
  expect(c.seeking).toBe(true);
  await vi.advanceTimersByTimeAsync(1);
  expect(c.seeking).toBe(false);
  v.currentTime = 0.016;
  c.step(1);
  expect(c.frame).toBe(2);
  c.dispose();
  vi.useRealTimers();
});
