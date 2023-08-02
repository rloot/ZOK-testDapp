import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Bool,
  Provable,
} from 'snarkyjs';
import { TestStruct } from './generated/TestStruct';

export class Test extends SmartContract {
  @state(TestStruct) pep = State<TestStruct>();

  init() {
    super.init();

    const p = new TestStruct(
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0),
      new Field(0)
    );

    this.pep.set(p);
  }

  @method updateA1(a1: Field) {
    const pep: TestStruct = this.pep.getAndAssertEquals();
    pep.a1 = a1;
    this.pep.set(pep);
  }
  @method updateA2(a2: Field) {
    const pep: TestStruct = this.pep.getAndAssertEquals();
    pep.a2 = a2;
    this.pep.set(pep);
  }
  @method updateA3(a3: Field) {
    const pep: TestStruct = this.pep.getAndAssertEquals();
    pep.a3 = a3;
    this.pep.set(pep);
  }
  @method updateA4(a4: Field) {
    const pep: TestStruct = this.pep.getAndAssertEquals();
    pep.a4 = a4;
    this.pep.set(pep);
  }

  // @method data(): [Field, Field, Field] {
  //   const pep: TestStruct = this.pep.getAndAssertEquals();
  //   return [pep.issuer, pep.expiration, pep.account]
  // }

  @method f(): Field {
    const pep: TestStruct = this.pep.getAndAssertEquals();

    return pep._field0;
  }
}
