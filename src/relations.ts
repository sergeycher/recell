import {TreeIndex} from "./tree-index";

export interface Relation<T> {
  readonly source: T;
  readonly dest: T;
}

/**
 * Связи между ячейками
 */
export class Relations<T> {
  protected items = new TreeIndex<Relation<T>>();

  findBy(sourceOrDest: T): Relation<T>[] {
    return this.items.branch(sourceOrDest).map(r => r);
  }

  to(to: T): Relation<T>[] {
    const result: Relation<T>[] = [];

    this.findBy(to).map(b => {
      if (b.dest === to) {
        result.push(b);
      }
    });

    return result;
  }

  bind(source: T, dest: T) {
    const item = this.items.branch(source, dest);

    let [bound] = item.value;

    if (!bound) {
      bound = {source, dest};
      item.value = [bound];
    }

    this.items.branch(dest, source).value = item.value;

    return bound;
  }

  remove(b: Relation<T>) {
    this.unbind(b.source, b.dest);
  }

  unbind(source: T, dest: T) {
    this.items.delete(source, dest);
    this.items.delete(dest, source);
  }
}
