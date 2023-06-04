import { 
    Field, 
    SmartContract, 
    state, 
    State, 
    method, 
    Struct
  } from 'snarkyjs';
  // import { SquareStruct } from './SquareStruct.js';

  export class Square extends SmartContract {
    @state(Field) num = State<Field>();
  
    init() {
      super.init();
      this.num.set(Field(3));
    }
  
    @method update(square: Field) {
      const currentState = this.num.get();
      this.num.assertEquals(currentState);
      square.assertEquals(currentState.mul(currentState));
      this.num.set(square);
    }
  }