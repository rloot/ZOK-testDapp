import { Field, SmartContract, state, State, method } from 'snarkyjs';
import { SquareStruct } from './structs/SquareStruct';

export class Square extends SmartContract {
  @state(SquareStruct) num = State<SquareStruct>();

  init() {
    super.init();

    const sqs = new SquareStruct(Field(3));

    this.num.set(sqs);
  }

  @method updateSquare(square: SquareStruct) {
    const currentState = this.num.get();
    this.num.assertEquals(currentState);
    square.num.assertEquals(currentState.num.mul(currentState.num));
    this.num.set(square);
  }

  @method updateNum(square: Field) {
    const currentState = this.num.get();
    this.num.assertEquals(currentState);

    const resultSquared = currentState.num.mul(currentState.num);
    square.assertEquals(resultSquared);
    this.num.set(new SquareStruct(resultSquared));
  }
}
