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

      this._obsolete(false);
      this.events.next(Events.changed);
    }

    return this;
  }

  /**
   * Задает функцию расчета значения ячейки. Опционально можно явно указать зависимости.
   */
  compute(func: ComputeFunc<T>): Recell<T> {
    this._compute = func;
    this._obsolete(true);

    return this;
  }

  /**
   * Отслеживает указанные ячейки
   * @param values
   */
  watch(...values: Recell<any>[]) {
    values.forEach(v => RELATIONS.bind(this, v))
    this._obsolete(true);

    return this;
  }

  /**
   * Перестает следить за указанными ячейками
   * @param values
   */
  unwatch(...values: Recell<any>[]) {
    values.forEach(v => RELATIONS.unbind(this, v));

    return this;
  }

  dispose(): void {
    this._compute = undefined;

    RELATIONS.findBy(this).forEach(b => {
      RELATIONS.remove(b);
    });

    this.events.next(Events.disposed);
    this.events.dispose();
  }

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

  /**
   * Shorthand for `const b = recell(undefined).compute(mapper).watch(a)`
   *
   * @param mapper
   */
  map<K>(mapper: (v: T) => K): Recell<K> {
    return new Recell(undefined as K).compute(() => mapper(this.value)).watch(this);
  }

  /**
   * Marks cell as obsolete and triggers recalculating.
   */
  obsolete() {
    return this._obsolete(true);
  }

  /**
   * Отмечает устаревшими все зависящие ячейки по цепочке
   *
   * TODO: защита от зацикливания
   * @param includeSelf - включая эту ячейку
   * @private
   */
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

    this.value = this._compute(this._value);
    this.obsoleted = false;
  }
}

export function recell<T>(value: T) {
  return new Recell<T>(value as T);
}
