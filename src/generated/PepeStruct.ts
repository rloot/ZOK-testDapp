import {
  Field,
  SmartContract,
  state,
  State,
  method,
  Poseidon,
  Bool,
  Struct,
  Circuit,
  UInt64,
  UInt32,
  Provable,
} from 'snarkyjs';
import {
  CircuitMath,
  CircuitNumber,
} from 'snarkyjs-math/build/src/snarkyjs-math';

const ISSUER_OFFSET = new Field(1);
const ISSUER_MASK = new Field(2 ** 16);

const EXPIRATION_OFFSET = new Field(2 ** 16);
const EXPIRATION_MASK = new Field(2 ** 40);

// const ACCOUNT_OFFSET = new Field(2 ** 56);
// const ACCOUNT_MASK = new Field(2 ** 63);


export class PepeStruct extends Struct({
  _field0: Field,
}) {
  constructor(issuer: Field, expiration: Field, account: Field) {
    super({
      _field0: PepeStruct._initField0(issuer, expiration, account),
    });

    this.check();
  }
  public check() {}

  get issuer(): Field {
    // return this._get(this._field0, UInt64.from(ISSUER_OFFSET.toBigInt()), UInt64.from(ISSUER_MASK.toBigInt())
    return this._get(this._field0, ISSUER_OFFSET, ISSUER_MASK);
    // return new Field(1)
  }

  get expiration(): Field {
    // return this._get(this._field0, UInt64.from(EXPIRATION_OFFSET.toBigInt()), UInt64.from(EXPIRATION_MASK.toBigInt())
    return this._get(this._field0, EXPIRATION_OFFSET, EXPIRATION_MASK);
    return new Field(2)
  }

  get account(): Field {
    // return _get160(this._field0, ACCOUNT_OFFSET, ACCOUNT_MASK);
    return new Field(3)
  }

  set issuer(value: Field) {
    // this._field0 = this._set(this._field0, value, UInt64.from(ISSUER_OFFSET), UInt64.from(ISSUER_MASK))
    this._field0 = this._set(this._field0, value, ISSUER_OFFSET, ISSUER_MASK);
  }

  set expiration(value: Field) {
    this._field0 = this._set(this._field0, value, EXPIRATION_OFFSET, EXPIRATION_MASK);
  }
  // set account(value: Field) {
  //   this._field0 = _set160(this._field0, value, ACCOUNT_MASK, EXPIRATION_MASK);
  // }

  static _initField0(issuer: Field, expiration: Field, account: Field): Field {
    const value = new Field(
      issuer.mul(ISSUER_OFFSET).add(expiration.mul(EXPIRATION_OFFSET))
      // r.add(account.mul(ACCOUNT_OFFSET))
    );
    return value;
  }

  private _get(currentValue: Field, offset: Field, size: Field): Field {
    // console.log(currentValue.toString())
    // console.log(`_get`)
    const r = Provable.witness(Field, () => {
      // const dirtyValue = UInt64.from(value).div(offset);
      // return dirtyValue.mod(size).toFields()[0];
      
      
      const dirtyValue = UInt64.from(currentValue).div(UInt64.from(offset));
      // console.log(`dirty value: ${UInt64.fromcurrentValue.toBigInt()} / ${offset.toBigInt()} = ${dirtyValue.toBigInt()}`);
      // q = 0xffdead / x10000 => 0xff
      const q = dirtyValue.div(UInt64.from(size));
      // console.log(`q: ${currentValue.toBigInt()} / ${size.toBigInt()} = ${q.toBigInt()}`);
      // rest = 0xffdead % 0x10000 <=> r = 0xffdead - (q * 0x10000) => 0xdead
      const p = q.mul(UInt64.from(size))
      // console.log(`q * size: ${q.toBigInt()} * ${size.toBigInt()} = ${p.toBigInt()}`);
      const value = dirtyValue.sub(p);
      return value.toFields()[0]
      // console.log(`value: ${dirtyValue.toBigInt()} - ${p.toBigInt()} = ${value.toBigInt()}`);
      return dirtyValue.toFields()[0]
    });
  
    return r;
  }
  private _get160(
    currentValue: Field,
    offset: Field,
    size: Field
  ): Field {
    const r = Provable.witness(Field, () => {
      // 0xffdeadff / 0x100 => 0xdead
      const dirtyValue = currentValue.div(offset);
      // q = 0xffdead / x10000 => 0xff
      const q = dirtyValue.div(size);
  
      // rest = 0xffdead % 0x10000 <=> r = 0xffdead - (q * 0x10000) => 0xdead
      const rest = dirtyValue.sub(q.mul(size));
      rest.assertLessThan(dirtyValue);
      return rest;
      // return dirtyValue.mod(size).toFields()[0];
    });
  
    return r;
  }
  
  // console.log(`setting new ${value.toBigInt()} in offset ${offset.toBigInt()}`)
  private _set(
    currentField: Field,
    value: Field,
    offset: Field,
    size: Field
  ): Field {
    // console.log(`_set`)

    // const shiftedValue = new Field(UInt64.from(value).mul(offset).toBigInt())
    const newField = Provable.witness(Field, () => {
      
      const shiftedValue = value.mul(offset);
      // console.log(`shifted: ${value.toBigInt()} * ${offset.toBigInt()} = ${shiftedValue.toBigInt()}`);
      const currentValue = this._get(currentField, offset, size);
      // console.log(`current: ${currentValue.toBigInt()}`);
      // const newField = currentField.sub(currentValue).add(shiftedValue);
      const newValue = currentField.sub(currentValue).add(shiftedValue);
      // console.log(`new: ${newValue.toBigInt()}`);
      return newValue;
    })
    return newField;
  }
  
  private _set160(
    currentField: Field,
    newValue: Field,
    offset: Field,
    size: Field
  ): Field {
    // const shiftedValue = new Field(UInt64.from(value).mul(offset).toBigInt())
    const shiftedValue = newValue.mul(offset);
    const currentValue = this._get160(currentField, offset, size);
    const newField = currentField.sub(currentValue).add(shiftedValue);
    return newField;
  }
  
  
}
