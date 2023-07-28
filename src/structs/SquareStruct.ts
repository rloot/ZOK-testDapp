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
export class SquareStruct extends Struct({
  num: Field,
}) {
  constructor(num: Field) {
    super({ num });
    this.check();
  }
  public check() {
    // Check
    this.num.assertGreaterThanOrEqual(1, 'num must be greater or equal than 1');
  }
  _assert(expr: unknown, msg?: string) {
    if (!expr) throw new Error(msg);
  }
}
