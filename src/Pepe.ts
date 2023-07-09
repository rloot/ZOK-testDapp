import { Field, SmartContract, state, State, method, Bool } from 'snarkyjs';
import { CircuitMath, CircuitNumber } from 'snarkyjs-math';
import { PepeStruct } from './generated/PepeStruct.js';

export class Pepe extends SmartContract {
  @state(PepeStruct) pep = State<PepeStruct>();

  init() {
    super.init();

    const p = new PepeStruct(
      new Field(0),
      new Field(0),
      new Field(0)
    );

    this.pep.set(p)
  }

  @method test(): Bool {
    const currentState: PepeStruct = this.pep.getAndAssertEquals();
    
    return new Bool(true)
  }

  @method updateIssuer(issuer: Field) {
    const pep: PepeStruct = this.pep.getAndAssertEquals();
    pep.issuer = issuer
    this.pep.set(pep)
  }

  
  @method updateExpiration(expiration: Field) {
    const pep: PepeStruct = this.pep.getAndAssertEquals();
    pep.expiration = expiration
    this.pep.set(pep)
  }

  @method updateAccount(account: Field) {
    const pep: PepeStruct = this.pep.getAndAssertEquals();
    // pep.account = account
    // this.pep.set(pep)
  }



  @method data(): [Field, Field, Field] {
    const pep: PepeStruct = this.pep.getAndAssertEquals();

    return [pep.issuer, pep.expiration, pep.account]
  }

  @method f(): Field {
    const pep: PepeStruct = this.pep.getAndAssertEquals();

    return pep._field0
  }
}
