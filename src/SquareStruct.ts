import { Field, Struct, Experimental, verify } from 'snarkyjs';
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
  // _assert(expr: unknown, msg?: string) {
  //   if (!expr)
  //     throw new Error(msg);
  // }
}

export class Vaccine extends Struct({
  issuer: Field,
  expiration: Field,
}) {
  constructor(issuer: Field, expiration: Field) {
    super({ issuer, expiration });
    this.check();
  }
  public check() {
    // exclusive minimum
    this.issuer.assertGreaterThan(0, 'issuer must be greater than 0');
    // exclusive minimum
    this.expiration.assertGreaterThan(0, 'expiration must be greater than 0');
  }
  _assert(expr: unknown, msg?: string) {
    if (!expr) throw new Error(msg);
  }
}

const SimpleProgram = Experimental.ZkProgram({
  publicInput: Field,

  methods: {
    run: {
      privateInputs: [],

      method(publicInput: Field) {
        publicInput.assertEquals(Field(0), 'Must be zero');
      },
    },
  },
});

export const checkIfZero = async (num: Field) => {
  const { verificationKey } = await SimpleProgram.compile();

  const proof = await SimpleProgram.run(Field(num));
  const ok = await verify(proof.toJSON(), verificationKey);

  return ok;
};
