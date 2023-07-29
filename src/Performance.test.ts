import { ZOKContract } from './PermormanceContract';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'snarkyjs';

describe('Square.js', () => {
  let deployerAccount: PublicKey,
    senderAccount: PublicKey,
    zkAppInstance: ZOKContract,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress,
    deployerKey: PrivateKey,
    senderKey: PrivateKey;

  beforeAll(async () => {
    const useProof = false;

    const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
    Mina.setActiveInstance(Local);
    const { privateKey: deployerPKey, publicKey: deployerAccountKey } =
      Local.testAccounts[0];
    const { privateKey: senderPKey, publicKey: senderAccountKey } =
      Local.testAccounts[1];

    deployerAccount = deployerAccountKey;
    senderAccount = senderAccountKey;
    deployerKey = deployerPKey;
    senderKey = senderPKey;

    // ----------------------------------------------------

    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    zkAppInstance = new ZOKContract(zkAppAddress);
  });

  describe('Cases test.', () => {
    it('Sets up Mina test enviroment', async () => {
      const deployTxn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkAppInstance.deploy();
      });
      await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

      // get the initial state of Square after deployment
      // const num0 = zkAppInstance.num.get();
      // expect(num0.num).toEqual(Field(3));

      // const txn1 = await Mina.transaction(senderAccount, () => {
      //   zkAppInstance.updateNum(Field(9));
      // });
      // await txn1.prove();
      // await txn1.sign([senderKey]).send();

      // const num1 = zkAppInstance.num.get();
      // expect(num1.num).toEqual(Field(9));
    });
  });
});
