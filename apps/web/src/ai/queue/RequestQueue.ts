export class RequestQueue {
  private static queue: (() => Promise<any>)[] = [];
  private static activeCount = 0;
  private static maxConcurrent = 3;

  static async enqueue<T>(task: () => Promise<T>): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const wrappedTask = async () => {
        try {
          const res = await task();
          resolve(res);
        } catch (err) {
          reject(err);
        }
      };

      this.queue.push(wrappedTask);
      this.process();
    });
  }

  private static async process() {
    if (this.activeCount >= this.maxConcurrent || this.queue.length === 0) {
      return;
    }

    this.activeCount++;
    const task = this.queue.shift()!;
    try {
      await task();
    } finally {
      this.activeCount--;
      this.process();
    }
  }
}
