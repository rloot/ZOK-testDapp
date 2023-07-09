import {
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
  fetchAccount,
} from 'snarkyjs';
import { Pepe } from './Pepe.js';

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } = Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } = Local.testAccounts[1];

const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();
const zkApp = new Pepe(zkAppAddress);

console.log('compiling')
await Pepe.compile();

await fetchAccount({ publicKey: zkAppAddress });

const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkApp.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

console.log('deployed')

let pep = zkApp.pep.get()

// console.log(pep.issuer.toString(), pep.expiration.toString())

// console.log(pep._field0.toString())

// update state

const issuer = 0xf344
const expiration = 0xffaabb

let expectedField = (expiration * (2 ** 16)) + issuer

let updateTx = await Mina.transaction(senderAccount, () => {
  // zkApp.updateField(new Field(packed));
  zkApp.updateIssuer(new Field(issuer))
});

console.log('proving updateIssuer...')
await updateTx.prove()
await updateTx.sign([senderKey]).send();

pep = zkApp.pep.get()
// console.log('field value:', pep._field0.toString())
// console.log(zkApp.data().toString())
console.log('issuer:', pep.issuer.toString())

updateTx = await Mina.transaction(senderAccount, () => {
  // zkApp.updateField(new Field(packed));
  zkApp.updateExpiration(new Field(expiration))
});

console.log('proving updateExpiration...')
await updateTx.prove()
await updateTx.sign([senderKey]).send();

pep = zkApp.pep.get()
console.log('expected field value:', pep._field0.toString() == expectedField.toString())
console.log('expected field value:', pep._field0.toString())
// console.log(zkApp.data().toString())
console.log('expiration', pep.expiration.toString())

// updateTx = await Mina.transaction(senderAccount, () => {
//   // zkApp.updateField(new Field(packed));

//   zkApp.updateAccount(new Field(0x388c818ca8b9251b393131c08a736a67ccb19297))
// });

// console.log('proving updateAccount...')
// await updateTx.prove()
// await updateTx.sign([senderKey]).send();

// pep = zkApp.pep.get()
// console.log(pep.account.toString())
// console.log(pep._field0.toString())
// // console.log('expected field value:', pep.account.toString() == "0x388c818ca8b9251b393131c08a736a67ccb19297")
// console.log(zkApp.data().toString())

