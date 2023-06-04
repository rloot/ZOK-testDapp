import { Field, Struct, Experimental, verify } from "snarkyjs";
export class SquareStruct extends Struct({
  num: Field
}) {
  public check() {
    // exclusive minimum
    this._assert(this.num.greaterThanOrEqual(0), "num must be greater or equal than 0")
  }
  public _assert(expr: unknown, msg?: string) {
    if (!expr)
      throw new Error(msg);
  }
}

const SimpleProgram = Experimental.ZkProgram({
  publicInput: Field,

  methods: {
    run: {
      privateInputs: [],

      method(publicInput: Field) {
        publicInput.greaterThanOrEqual(Field(0));
      },
    }
  }
});

export const checkIfZero = async (num: Field) => {
  const { verificationKey } = await SimpleProgram.compile();

  const proof = await SimpleProgram.run(Field(num))
  const ok = await verify(proof.toJSON(), verificationKey);

  return ok;
};