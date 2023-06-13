import { Square } from './Square.js';
import {
  isReady,
  shutdown,
  Field,
  Mina,
  PrivateKey,
  AccountUpdate,
} from 'snarkyjs';
import { SquareStruct } from './Cases.js';

await isReady;

console.log('SnarkyJS loaded');

const useProof = false;

const Local = Mina.LocalBlockchain({ proofsEnabled: useProof });
Mina.setActiveInstance(Local);
const { privateKey: deployerKey, publicKey: deployerAccount } =
  Local.testAccounts[0];
const { privateKey: senderKey, publicKey: senderAccount } =
  Local.testAccounts[1];

// ----------------------------------------------------

// Create a public/private key pair. The public key is your address and where you deploy the zkApp to
const zkAppPrivateKey = PrivateKey.random();
const zkAppAddress = zkAppPrivateKey.toPublicKey();

// create an instance of Square - and deploy it to zkAppAddress
const zkAppInstance = new Square(zkAppAddress);
const deployTxn = await Mina.transaction(deployerAccount, () => {
  AccountUpdate.fundNewAccount(deployerAccount);
  zkAppInstance.deploy();
});
await deployTxn.sign([deployerKey, zkAppPrivateKey]).send();

// get the initial state of Square after deployment
const num0 = zkAppInstance.num.get();
console.log('state after init:', num0.num.toString());

// ----------------------------------------------------

const txn1 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.updateNum(Field(9));
});
await txn1.prove();
await txn1.sign([senderKey]).send();

const num1 = zkAppInstance.num.get();
console.log('state after txn1:', num1.num.toString());

// ----------------------------------------------------

try {
  const txn2 = await Mina.transaction(senderAccount, () => {
    zkAppInstance.updateNum(Field(75));
  });
  await txn1.prove();
  await txn2.sign([senderKey]).send();
} catch (e) {
  console.log(e);
}
const num2 = zkAppInstance.num.get();
console.log('state after txn2:', num2.num.toString());

// ----------------------------------------------------

const txn3 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.updateNum(Field(81));
});
await txn3.prove();
await txn3.sign([senderKey]).send();

const num3 = zkAppInstance.num.get();
console.log('state after txn3:', num3.num.toString());

// ----------------------------------------------------

const txn4 = await Mina.transaction(senderAccount, () => {
  zkAppInstance.updateSquare(new SquareStruct(Field(6561)));
});
await txn4.prove();
await txn4.sign([senderKey]).send();

const num4 = zkAppInstance.num.get();
console.log('state after txn1:', num4.num.toString());

//
console.log('Shutting down');

await shutdown();
