import { Field, SmartContract, state, State, method, Struct } from 'snarkyjs';
import { FieldStruct } from './structs/FieldStruct';

export class ZOKContract extends SmartContract {
  @state(FieldStruct) fields = State<FieldStruct>();

  init() {
    super.init();

    const fieldsInstance = new FieldStruct(
      Field(1),
      Field(99),
      Field(2),
      Field(1),
      Field(50),
      Field(50)
    );

    this.fields.set(fieldsInstance);
  }

  @method updateFields(newFields: FieldStruct) {
    const currentState = this.fields.get();
    this.fields.assertEquals(currentState);

    this.fields.set(newFields);
  }
}

export class FieldStructNoCheck extends Struct({
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
  }
}

export class SimpleContract extends SmartContract {
  @state(FieldStructNoCheck) fields = State<FieldStructNoCheck>();

  init() {
    super.init();

    const fieldsInstance = new FieldStructNoCheck(
      Field(1),
      Field(99),
      Field(2),
      Field(1),
      Field(50),
      Field(50)
    );

    this.fields.set(fieldsInstance);
  }

  @method updateFields(newFields: FieldStructNoCheck) {
    const currentState = this.fields.get();
    this.fields.assertEquals(currentState);

    this.fields.set(newFields);
  }
}
