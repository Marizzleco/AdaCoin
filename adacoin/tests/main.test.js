const { ADACOIN_ERROR, AdaError, Block, Chain, TS } = require('../src/main.js');
const { v4: uuidv4 } = require('uuid');

describe('chain test suite', () => {
  test('initialise a new chain', () => {
    let adacoin = new Chain();
    expect(adacoin).toBeInstanceOf(Chain);
  });
  
  test('new chain starts with genesis block', () => {
    let adacoin = new Chain();
    let date = new TS;
    expect(adacoin.chain[0].transaction).toBe("Genesis Block");
    expect(adacoin.chain[0].ts).toBe(date.today);
  });
  
  test('is valid chain function returns true if valid', () => {
    let adacoin = new Chain();
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0002' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0003' }));
    expect(adacoin.isValid()).toBe(true);
  });
  
  test('is valid chain function returns false if not valid', () => {
    let adacoin = new Chain();
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0002' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0003' }));
    adacoin.chain[2].transaction = {'credit': '200.00'};
    expect(adacoin.isValid()).toBe(false);
  });
  
  test('changing item further back in chain returns false for valid chain', () => {
    let adacoin = new Chain();
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0002' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0003' }));
    adacoin.chain[1].transaction = {credit: 200};
    expect(adacoin.isValid()).toBe(false);
  });
  
  test('delete an item in the chain returns false for valid chain', () => {
    let adacoin = new Chain();
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0002' }));
    adacoin.addblock(new Block( '2023-07-02', { credit: '25.50', tid: 'A0003' }));
    adacoin.chain.splice(1,1);
    expect(adacoin.isValid()).toBe(false);
  });

  test('replace item into the chain returns false for valid chain', () => {
    let adaWallet = new Chain();
    let badBlock = new Block('2023-07-12', { credit: '20.00', tid: 'A0003' });
    
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain.splice(1, 1, badBlock)
    expect(adaWallet.isValid()).toBe(false);
  });

  test('delete item into the chain returns false for valid chain', () => {
    let adaWallet = new Chain();
    let badBlock = new Block('2023-07-12', { credit: '20.00', tid: 'A0003' });
    
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain.splice(1, 0, badBlock)
    expect(adaWallet.isValid()).toBe(false);
  });
  
});

describe('transaction validation test suite', () => {

  test('block has a valid transaction type - credit', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10.00', tid: 'A0001'});
expect(adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('throws an error when transaction type is invalid', () => {
    let adacoin_block = new Block('2023-07-01', {amount: '10.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(AdaError);
  });
  
  test('block has a valid transaction type - debit', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '10.00', tid: 'A0001'});
expect(adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('throws an error when transaction type is invalid', () => {
    let adacoin_block = new Block('1/1/1970', {'Debit': '10.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(AdaError);
  });
  
  test('block has a valid transaction id', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10.00', tid: 'A0001'});
expect(adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('throws an error when block does not have a transaction id', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10.00'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(AdaError);
  });

  test('credit value is within permitted range', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '500.00', tid: 'A0001'});
    let adacoin_block2 = new Block('1/1/1970', {credit: '0.01', tid: 'A0002'});
    let adacoin_block3 = new Block('1/1/1970', {credit: '10000.00', tid: 'A0003'});
    expect(adacoin_block.isValidTransaction()).toBe(true);
expect(adacoin_block2.isValidTransaction()).toBe(true);
expect(adacoin_block3.isValidTransaction()).toBe(true);
  });
  
  test('credit value is not within permitted range - positive', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '10001.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error)  });
  
  test('credit value is not within permitted range - negative', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '-0.01', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('debit value is within permitted range', () => {
     let adacoin_block1 = new Block('1/1/1970', {debit: '10.00', tid: 'A0001'});
    let adacoin_block2 = new Block('1/1/1970', {debit: '0.01', tid: 'A0002'});
    let adacoin_block3 = new Block('1/1/1970', {debit: '1000.00', tid: 'A0003'});
    expect(adacoin_block1.isValidTransaction()).toBe(true);
    expect(adacoin_block2.isValidTransaction()).toBe(true);
    expect(adacoin_block3.isValidTransaction()).toBe(true);
  });
  
  test('debit value is not within permitted range - positive', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '1001.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('debit value is not within permitted range - negative', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '-1.00', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('debit value is not correctly formatted', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '1', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('debit value is not correctly formatted', () => {
    let adacoin_block = new Block('1/1/1970', {debit: '10.9', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('debit value is not correctly formatted as a string', () => {
    let adacoin_block = new Block('1/1/1970', {debit: 9.99, tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('credit value is not correctly formatted', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '1.333', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
   test('credit value is not correctly formatted as a string', () => {
    let adacoin_block = new Block('1/1/1970', {credit: 9.00, tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
  test('credit value of 0 is rejected', () => {
    let adacoin_block = new Block('1/1/1970', {credit: '0', tid: 'A0001'});
  });
  
  test('debit value of 0 is rejected', () => {
      let adacoin_block = new Block('1/1/1970', {debit: '0', tid: 'A0001'});
    expect(() => {adacoin_block.isValidTransaction()}).toThrow(Error);
  });
  
});

describe.skip('validating timestamp test suite', () => {
  test('timestamp is in valid ISO 8601 format', () => {
    let ts = new TS();
    // expect (  ts.today ).toBe('2023-07-11');
    expect (ts.isdatevalid('2023-07-03') ).toBe(true);
    expect(() => ts.isdatevalid('2023-13-13')).toThrow("AdaCoin Error");
    expect(() => ts.isdatevalid('2023')).toThrow("AdaCoin Error");
  });
  
  test('timestamp days since function returns correct time difference', () => {
    let ts = new TS();
    expect(ts.dayssince('2023-07-07')).toBe(0);
    expect(ts.dayssince('2022-07-07')).toBe(365);
    expect(ts.dayssince('2024-07-07')).toBe(-366);
    expect(() => {ts.dayssince('2023-13-13')}).toThrow("AdaCoin Error");
    expect(() => {ts.dayssince('2023')}).toThrow("AdaCoin Error");
  });
  
});

describe('block test suite', () => {
  
    test('instantiate a block', () => {
    let adacoin_block = new Block( '2023-07-02', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block).toBeInstanceOf(Block);
    expect (adacoin_block.ts).toBe('2023-07-02');
    expect (adacoin_block.tid).toBe('A0001');
    // expect (adacoin_block.debitvalue).toEqual(0);
    // expect (adacoin_block.creditvalue).toEqual(25.50);
    expect (adacoin_block.validtimestamp()).toBe(true);
    expect (adacoin_block.isValidTransaction()).toBe(true);
  });
  
  test('block with invalid date property - over 180 days ago', () => {
    let adacoin_block = new Block( '2022-12-31', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('block with invalid date property - wrong format', () => {
      let adacoin_block = new Block( '2022-6-3', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('block with invalid date property - future date', () => {
      let adacoin_block = new Block( '2023-12-01', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('block with invalid date property - not a date', () => {
      let adacoin_block = new Block( '2024-15-93', { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });
  
  test('block with missing date property', () => {
      let adacoin_block = new Block( { credit: '25.50', tid: 'A0001' });
    expect (adacoin_block.validtimestamp()).toBe(false);
  });

  test('block with missing id', () => {
    let adacoin_block = new Block( '2023-07-02', { credit: '25.50'});
    expect (() => {adacoin_block.isValidTransaction()}).toThrow("AdaCoin Error");
  });

  test('block has an alphanumeric id', () => {
    let adacoin_block = new Block('2023-07-02', {
      credit: '25.00', tid: "A0001"
    });
    expect (adacoin_block.isValidTransaction()).toBe(true);
    let adacoin_block2 = new Block('2023-07-02', {
      credit: '25.00', tid: ""
    });
    expect (adacoin_block.isValidTransaction()).toBe(false);
  });
  
});

describe('chain tests', () => {
  
  test('add a valid block to the chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '25.50', tid: 'A0001' }));
expect(adaWallet.chain[0].transaction).toBe("Genesis Block");
    expect(adaWallet.isValid()).toBe(true);
  });

  test.skip('adds valid block(s) to the chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0001' }));
   expect(adaWallet.chain.length).toBe(2); 
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0002' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: 'A0003' }));
    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain.length).toBe(4);
  });
  
  test('does not add an invalid block to the chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block('2024-01-02', {credit: '25.50', tid: 'A0001'}));
    expect(adaWallet.chain.length).toBe(1);
  });

  test('does not accept duplicate ids of blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: 'A0001' }));
    expect(adaWallet.chain.length).toBe(2);
  })
  
});


describe('balance tests', () => {

  test('returns a 0 balance if there is only genesis block', () => {
    let adaWallet = new Chain();
    expect(adaWallet.balance()).toBe(0);
  });

  test('returns a float in format x.xx', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0001' }));
    expect(adaWallet.balance()).toBe("Your balance is £20.00");
  });

  test('adds two credit blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '10.00', tid: 'A0001' }));
  adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0002' }));
    expect(adaWallet.balance()).toBe("Your balance is £30.00");
  });

  test('adds three credit blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '10.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: 'A0002' }));
    adaWallet.addblock(new Block( '2023-07-03', { credit: '30.00', tid: 'A0003' }));
    expect(adaWallet.balance()).toBe("Your balance is £60.00");
  });

  test('subtracts a debit block', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { debit: '10.00', tid: 'A0001' }));
    expect(adaWallet.balance()).toBe("Your balance is -£10.00");
  });

  test('subtracts two debit blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { debit: '10.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: 'A0002' }));
    expect(adaWallet.balance()).toBe("Your balance is -£30.00");
  });

test('subtracts three debit blocks', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { debit: '10.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: 'A0002' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '30.00', tid: 'A0003' }));
    expect(adaWallet.balance()).toBe("Your balance is -£60.00");
  });

test('adds a credit then subtracts a debit', () => {
  let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.20', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '10.05', tid: 'A0002' }));
    expect(adaWallet.balance()).toBe("Your balance is £10.15");
});

  test('adds a credit then subtracts a debit', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '10.50', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '15.25', tid: 'A0002' }));
    adaWallet.addblock(new Block( '2023-07-03', { credit: '8.75', tid: 'A0003' }));
    expect(adaWallet.balance()).toBe("Your balance is £4.00");
  });
  
});

describe('rebuild tests', () => {
  test('rebuild used on an invalid chain(deleted block), results in a valid chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain.splice(1,1);
    expect(adaWallet.isValid()).toBe(false);
    adaWallet.rebuild();

    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain[1].phash).toEqual(adaWallet.chain[0].hash);
    
  });

  test('rebuild used on an invalid chain(edited block) results in a valid chain', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-12', { credit: '20.00', tid: 'A0001' }));
    adaWallet.addblock(new Block( '2023-07-12', { debit: '20.00', tid: 'A0002' }));
    adaWallet.chain[1].transaction = {'credit': '200.00'};
    expect(adaWallet.isValid()).toBe(false);
    adaWallet.rebuild();
    expect(adaWallet.isValid()).toBe(true);
        expect(adaWallet.chain[1].phash).toEqual(adaWallet.chain[0].hash);
  });

  test('rebuild used on an invalid chain (replaced block) results in a valid chain', () => {
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

    test('rebuild used on an invalid chain (replaced block) results in a valid chain', () => {
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
});

describe('uuid tests', () => {

  test('add a new block using uuid', () => {
    let adacoin_block = new Block( '2023-07-02', { credit: '25.50', tid: uuidv4() });
    expect (adacoin_block).toBeInstanceOf(Block);
  });

  test('add block to a chain using uuid as tid', () => {
    let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '25.50', tid: uuidv4() }));
expect(adaWallet.chain[0].transaction).toBe("Genesis Block");
    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain.length).toBe(2);
  });

test('add multiple blocks to a chain using uuid as tids', () => {
  let adaWallet = new Chain();
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: uuidv4() }));
   expect(adaWallet.chain.length).toBe(2); 
    adaWallet.addblock(new Block( '2023-07-03', { credit: '20.00', tid: uuidv4() }));
    adaWallet.addblock(new Block( '2023-07-03', { debit: '20.00', tid: uuidv4() }));
    expect(adaWallet.isValid()).toBe(true);
    expect(adaWallet.chain.length).toBe(4);
});
  
})
  
