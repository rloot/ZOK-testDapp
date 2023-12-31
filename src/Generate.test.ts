import { Square } from './SquareContract.js';
import {
  Field,
  Mina,
  PrivateKey,
  PublicKey,
  AccountUpdate,
  Bool,
} from 'snarkyjs';

import { DateStruct } from './structs/DateStruct';
import { SquareStruct } from './structs/SquareStruct';
import { FieldStruct } from './structs/FieldStruct';
import { BoolStruct } from './structs/BoolStruct';

describe('Square.js', () => {
  let deployerAccount: PublicKey,
    senderAccount: PublicKey,
    zkAppInstance: Square,
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

    // Create a public/private key pair. The public key is your address and where you deploy the zkApp to
    zkAppPrivateKey = PrivateKey.random();
    zkAppAddress = zkAppPrivateKey.toPublicKey();

    // create an instance of Square - and deploy it to zkAppAddress
    zkAppInstance = new Square(zkAppAddress);
  });

  describe('Cases test.', () => {
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

    it('Calls contract through updateNum', async () => {
      const txn1 = await Mina.transaction(senderAccount, () => {
        zkAppInstance.updateNum(Field(9));
      });
      await txn1.prove();
      await txn1.sign([senderKey]).send();

      const num1 = zkAppInstance.num.get();
      expect(num1.num).toEqual(Field(9));

      const txn2 = await Mina.transaction(senderAccount, () => {
        zkAppInstance.updateNum(Field(81));
      });
      await txn2.prove();
      await txn2.sign([senderKey]).send();

      const num2 = zkAppInstance.num.get();
      expect(num2.num).toEqual(Field(81));
    });

    it('Calls updateSquare with autogenerated struct', async () => {
      const txn = await Mina.transaction(senderAccount, () => {
        zkAppInstance.updateSquare(new SquareStruct(Field(6561)));
      });
      await txn.prove();
      await txn.sign([senderKey]).send();

      const square = zkAppInstance.num.get();
      expect(square.num).toEqual(Field(6561));
    });

    it('Throw if assertGreaterThanOrEqual than 1', async () => {
      try {
        expect(new SquareStruct(Field(0))).toThrow(
          'num must be greater or equal than 1'
        );
      } catch (e) {
        //
      }
    });
  });

  describe('Field ', () => {
    it('Creates instance of field struct', async () => {
      const field = new FieldStruct(
        Field(1),
        Field(99),
        Field(2),
        Field(1),
        Field(50),
        Field(50)
      );

      expect(field.lt).toEqual(Field(1));
      expect(field.gt).toEqual(Field(99));
      expect(field.lte).toEqual(Field(2));
      expect(field.gte).toEqual(Field(1));
      expect(field.min).toEqual(Field(50));
      expect(field.max).toEqual(Field(50));
    });

    it('lt must be less than 10', () => {
      try {
        new FieldStruct(
          Field(11),
          Field(99),
          Field(2),
          Field(1),
          Field(50),
          Field(50)
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain('lt must be less than 10');
      }
    });

    it('gt must be greater than 0', () => {
      try {
        new FieldStruct(
          Field(0),
          Field(0), // gt
          Field(2),
          Field(1),
          Field(50),
          Field(50)
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain('gt must be greater than 0');
      }
    });

    it('lte must be less or equal than 5', () => {
      try {
        new FieldStruct(
          Field(0),
          Field(1),
          Field(6), // lte
          Field(1),
          Field(50),
          Field(50)
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain('lte must be less or equal than 5');
      }
    });

    it('gte must be greater or equal than 0', () => {
      try {
        new FieldStruct(
          Field(0),
          Field(1),
          Field(5),
          Field(-1), // gte
          Field(50),
          Field(50)
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain('gte must be greater or equal than 0');
      }
    });

    it('max must be less or equal than 100', () => {
      try {
        new FieldStruct(
          Field(0),
          Field(1),
          Field(5),
          Field(0),
          Field(101), // max
          Field(50)
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain('max must be less or equal than 100');
      }
    });

    it('min must be greater or equal than 40', () => {
      try {
        new FieldStruct(
          Field(0),
          Field(1),
          Field(5),
          Field(0),
          Field(50),
          Field(39) // min
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain('min must be greater or equal than 40');
      }
    });
  });

  describe('Bool ', () => {
    it('Parses type on initiation', () => {
      const boolStruct = new BoolStruct(Bool(true));
      expect(boolStruct).toHaveProperty('boolean1');
    });
  });

  describe('Date', () => {
    const birthday = new Date('1993-11-03');
    const minDate = new Date('1970-01-03');
    const maxDate = new Date('1972-01-02');

    it('Check initialization', () => {
      const dateStruct = new DateStruct(
        Field(birthday.getTime()),
        Field(minDate.getTime()),
        Field(maxDate.getTime())
      );

      expect(dateStruct).toHaveProperty('birthday');
      expect(dateStruct).toHaveProperty('minDate');
      expect(dateStruct).toHaveProperty('maxDate');
    });

    it('Test min and max date restraint', () => {
      const bellowAllowMinDate = new Date('1970-01-01');
      const aboveAllowMaxDate = new Date('1973-01-02');

      try {
        new DateStruct(
          Field(birthday.getTime()),
          Field(minDate.getTime()),
          Field(aboveAllowMaxDate.getTime())
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain(
          'maxDate must be less or equal than 63158400000'
        );
      }

      try {
        new DateStruct(
          Field(birthday.getTime()),
          Field(bellowAllowMinDate.getTime()),
          Field(maxDate.getTime())
        );
      } catch (e: unknown) {
        // @ts-ignore
        expect(e?.message).toContain(
          'minDate must be greater or equal than 86400000'
        );
      }
    });
  });
});
