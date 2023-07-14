const { ADACOIN_ERROR, AdaError, Block, Chain, TS } = require('../src/main.js');
const { v4: uuidv4 } = require('uuid');

describe('1. initialise a chain test suite', () => {
  test('1.1 initialise a new chain', () => {
    let adacoin = new Chain();
    expect(adacoin).toBeInstanceOf(Chain);
  });
  
  test('1.2 new chain starts with genesis block', () => {
    let adacoin = new Chain();
    let date = new TS;
    expect(adacoin.chain[0].transaction).toBe("Genesis Block");
    expect(adacoin.chain[0].ts).toBe(date.today);
  });

  test('1.3 is valid chain function returns true if valid', () => {
    let adacoin = new Chain();
    expect(adacoin.isValid()).toBe(true);
  });
  
});

describe('2. block test suite', () => {
  
  test('2.1 instantiate a block', () => {
    let adacoin_block = new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block).toBeInstanceOf(Block);
    expect (adacoin_block.ts).toBe('2023-07-02');
    expect (adacoin_block.tid).toBe('A0001');
    expect (adacoin_block.validtimestamp()).toBe(true);
    expect (adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('2.2 block with invalid date property - over 180 days ago', () => {
    let adacoin_block = new Block( '2022-12-31', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('2.3 block with invalid date property - wrong format', () => {
      let adacoin_block = new Block( '23-6-3', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('2.4 block with invalid date property - future date', () => {
      let adacoin_block = new Block( '2023-12-01', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('2.5 block with invalid date property - not a date', () => {
      let adacoin_block = new Block( '2024-15-93', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('2.6 block with missing date property', () => {
      let adacoin_block = new Block( { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });

  test('block with missing id', () => {
    let adacoin_block = new Block( '2023-07-02', { credit: '25.50'});
    expect (() => {adacoin_block.isValidTransaction()}).toThrow("AdaCoin Error");
  });

  
});

describe('3. validating timestamp test suite', () => {
  
  test('3.1 timestamp is in valid ISO 8601 format', () => {
    let ts = new TS();
    // expect (  ts.today ).toBe('2023-07-11');
    expect (ts.isdatevalid('2023-07-03') ).toBe(true);
    expect(() => ts.isdatevalid('2023-13-13')).toThrow("AdaCoin Error");
    expect(() => ts.isdatevalid('2023')).toThrow("AdaCoin Error");
  });
  
  test('3.2 timestamp days since function returns correct time difference', () => {
    let ts = new TS();
    expect(ts.dayssince('2023-07-14')).toBe(0);
    expect(ts.dayssince('2022-07-14')).toBe(365);
    expect(ts.dayssince('2024-07-14')).toBe(-366);
    expect(() => {ts.dayssince('2023-13-13')}).toThrow("AdaCoin Error");
    expect(() => {ts.dayssince('2023')}).toThrow("AdaCoin Error");
  });
  
});

describe('4. transaction validation test suite', () => {

  test('4.1 block has a valid transaction type - credit', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10.00', tid: 'A0001'});
expect(adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('4.3 throws an error when transaction type is invalid', () => {
    let adacoin_block = new Block('2023-07-01', {amount: '10.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(AdaError);
  });
  
  test('4.2 block has a valid transaction type - debit', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '10.00', tid: 'A0001'});
expect(adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('4.4 throws an error when transaction type is invalid', () => {
    let adacoin_block = new Block('1/1/1970', {'Debit': '10.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(AdaError);
  });
  
  test('4.5 block has a valid transaction id', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10.00', tid: 'A0001'});
expect(adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('4.6 throws an error when block does not have a transaction id', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10.00'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(AdaError);
  });

  test('4.7 credit value is within permitted range', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '500.00', tid: 'A0001'});
    let adacoin_block2 = new Block('1/1/1970', {credit: '0.01', tid: 'A0002'});
    let adacoin_block3 = new Block('1/1/1970', {credit: '10000.00', tid: 'A0003'});
    expect(adacoin_block.isValidTransaction()).toBe(true);
expect(adacoin_block2.isValidTransaction()).toBe(true);
expect(adacoin_block3.isValidTransaction()).toBe(true);
  });
  
  test('4.8a credit value is not within permitted range - positive', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10000.01', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error)  });
  
  test('4.8b credit value is not within permitted range - negative', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '-0.01', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.9 debit value is within permitted range', () => {
     let adacoin_block1 = new Block('1/1/1970', {debit: '10.00', tid: 'A0001'});
    let adacoin_block2 = new Block('1/1/1970', {debit: '0.01', tid: 'A0002'});
    let adacoin_block3 = new Block('1/1/1970', {debit: '1000.00', tid: 'A0003'});
    expect(adacoin_block1.isValidTransaction()).toBe(true);
    expect(adacoin_block2.isValidTransaction()).toBe(true);
    expect(adacoin_block3.isValidTransaction()).toBe(true);
  });
  
  test('4.10a debit value is not within permitted range - positive', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '1001.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.10b debit value is not within permitted range - negative', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '-1.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.11a debit value is not correctly formatted', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '1', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.11b debit value is not correctly formatted', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '10.9', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.11c debit value is not correctly formatted as a string', () => {
    let adacoin_block = new Block('1/1/1970', {debit: 9.99, tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.12a credit value is not correctly formatted', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '1.333', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
   test('4.12b credit value is not correctly formatted as a string', () => {
    let adacoin_block = new Block('1/1/1970', {credit: 9.00, tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.13a credit value of 0 is rejected', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '0', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('4.13b debit value of 0 is rejected', () => {
      let adacoin_block = new Block('1/1/1970', {debit: '0', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
});

describe('5. Adding transactions to the chain test suite', () => {
  
  test('5.1a add a valid block to the chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '25.50', tid: 'A0001' }));
expect(adaWallet.chain[0].transaction).toBe("Genesis Block");
    expect(adaWallet.isValid()).toBe(true);
  });

    test('5.1b add a valid debit block to the chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { debit: '25.50', tid: 'A0001' }));
expect(adaWallet.chain[0].transaction).toBe("Genesis Block");
    expect(adaWallet.isValid()).toBe(true);
  });

  test('5.2 adds valid block(s) to the chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0001' }));
   expect(adaWallet.chain.length).toBe(2); 
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0002' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: 'A0003' }));
    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain.length).toBe(4);
  });
  
  test('5.3 does not add a block with invalid date to the chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block('2024-01-02', {credit: '25.50', tid: 'A0001'}));
    expect(adaWallet.chain.length).toBe(1);
  });

  test('5.4 does not add a block with invalid date and transaction to the chain', () => {
    let adaWallet = new Chain();
    expect(() => {adaWallet.addblock(new Block('2024-01-02', {credit: 2.5, tid: 'A0001'}))}).toThrow(Error);
    expect(adaWallet.chain.length).toBe(1);
  });

  test('5.5 does not accept duplicate ids of blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: 'A0001' }));
    expect(adaWallet.chain.length).toBe(2);
  });

  test('5.6 is valid chain function returns true if valid', () => {
    let adacoin = new Chain();
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0002' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0003' }));
    expect(adacoin.isValid()).toBe(true);
  });
  
  test('5.7 is valid chain function returns false if block is edited', () => {
    let adacoin = new Chain();
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0002' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0003' }));
    adacoin.chain[2].transaction = {'credit': '200.00'};
    expect(adacoin.isValid()).toBe(false);
  });
  
  test('5.8 delete an item in the chain returns false for valid chain', () => {
    let adacoin = new Chain();
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0002' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0003' }));
    adacoin.chain.splice(1,1);
    expect(adacoin.isValid()).toBe(false);
  });

  test('5.9 replace item into the chain returns false for valid chain', () => {
    let adaWallet = new Chain();
    let badBlock = new Block('2023-07-12', { credit: '20.00', tid: 'A0003' });
    
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain.splice(1, 1, badBlock)
    expect(adaWallet.isValid()).toBe(false);
  });

  test('5.10 delete item into the chain returns false for valid chain', () => {
    let adaWallet = new Chain();
    let badBlock = new Block('2023-07-12', { credit: '20.00', tid: 'A0003' });
    
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain.splice(1, 0, badBlock)
    expect(adaWallet.isValid()).toBe(false);
  });
  
  
});


describe('6. balance feature test suite', () => {

  test('6.1 returns a 0 balance if there is only genesis block', () => {
    let adaWallet = new Chain();
    expect(adaWallet.balance()).toBe(0);
  });

  test('6.2 returns a float in format x.xx', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0001' }));
    expect(adaWallet.balance()).toBe("£20.00");
  });

  test('6.3 sums two credit blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '10.00', tid: 'A0001' }));
  adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0002' }));
    expect(adaWallet.balance()).toBe("£30.00");
  });

  test('6.4 sums three credit blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '10.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0002' }));
    adaWallet.addblock(new Block( '2023-07-03', { credit: '30.00', tid: 'A0003' }));
    expect(adaWallet.balance()).toBe("£60.00");
  });

  test('6.5 subtracts a debit block', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { debit: '10.00', tid: 'A0001' }));
    expect(adaWallet.balance()).toBe("-£10.00");
  });

  test('6.6 subtracts two debit blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { debit: '10.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: 'A0002' }));
    expect(adaWallet.balance()).toBe("-£30.00");
  });

  test('6.7 adds a credit then subtracts a debit', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.20', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '10.05', tid: 'A0002' }));
    expect(adaWallet.balance()).toBe("£10.15");
  });

  test('6.8 adds a credit then subtracts a debit', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '10.50', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '15.25', tid: 'A0002' }));
    adaWallet.addblock(new Block( '2023-07-03', { credit: '8.75', tid: 'A0003' }));
    expect(adaWallet.balance()).toBe("£4.00");
  });
  
});

describe('7. rebuild tests', () => {
  test('7.1 rebuild used on an invalid chain(deleted block), results in a valid chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain.splice(1,1);
    expect(adaWallet.isValid()).toBe(false);
    adaWallet.rebuild();

    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain[1].phash).toEqual(adaWallet.chain[0].hash);
    
  });

  test('7.2 rebuild used on an invalid chain(edited block) results in a valid chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain[1].transaction = {'credit': '200.00'};
    expect(adaWallet.isValid()).toBe(false);
    adaWallet.rebuild();
    expect(adaWallet.isValid()).toBe(true);
        expect(adaWallet.chain[1].phash).toEqual(adaWallet.chain[0].hash);
  });

  test('7.3 rebuild used on an invalid chain (replaced block) results in a valid chain', () => {
    let adaWallet = new Chain();
    let badBlock = new Block('2023-07-12', { credit: '1000.00', tid: 'A0003' });
    
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));

    adaWallet.chain.splice(1, 1, badBlock)
    expect(adaWallet.isValid()).toBe(false);
    adaWallet.rebuild();
    expect(adaWallet.isValid()).toBe(true);
        expect(adaWallet.chain[2].phash).toEqual(adaWallet.chain[1].hash);
  });

    test('7.4 rebuild used on an invalid chain (inserted block) results in a valid chain', () => {
    let adaWallet = new Chain();
    let badBlock = new Block('2023-07-12', { credit: '1000.00', tid: 'A0003' });
    
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));

    adaWallet.chain.splice(1, 0, badBlock)
    expect(adaWallet.isValid()).toBe(false);
    adaWallet.rebuild();
    expect(adaWallet.isValid()).toBe(true);
        expect(adaWallet.chain[3].phash).toEqual(adaWallet.chain[2].hash);
  });

   test('7.5 rebuild used on a valid chain, chain is still valid', () => {
    let adaWallet = new Chain();

    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));

    expect(adaWallet.isValid()).toBe(true);
    adaWallet.rebuild();
    expect(adaWallet.isValid()).toBe(true);
        expect(adaWallet.chain[2].phash).toEqual(adaWallet.chain[1].hash);
  });
});

describe('8. uuid tests', () => {

  test('8.1 add a new block using uuid', () => {
    let adacoin_block = new Block( '2023-07-02', { credit: '25.50', tid: uuidv4() });
    expect (adacoin_block).toBeInstanceOf(Block);
  });

  test('8.2 add block to a chain using uuid as tid', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '25.50', tid: uuidv4() }));
expect(adaWallet.chain[0].transaction).toBe("Genesis Block");
    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain.length).toBe(2);
  });

test('8.3 add multiple blocks to a chain using uuid as tids', () => {
  let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: uuidv4() }));
   expect(adaWallet.chain.length).toBe(2); 
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: uuidv4() }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: uuidv4() }));
    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain.length).toBe(4);
});
  
})
  
