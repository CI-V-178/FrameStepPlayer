export class SaveQueue<T> {
  private timer?: ReturnType<typeof setTimeout>;
  private pending?: T;
  private running?: Promise<void>;
  private disposed = false;
  constructor(
    private save: (value: T) => Promise<void>,
    private status: (s: "saving" | "saved" | "error") => void,
  ) {}
  get dirty() {
    return this.pending !== undefined || this.running !== undefined;
  }
  put(value: T) {
    this.pending = value;
    this.status("saving");
    clearTimeout(this.timer);
    this.timer = setTimeout(() => void this.flush(), 1000);
  }
  flush(): Promise<void> {
    if (this.running) return this.running;
    if (this.disposed || this.pending === undefined) return Promise.resolve();
    clearTimeout(this.timer);
    this.running = this.drain().finally(() => {
      this.running = undefined;
    });
    return this.running;
  }
  private async drain() {
    while (this.pending !== undefined && !this.disposed) {
      const value = this.pending;
      this.pending = undefined;
      try {
        await this.save(value);
        if (!this.disposed)
          this.status(this.pending === undefined ? "saved" : "saving");
      } catch {
        if (this.pending === undefined) this.pending = value;
        if (!this.disposed) this.status("error");
        return;
      }
    }
  }
  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
  }
}
