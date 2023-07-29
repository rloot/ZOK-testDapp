import { FieldStruct } from './structs/FieldStruct';
import {
  ZOKContract,
  SimpleContract,
  FieldStructNoCheck,
} from './PermormanceContract';
import { Field, Mina, PrivateKey, PublicKey, AccountUpdate } from 'snarkyjs';

describe('Square.js', () => {
  let deployerAccount: PublicKey,
    senderAccount: PublicKey,
    zokContractInstance: ZOKContract,
    simpleContractInstance: SimpleContract,
    zokContractPrivateKey: PrivateKey,
    zokContractAppAddress,
    simpleContractPrivateKey: PrivateKey,
    simpleContractAppAddress,
    deployerKey: PrivateKey,
    senderKey: PrivateKey;

  beforeAll(async () => {
    const useProof = false;

    const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
    Mina.setActiveInstance(Local);
    const { privateKey: deployerPKey, publicKey: deployerAccountKey } =
      Local.testAccounts[0];
    const { privateKey: senderPKey, publicKey: senderAccountKey } =
      Local.testAccounts[2];

    deployerAccount = deployerAccountKey;
    senderAccount = senderAccountKey;
    deployerKey = deployerPKey;
    senderKey = senderPKey;

    // ----------------------------------------------------

    zokContractPrivateKey = PrivateKey.random();
    zokContractAppAddress = zokContractPrivateKey.toPublicKey();

    simpleContractPrivateKey = PrivateKey.random();
    simpleContractAppAddress = simpleContractPrivateKey.toPublicKey();

    zokContractInstance = new ZOKContract(zokContractAppAddress);
    simpleContractInstance = new SimpleContract(simpleContractAppAddress);
  });

  describe('Cases test.', () => {
    it('ZOKContract', async () => {
      const deployTxn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zokContractInstance.deploy();
      });
      await deployTxn.sign([deployerKey, zokContractPrivateKey]).send();

      // get the initial state of Square after deployment
      const fields = zokContractInstance.fields.get();
      expect(fields.max).toEqual(Field(50));

      const newFieldsInstance = new FieldStruct(
        Field(6),
        Field(20),
        Field(1),
        Field(2),
        Field(40),
        Field(60)
      );
      const txn1 = await Mina.transaction(senderAccount, () => {
        zokContractInstance.updateFields(newFieldsInstance);
      });
      await txn1.prove();
      await txn1.sign([senderKey]).send();

      const num1 = zokContractInstance.fields.get();
      expect(num1.lt).toEqual(Field(6));
    });

    it('SimpleContract', async () => {
      const deployTxn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        simpleContractInstance.deploy();
      });
      await deployTxn.sign([deployerKey, simpleContractPrivateKey]).send();

      // get the initial state of Square after deployment
      const fields = simpleContractInstance.fields.get();
      expect(fields.max).toEqual(Field(50));

      const newFieldsInstance = new FieldStructNoCheck(
        Field(6),
        Field(20),
        Field(1),
        Field(2),
        Field(40),
        Field(60)
      );
      const txn1 = await Mina.transaction(senderAccount, () => {
        simpleContractInstance.updateFields(newFieldsInstance);
      });
      await txn1.prove();
      await txn1.sign([senderKey]).send();

      const num1 = simpleContractInstance.fields.get();
      expect(num1.lt).toEqual(Field(6));
    });
  });
});
