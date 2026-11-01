import { clampFrame, frameAt, frameTime } from "../../shared/time";
/** Serializes seeks and retains at most one additional input. */
export class FrameController {
  frame = 0;
  private busy = false;
  private pending?: number;
  private disposed = false;
  private release?: () => void;
  constructor(
    private video: HTMLVideoElement,
    private changed: (frame: number) => void,
  ) {}
  sync() {
    if (!this.busy) {
      this.frame = clampFrame(
        frameAt(this.video.currentTime),
        this.video.duration || 0,
      );
      this.changed(this.frame);
    }
  }
  step(d: number) {
    this.video.pause();
    this.enqueue(clampFrame(this.frame + d, this.video.duration || 0));
  }
  jump(frame: number) {
    this.video.pause();
    this.enqueue(clampFrame(frame, this.video.duration || 0));
  }
  private enqueue(frame: number) {
    if (this.disposed) return;
    if (this.busy && this.pending !== undefined) return;
    this.frame = frame;
    this.changed(frame);
    if (this.busy) this.pending = frame;
    else void this.seek(frame);
  }
  private async seek(frame: number) {
    this.busy = true;
    const v = this.video,
      target = frameTime(frame, v.duration || 0);
    if (Math.abs(v.currentTime - target) > 1e-7)
      await new Promise<void>((resolve) => {
        let finished = false,
          seekComplete = false,
          drawn = false,
          callback: number | undefined,
          timer: ReturnType<typeof setTimeout> | undefined;
        const finish = () => {
          if (finished) return;
          finished = true;
          clearTimeout(timer);
          v.removeEventListener("seeked", seeked);
          v.removeEventListener("error", finish);
          if (callback !== undefined) v.cancelVideoFrameCallback(callback);
          this.release = undefined;
          resolve();
        };
        const seeked = () => {
          seekComplete = true;
          if (drawn || !v.requestVideoFrameCallback) finish();
          else timer = setTimeout(finish, 150);
        };
        v.addEventListener("seeked", seeked, { once: true });
        v.addEventListener("error", finish, { once: true });
        if (v.requestVideoFrameCallback)
          callback = v.requestVideoFrameCallback(() => {
            drawn = true;
            if (seekComplete) finish();
          });
        this.release = finish;
        try {
          v.currentTime = target;
        } catch {
          finish();
        }
      });
    this.busy = false;
    if (this.pending !== undefined && !this.disposed) {
      const next = this.pending;
      this.pending = undefined;
      await this.seek(next);
    }
  }
  get seeking() {
    return this.busy;
  }
  dispose() {
    this.disposed = true;
    this.pending = undefined;
    this.release?.();
  }
}
