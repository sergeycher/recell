export class TreeIndex<T> {
  value: [T] | [] = [];

  protected branches = new Map<any, TreeIndex<T>>();

  branch(key: any, ...keys: any[]): TreeIndex<T> {
    let index: TreeIndex<T> = this;

    if (keys.length === 0) {
      const i = this.branches.get(key);

      if (!i) {
        index = new TreeIndex<T>();
        this.branches.set(key, index);
      } else {
        index = i;
      }
    } else {
      [key, ...keys].forEach((key) => {
        index = index.branch(key);
      });
    }

    return index;
  }

  delete(key: any, ...keys: any[]) {
    if (keys.length === 0) {
      this.branches.delete(key);
    } else {
      this.branch(key, ...(keys.slice(0, -1))).delete(keys.slice(-1)[0]);
    }
  }

  map<K>(handler: (v: T) => K): K[] {
    const result: K[] = this.value.map(handler);

    this.branches.forEach((index) => {
      result.push(...index.map(handler));
    });

    return result;
  }
}
