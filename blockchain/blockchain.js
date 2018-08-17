var CryptoJS = require("crypto-js");
var WebSocket = require("ws");

class Block {
    constructor(index, previousHash, timestamp, transactions) {
        this.index = index;
        this.previousHash = previousHash.toString();
        this.timestamp = timestamp;
        this.transactions = transactions;
        this.hash = this.calculateHashInternal();
        this.nonce = 0;
    }

    calculateHashInternal() {
      return CryptoJS.SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.transactions) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")) {
            this.nonce++;
            this.hash = this.calculateHashInternal();;
        }

        console.log("BLOCK MINED: " + this.hash);
      }
}

class Transaction{
  constructor(fromAddress, toAddress, record, timestamp, sender){
      this.fromAddress = fromAddress;
      this.toAddress = toAddress;
      this.record = record;
      this.timestamp = timestamp;
      this.sender = sender;
  }
}

class Blockchain {

  constructor() {
      this.chain = [this.createGenesisBlock()];
      this.difficulty = 4;
      this.pendingTransactions = [];
  }

  updateBlockchain(newChain) {
      this.chain = newChain;
  }

  createGenesisBlock() {
      return new Block(0, "0", 1465154705, []);
  }

  getLatestBlock() {
      return this.chain[this.chain.length - 1];
  }

  minePendingTransactions(){
      let block = new Block(this.getLatestBlock().index + 1, this.getLatestBlock().hash, Date.now(), this.pendingTransactions);
      block.mineBlock(this.difficulty);

      console.log('Block successfully mined!');
      this.chain.push(block);

      // Reset the pendingTransactions array
      this.pendingTransactions = [];
  }

  createTransaction(transaction){
      this.pendingTransactions.push(transaction);
      console.log('Add transaction successfully!');
  }
}


// ======================================================= Handle Blockchain things here ========================================


var blockchain = new Blockchain();
var sockets = [];
var MessageType = {
    QUERY_LATEST: 0,
    QUERY_ALL: 1,
    RESPONSE_BLOCKCHAIN: 2
};

var getLatestBlock = () => {
  return blockchain.getLatestBlock();
}

var getBlockchain = () => blockchain.chain;

var addBlockToChain = (newBlock) => {
  blockchain.chain.push(newBlock);
}

var createTransaction = (fromAddress, toAddress, record, sender) => {
  blockchain.createTransaction(
    new Transaction(fromAddress, toAddress, record, Date.now(), sender)
  );
  // var latestTransaction = this.pendingTransactions[this.pendingTransactions.length - 1];
  // return latestTransaction;
}

var mineBlock = () => {
  blockchain.minePendingTransactions();
  broadcastLatest();
  return blockchain.getLatestBlock();
}

var calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.transactions, block.nonce);
};

var calculateHash = (index, previousHash, timestamp, transactions, nonce) => {
    // return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
    return CryptoJS.SHA256(index + previousHash + timestamp + JSON.stringify(transactions) + nonce).toString();
};

var isValidNewBlock = (newBlock, previousBlock) => {
    if (previousBlock.hash !== newBlock.previousHash) {
        console.log('invalid previousHash');
        return false;
    } else if (calculateHashForBlock(newBlock) !== newBlock.hash) {
        console.log(typeof (newBlock.hash) + ' ' + typeof calculateHashForBlock(newBlock));
        console.log('invalid hash: ' + calculateHashForBlock(newBlock) + ' ' + newBlock.hash);
        return false;
    }
    return true;
};

var isValidChain = (blockchainToValidate) => {
    if (JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(blockchain.createGenesisBlock())) {
        return false;
    }
    var tempBlocks = [blockchainToValidate[0]];
    for (var i = 1; i < blockchainToValidate.length; i++) {
        if (isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
            tempBlocks.push(blockchainToValidate[i]);
        } else {
            return false;
        }
    }
    return true;
};

var replaceChain = (newBlocks) => {
    if (isValidChain(newBlocks) && newBlocks.length > blockchain.chain.length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain.chain = newBlocks;
        broadcastLatest();
    } else {
        console.log('Received blockchain invalid');
    }
};

var getRecordsForPatient = (address) => {
  let transactions = [];

  let dupRecord = 0;
   for(const block of blockchain.chain){
       for(const transaction of block.transactions) {
           if(transaction.fromAddress === address && transaction.record !== dupRecord){
               transactions.push(transaction);
               dupRecord = transaction.record;
           } else if (transaction.toAddress === address) {
             transactions.push(transaction);
           }
       }
   }
   console.log('getRecordsForPatient: ', transactions);
   return transactions;
};

var getRecordsForDoctor = (address, sharedPatients) => {
  let transactions = [];

  let dupRecord = 0;
   for(const block of blockchain.chain){
       for(const transaction of block.transactions){
           // Doctor can only see records which were uploaded by themselves or from patients who agree to share with them
           if(transaction.fromAddress === address && transaction.record !== dupRecord){
               transactions.push(transaction);
               dupRecord = transaction.record;
           } else if (transaction.toAddress === address && sharedPatients.includes(transaction.fromAddress)) {
             transactions.push(transaction);
           }
       }
   }
   console.log('getRecordsForDoctor: ', transactions);
   return transactions;
};



// ============================================== P2P section ==================================================================





var initP2PServer = (p2p_port) => {
    var server = new WebSocket.Server({port: p2p_port});
    server.on('connection', ws => initConnection(ws));
    console.log('listening websocket p2p port on: ' + p2p_port);
};

var getSockets = () => sockets;

var initConnection = (ws) => {
    sockets.push(ws);
    initMessageHandler(ws);
    initErrorHandler(ws);
    write(ws, queryChainLengthMsg());
};

var initMessageHandler = (ws) => {

    ws.on('message', (data) => {
        var message = JSON.parse(data);
        console.log('Received message' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:
                write(ws, responseLatestMsg());
                break;
            case MessageType.QUERY_ALL:
                write(ws, responseChainMsg());
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:
                handleBlockchainResponse(message);
                break;
        }
    });
};

var initErrorHandler = (ws) => {
    var closeConnection = (ws) => {
        console.log('connection failed to peer: ' + ws.url);
        sockets.splice(sockets.indexOf(ws), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

var connectToPeers = (newPeers) => {
    newPeers.forEach((peer) => {
        var ws = new WebSocket(peer);
        ws.on('open', () => initConnection(ws));
        ws.on('error', () => {
            console.log('connection failed')
        });
    });
};

var handleBlockchainResponse = (message) => {
    var receivedBlocks = JSON.parse(message.data).sort((b1, b2) => (b1.index - b2.index));
    var latestBlockReceived = receivedBlocks[receivedBlocks.length - 1];
    var latestBlockHeld = getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: ' + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            console.log("We can append the received block to our chain");
            addBlockToChain(latestBlockReceived);
            broadcast(responseLatestMsg());
        } else if (receivedBlocks.length === 1) {
            console.log("We have to query the chain from our peer");
            broadcast(queryAllMsg());
        } else {
            console.log("Received blockchain is longer than current blockchain");
            replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than current blockchain. Do nothing');
    }
};

var broadcastLatest = () => {
  broadcast(responseLatestMsg());
};

// var getLatestBlock = () => blockchain[blockchain.length - 1];
var queryChainLengthMsg = () => ({'type': MessageType.QUERY_LATEST});
var queryAllMsg = () => ({'type': MessageType.QUERY_ALL});
var responseChainMsg = () =>({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify(blockchain.chain)
});
var responseLatestMsg = () => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([blockchain.getLatestBlock()])
});

var write = (ws, message) => ws.send(JSON.stringify(message));
var broadcast = (message) => sockets.forEach(socket => write(socket, message));


module.exports = {Block, Blockchain, Transaction, getBlockchain, getLatestBlock, replaceChain, addBlockToChain, createTransaction, mineBlock, connectToPeers, broadcastLatest, initP2PServer, getSockets, getRecordsForPatient, getRecordsForDoctor};
