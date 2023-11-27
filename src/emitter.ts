export class Emitter<T> {
  protected handlers = new Set<(v: T) => any>();

  next(value: T) {
    this.handlers.forEach(h => h(value));
  }

  subscribe(handler: (v: T) => any) {
    this.handlers.add(handler);

    return () => {
      this.handlers.delete(handler);
    };
  }

  dispose() {
    this.handlers.clear();
  }
}
