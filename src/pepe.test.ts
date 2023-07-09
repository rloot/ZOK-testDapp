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
import {
  CircuitMath,
  CircuitNumber,
} from 'snarkyjs-math/build/src/snarkyjs-math.js';
import { ZkappCommand } from 'snarkyjs/dist/node/lib/account_update.js';
import { PepeStruct } from './generated/PepeStruct.js';
import { Pepe } from './Pepe.js';

describe('pepe.js', () => {
  let deployerAccount: PublicKey,
    senderAccount: PublicKey,
    zkAppPrivateKey: PrivateKey,
    zkAppAddress: PublicKey,
    deployerKey: PrivateKey,
    senderKey: PrivateKey,
    zkApp: Pepe;

  beforeAll(async () => {
    const useProof = false;

    const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
    Mina.setActiveInstance(Local);
    // const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
    // const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];
    deployerKey = Local.testAccounts[0].privateKey
    deployerAccount = Local.testAccounts[0].publicKey
    senderKey = Local.testAccounts[1].privateKey
    senderAccount = Local.testAccounts[1].publicKey
    
    // ----------------------------------------------------

    // Create a public/private key pair. The public key is your address and where you deploy the zkApp to
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();
    zkApp = new Pepe(zkAppAddress);

    console.log('compiling')
    await Pepe.compile();

    await fetchAccount({ publicKey: zkAppAddress });
  
    zkApp = new Pepe(zkAppAddress);

    const deployTxn = await Mina.transaction(deployerAccount, () => {
      AccountUpdate.fundNewAccount(deployerAccount);
      zkApp.deploy();
    });
    await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();
  });
  beforeEach(async () => {

  
  })

  describe('updates field()', () => {
    it('can set issuer', async () => {
      const issuer = 0xf344

      let updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateIssuer(new Field(issuer))
      });
      
      await updateTx.prove()
      await updateTx.sign([senderKey]).send();

      const pep = zkApp.pep.get()

      expect(pep.issuer).toEqual(Field.from(issuer));
      
    });
    it('can set expiration', async () => {
      const expiration = 0xffaabb
      
      let updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateExpiration(new Field(expiration))
      });
      
      await updateTx.prove()
      await updateTx.sign([senderKey]).send();
      
      let pep = zkApp.pep.get()
      expect(pep.expiration).toEqual(Field.from(expiration));
    });

    it('can update issuer', async () => {
      const issuer1 = 0xf344

      let updateTx = await Mina.transaction(senderAccount, () => {
        zkApp.updateIssuer(new Field(issuer1))
      });
      
      await updateTx.prove()
      await updateTx.sign([senderKey]).send();

      expect(zkApp.pep.get().issuer).toEqual(Field.from(issuer1));

      const issuer2 = 0xcaca
      updateTx = await Mina.transaction(senderAccount, () => {
        zkApp.updateIssuer(new Field(issuer2))
      });
      
      await updateTx.prove()
      await updateTx.sign([senderKey]).send();
      expect(zkApp.pep.get().issuer).toEqual(Field.from(issuer2));



    })
    it('can set all variables', async () => {

      const issuer = 0xfeaa
      const expiration = 0xffdead
      
      let updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateIssuer(new Field(issuer))
        // zkApp.updateExpiration(new Field(expiration))
      });
      await updateTx.prove()
      await updateTx.sign([senderKey]).send();
      
      let pep = zkApp.pep.get()
      expect(pep.issuer).toEqual(Field.from(issuer));
      updateTx = await Mina.transaction(senderAccount, () => {
        // zkApp.updateField(new Field(packed));
        zkApp.updateExpiration(new Field(expiration))
      });
      await updateTx.prove()
      await updateTx.sign([senderKey]).send();
      
      pep = zkApp.pep.get()
      console.log(pep.issuer.toString(), pep.expiration.toString())
      
      const expectedField = (expiration * (2 ** 16)) + issuer
      expect(pep.expiration).toEqual(Field.from(expiration));
      expect(pep._field0.toString()).toEqual(expectedField.toString())


    })
    it.skip('can set account', async () => {
    });
  });
});
