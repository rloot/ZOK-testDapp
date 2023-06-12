import { Square } from './Square.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
} from 'snarkyjs';
import { SquareStruct } from './SquareStruct.js';

describe('Square.js', () => {
  let deployerAccount: PublicKey,
    senderAccount: PublicKey,
    zkAppInstance: Square,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress,
    deployerKey: PrivateKey,
    senderKey;

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

    // Create a public/private key pair. The public key is your address and where you deploy the zkApp to
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    // create an instance of Square - and deploy it to zkAppAddress
    zkAppInstance = new Square(zkAppAddress);
  });

  describe('Square()', () => {
    it('Sets up Mina test enviroment', async () => {
      const deployTxn = await Mina.transaction(deployerAccount, () => {
        AccountUpdate.fundNewAccount(deployerAccount);
        zkAppInstance.deploy();
      });
      await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

      // get the initial state of Square after deployment
      const num0 = zkAppInstance.num.get();
      expect(num0.num).toEqual(Field(3));
    });
  });
});
