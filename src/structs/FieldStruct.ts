import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Poseidon,
  Bool,
  Struct,
} from 'snarkyjs';
export class FieldStruct extends Struct({
  lt: Field,
  gt: Field,
  lte: Field,
  gte: Field,
  max: Field,
  min: Field,
}) {
  constructor(
    lt: Field,
    gt: Field,
    lte: Field,
    gte: Field,
    max: Field,
    min: Field
  ) {
    super({ lt, gt, lte, gte, max, min });
    this.check();
  }
  public check() {
    // Check
    this.lt.assertLessThan(10, 'lt must be less than 10');
    // exclusive minimum
    this.gt.assertGreaterThan(0, 'gt must be greater than 0');
    this.lte.assertLessThanOrEqual(5, 'lte must be less or equal than 5');
    this.gte.assertGreaterThanOrEqual(0, 'gte must be greater or equal than 0');
    this.max.assertLessThanOrEqual(100, 'max must be less or equal than 100');
    this.min.assertGreaterThanOrEqual(
      40,
      'min must be greater or equal than 40'
    );
  }
  _assert(expr: unknown, msg?: string) {
    if (!expr) throw new Error(msg);
  }
}
