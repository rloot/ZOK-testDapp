import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Bool,
  Circuit,
  Provable,
  fetchAccount,
} from 'snarkyjs';

// import { read, set } from "z0k/src/lib/storage";
import { Test } from './Test';

function toHex(n: number | string | Field) {
  if (typeof n === 'object') {
    n = n.toString();
  }
  if (typeof n === 'string') {
    n = parseInt(n, 10);
  }
  return '0x' + n.toString(16);
}

describe('Test.js', () => {
  let deployerAccount: PublicKey,
    senderAccount: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey,
    deployerKey: PrivateKey,
    senderKey: PrivateKey,
    zkApp: Test;

  beforeAll(async () => {
    const useProof = false;

    const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
    Mina.setActiveInstance(Local);
    // const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
    // const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];
    deployerKey = Local.testAccounts[0].privateKey;
    deployerAccount = Local.testAccounts[0].publicKey;
    senderKey = Local.testAccounts[1].privateKey;
    senderAccount = Local.testAccounts[1].publicKey;

    // ----------------------------------------------------

    // Create a public/private key pair. The public key is your address and where you deploy the zkApp to

    console.log('compiling');
    await Test.compile();
  });
  beforeEach(async () => {
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Test(zkAppAddress);

    await fetchAccount({ publicKey: zkAppAddress });

    zkApp = new Test(zkAppAddress);

    const deployTxn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
  });

  describe('updates fields', () => {
    it('can set A1', async () => {
      const a1 = 0xf344;

      let updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateA1(new Field(a1));
      });

      await updateTx.prove();
      await updateTx.sign([senderKey]).send();

      const pep = zkApp.pep.get();

      expect(pep.a1).toEqual(Field.from(a1));
    });
    it.skip('can set A2', async () => {
      const a2 = 0xffaabb;

      let updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateA2(new Field(a2));
      });

      await updateTx.prove();
      await updateTx.sign([senderKey]).send();

      let pep = zkApp.pep.get();
      expect(pep.a2).toEqual(Field.from(a2));
    });
    it.skip('can update A1', async () => {
      const a1 = 0xf344;

      let updateTx = await Mina.transaction(senderAccount, () => {
        zkApp.updateA1(new Field(a1));
      });

      await updateTx.prove();
      await updateTx.sign([senderKey]).send();

      expect(zkApp.pep.get().a1).toEqual(Field.from(a1));

      const newA1 = 0xcaca;
      updateTx = await Mina.transaction(senderAccount, () => {
        zkApp.updateA1(new Field(newA1));
      });

      await updateTx.prove();
      await updateTx.sign([senderKey]).send();
      expect(zkApp.pep.get().a1).toEqual(Field.from(newA1));
    });
    it.skip('can set all variables', async () => {
      const a1 = 0xb0b0;
      const a2 = 0xffdead;

      let pep = zkApp.pep.get();
      console.log(toHex(pep._field0));
      let updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateA1(new Field(a1));
        // zkApp.updateExpiration(new Field(expiration))
      });
      await updateTx.prove();
      await updateTx.sign([senderKey]).send();

      pep = zkApp.pep.get();
      expect(pep.a1).toEqual(Field.from(a1));
      console.log(toHex(pep.a1));
      console.log(toHex(pep._field0));
      // console.log(toHex(pep.issuer))

      updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateA2(new Field(a2));
      });
      await updateTx.prove();
      await updateTx.sign([senderKey]).send();

      pep = zkApp.pep.get();
      console.log(toHex(pep.a1));
      console.log(toHex(pep.a2));
      console.log(toHex(pep._field0));
      // const expectedField = (a2 * (2 ** 16)) + issuer
      // expect(pep.a2).toEqual(Field.from(expiration));
      console.log(pep._field0.toString());
      // expect(pep._field0.toString()).toEqual(expectedField.toString())
    });
    it.skip('can set account', async () => {
      const issuer = 0xfeaa;
      const expiration = 0xffdead;
      const account = new Field(
        BigInt('1238012972454248237435767387143779415173800484933')
      );

      let updateTx = await Mina.transaction(senderAccount, () => {
        zkApp.updateA3(account);
      });
      await updateTx.prove();
      await updateTx.sign([senderKey]).send();

      let pep = zkApp.pep.get();
      // console.log(
      //   zkApp.data()[0].toBigInt(),
      //   zkApp.data()[1].toBigInt(),
      //   zkApp.data()[2].toBigInt()
      // )
      // console.log(toHex(pep._field0))

      // console.log(pep.account.toBigInt())
      // console.log(pep.account.toString())
      // expect(pep.account).toEqual(account);

      // console.log('account', toHex(pep.account.toFields()[0]))
      // console.log('issuer', toHex(pep.issuer))

      // expect(pep.issuer).toEqual(Field.from(issuer));
      // updateTx = await Mina.transaction(senderAccount, () => {
      //   // zkApp.updateField(new Field(packed));
      //   zkApp.updateExpiration(new Field(expiration))
      // });
      // await updateTx.prove()
      // await updateTx.sign([senderKey]).send();

      // pep = zkApp.pep.get()
      // console.log(pep.issuer.toString(), pep.expiration.toString())

      // const expectedField = (expiration * (2 ** 16)) + issuer
      // expect(pep.expiration).toEqual(Field.from(expiration));
      // expect(pep._field0.toString()).toEqual(expectedField.toString())
    });
  });
});
