import { Field, Struct, Bool } from 'snarkyjs';
export class SquareStruct extends Struct({
  num: Field,
}) {
  constructor(num: Field) {
    super({ num });
    this.check();
  }
  public check() {
    this.num.assertGreaterThanOrEqual(1, 'num must be greater or equal than 1');
  }
}

export class BoolStruct extends Struct({
  boolean1: Bool,
}) {
  constructor(boolean1: Bool) {
    super({ boolean1 });
    this.check();
  }
  public check() {
    //To be ignored type check is done in Snarky
  }
  _assert(expr: unknown, msg?: string) {
    if (!expr) throw new Error(msg);
  }
}

export class FieldStruct extends Struct({
  a: Field,
  b: Field,
  c: Field,
  d: Field,
  e: Field,
}) {
  constructor(a: Field, b: Field, c: Field, d: Field, e: Field) {
    super({ a, b, c, d, e });
    this.check();
  }
  public check() {
    this.a.assertGreaterThanOrEqual(0, 'e must be greater or equal than 0');
    this.a.assertLessThanOrEqual(100, 'e must be less or equal than 100');
    this.b.assertLessThan(100, 'f must be less than 100');
    // exclusive minimum
    this.c.assertGreaterThan(0, 'g must be greater than 0');
    this.d.assertLessThanOrEqual(5, 'h must be less or equal than 5');
    this.e.assertGreaterThanOrEqual(0, 'i must be greater or equal than 0');
  }
}
