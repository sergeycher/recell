import {Emitter} from "./emitter";
import {Relations} from "./relations";

const RELATIONS = new Relations<Recell<any>>();

export enum Events {
  obsoleted,
  changed,
  disposed
}

export type ComputeFunc<T> = (curr: T) => T;

/**
 * Reactive Cell
 */
export class Recell<T> {
  protected obsoleted = true;

  protected _compute?: ComputeFunc<T>;

  protected readonly events = new Emitter<Events>();

  set value(v: T) {
    this.next(v);
  }

  get value(): T {
    if (this.obsoleted) {
      this.recompute();
    }

    return this._value;
  }

  constructor(protected _value: T) {
  }

  next(v: T): this {
    if (this._value !== v) {
      this._value = v;
      this.obsoleted = false;
      this._obsolete(false);
      this.events.next(Events.changed);
    }

    return this;
  }

  /**
   * Use compute function and mark cell as obsoleted
   */
  compute(func: ComputeFunc<T>): Recell<T> {
    this._compute = func;
    this._obsolete(true);

    return this;
  }

  /**
   * Watch selected cells, obsoletes as they are obsoleted
   * @param values
   */
  watch(...values: Recell<any>[]) {
    values.forEach(v => RELATIONS.bind(this, v))
    this._obsolete(true);

    return this;
  }

  unwatch(...values: Recell<any>[]) {
    values.forEach(v => RELATIONS.unbind(this, v));

    return this;
  }

  /**
   * Remove all relations between cells, drop compute function (if set) and trigger Dispose event
   */
  dispose(): void {
    this._compute = undefined;

    RELATIONS.findBy(this).forEach(b => {
      RELATIONS.remove(b);
    });

    this.events.next(Events.disposed);
    this.events.dispose();
  }

  /**
   * Subscribe on changes or obsolete trigger
   * @param handler
   * @param runImmediate
   */
  subscribe(handler: (v: () => T) => any, runImmediate = true): () => void {
    if (runImmediate) {
      handler(() => this.value);
    }

    return this.on([Events.obsoleted, Events.changed], () => {
      handler(() => this.value);
    });
  }

  on(events: Events[], handler: () => any) {
    return this.events.subscribe((e) => {
      if (events.includes(e)) {
        handler();
      }
    });
  }

  onDispose(handler: () => any) {
    return this.on([Events.disposed], handler);
  }

  /**
   * Shorthand for `const b = recell(undefined).compute(mapper).watch(a)`
   *
   * @param mapper
   */
  map<K>(mapper: (v: T) => K): Recell<K> {
    return new Recell(undefined as any).compute(() => mapper(this.value)).watch(this);
  }

  /**
   * Marks cell as obsolete and triggers recalculating.
   */
  obsolete() {
    return this._obsolete(true);
  }

  private _obsolete(includeSelf: boolean) {
    if (includeSelf) {
      this.obsoleted = true;
      this.events.next(Events.obsoleted);
    }

    RELATIONS.to(this).forEach(b => b.source._obsolete(true));

    return this;
  }

  private recompute() {
    if (!this._compute) {
      return;
    }

    this.next(this._compute(this._value));
  }
}

export function recell<T>(value: T) {
  return new Recell<T>(value as any);
}
