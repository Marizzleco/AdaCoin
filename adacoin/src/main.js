const SHA256 = require('crypto-js/sha256');
const moment = require('moment');
const fs = require('fs');
const log = fs.createWriteStream('./adacoin.log', { flags: 'w+' } );
const { v4: uuidv4 } = require('uuid');

//define the custom adacoin error messages
const ADACOIN_ERROR = {
  MISSING_CREDIT_DEBIT: { id: 'T01', description: 'transaction missing specific credit or debit type' },
  UNEXPECTED_CREDITVALUE: { id: 'T02', description: 'transaction unexpected credit value format (n.nn)' },
  UNEXPECTED_DEBITVALUE: { id: 'T03', description: 'transaction unexpected debit value format (n.nn)' },
  MISSING_ID: { id: 'T04', description: 'transaction missing transaction id' },
  INVALID_ID: { id: 'T05', description: 'transaction invalid transaction id' },
  INVALID_DATE: { id: 'D01', description: 'invalid iso date, dates must be: yyyy-mm-dd' },
  CHAIN_UNEXPECTEDFAIL: { id: 'C01', description: 'unexpected failure in chain' }
};

class AdaError extends Error { // create a custom error class, used to throw errors 
  constructor(adaerror, errorvalue) {
    super("AdaCoin Error"); // pass string to the parent/super class
    this.id = adaerror.id; // setup custom properties
    this.description = adaerror.description; // some extra variables to store added detail 
    this.value = errorvalue;
  }
};

class TS { 
  #now;
  constructor() { 
    this.#now = moment().format('YYYY-MM-DD'); 
  }

  get today() { return this.#now }
  
  isdatevalid(isodate) { // return true or false depending on whether the passed iso date is a valid date

    if(!(moment(isodate, 'YYYY-MM-DD', true).isValid())) {
      throw new AdaError(ADACOIN_ERROR.INVALID_DATE, isodate); 
    };

    return true; 
  }
  
  dayssince(isodate) {
    //returns an error or the number of days between the isodate and 'today'; negative values are in the future
    try { this.isdatevalid(isodate); } // try and catch
    catch(e) { 
      throw new AdaError(ADACOIN_ERROR.INVALID_DATE, isodate); 
    };
    
    let ms = new Date(this.today) - new Date(isodate); //milliseconds (ms) elapsed between dates
    return (((ms / 1000) / 60) / 60) / 24 ; //ms -> seconds -> mins -> hours -> days; returns difference as days
  }
};

const isValidCurrency = (value) => {
  if(typeof value != 'string') {
    return false;
  }
  let regexPattern = /^\d+\.\d{2}$/;
  return regexPattern.test(value) ? true : false;
}


class Block {
  
  constructor(ts, transaction, phash) {
    this.ts = ts;
    this.transaction = transaction;
    this.phash = phash;
//create new hash for this block - calculated on information provided above
    this.hash = this.calculatehash();
  };

  calculatehash() {
    let hash = SHA256(this.ts + JSON.stringify(this.transaction) + this.phash);
    //returns a string
    return hash.toString();
  }

  get tid() {
    return this.transaction.tid;
  }

  validtimestamp() {
    let ts = new TS(); // create a new instance of the timestamp object from the class
    try {
      ts.isdatevalid(this.ts);
    }
    catch(e) {
      return false;
    }
    if(ts.dayssince(this.ts) >= 0 && ts.dayssince(this.ts) < 180){
      return true;
    } else {
      return false;
    }
  }

  isValidTransaction() {
    if(!(this.transaction.hasOwnProperty('tid'))) {
      throw new AdaError(ADACOIN_ERROR.MISSING_ID);
    }
    if(!(this.transaction.hasOwnProperty('credit') || this.transaction.hasOwnProperty('debit'))) {
      throw new AdaError(ADACOIN_ERROR.MISSING_CREDIT_DEBIT);
    }
    if(this.transaction['credit'] < 0 || this.transaction['credit'] > 10000 || this.transaction['debit'] < 0 || this.transaction['debit'] > 1000) {
      throw new AdaError(ADACOIN_ERROR.UNEXPECTED_DEBITVALUE, this.transaction.debit);
    }
    if(this.transaction['debit']) {
      if(!(isValidCurrency(this.transaction.debit))) {
        throw new AdaError(ADACOIN_ERROR.UNEXPECTED_DEBITVALUE, this.transaction.debit);
      }
    }
    if(this.transaction['credit']) {
      if(!(isValidCurrency(this.transaction.credit))) {
        throw new AdaError(ADACOIN_ERROR.UNEXPECTED_CREDITVALUE, this.transaction.credit);
      }
    }
    return true;
  }
  
};


class Chain {
  //when chain intatiated creates a new array, assigns first element to genesis block
  constructor() {
    this.chain = [this.genesisblock()];
  };
  
//initialise genesis block - look at the date maybe use current date? no previous link
  genesisblock() {
    return new Block(moment().format('YYYY-MM-DD'), 'Genesis Block', 0);
  };
  
//tells us what length of current chain -1 returns the last block
  lastblock() {
    return this.chain[this.chain.length - 1];
  };
  
//adds a new block & will push into chain, with hash from previous block
  addblock(newblock) {
    if(this.chain.some(e => e.tid === newblock.tid)) {
      return "invalid tid"
    }
    if(newblock.isValidTransaction() && newblock.validtimestamp())  
    {
    newblock.phash = this.lastblock().hash;
    newblock.hash = newblock.calculatehash();
    this.chain.push(newblock);
    }
  };
  
//checks chain is valid, loops through each block in chain to see if hashes match.
  isValid() {
    for(let b = 1; b < this.chain.length; b++) {
      const current = this.chain[b];
      const previous = this.chain[b - 1];
      if(current.hash !== current.calculatehash()) {
        return false;
      }
       else if(current.phash !== previous.hash) {
        return false;
      }
    }
    return true;
  };

  balance() {
    let credit = 0;
    let debit = 0;
    if(this.chain[this.chain.length -1].transaction === "Genesis Block") {
      return 0;
    }
    for(let b = 1; b < this.chain.length; b++) {
    
      if(this.chain[b].transaction.credit) {
        let num = parseFloat(this.chain[b].transaction.credit);
        credit += num;
      }
      if(this.chain[b].transaction.debit) {
        let num = parseFloat(this.chain[b].transaction.debit);
        debit += num;
      }
      
    }

    let amount = new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(credit - debit);
    return `Your balance is ${amount}`;
  }

  rebuild() {
    for(let b = 1; b < this.chain.length; b++) {
      this.chain[b].phash = this.chain[b-1].hash;
      this.chain[b].hash = this.chain[b].calculatehash();
    }
  }
}

module.exports = { ADACOIN_ERROR, AdaError, Block, Chain, TS};