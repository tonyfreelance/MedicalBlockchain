var express = require('express');
var router = express.Router();
var config = require('../config');
var blockchainMethods = require("../blockchain/blockchain");
var Block = blockchainMethods.Block;
var Blockchain = blockchainMethods.Blockchain;
var Transaction = blockchainMethods.Transaction;
var getBlockchain = blockchainMethods.getBlockchain;
var createTransaction = blockchainMethods.createTransaction;
var mineBlock = blockchainMethods.mineBlock;
var connectToPeers = blockchainMethods.connectToPeers;
var getSockets = blockchainMethods.getSockets;
var getRecordsForPatient = blockchainMethods.getRecordsForPatient;
var getRecordsForDoctor = blockchainMethods.getRecordsForDoctor;


// console.log(blockchainMethods);

router.get('/', function(req, res, next) {
  res.send(JSON.stringify(getBlockchain()));
});

router.post('/createTransaction', function(req, res, next) {
  var User = require('../models/user')();

  User.findOne({publicKey: req.body.fromAddress}, function(err, user) {
    if (err) {
      return res.send(err)
    }
    var sender = user.firstName + ' ' + user.lastName;

    // Send to all partners in partners list
    for(const partner of user.partners) {
      createTransaction(req.body.fromAddress, partner, req.body.record, sender);
    }

    var resData = {
      sender: req.body.fromAddress
    };

    res.send(sender);
  });

});

router.post('/createTransactionForDoctor', function(req, res, next) {
  var User = require('../models/user')();

  User.findOne({publicKey: req.body.fromAddress}, function(err, user) {
    if (err) {
      return res.send(err)
    }
    var sender = user.firstName + ' ' + user.lastName;

    createTransaction(req.body.fromAddress, req.body.toAddress, req.body.record, sender);

    var resData = {
      sender: req.body.fromAddress
    };

    res.send(sender);
  });

});

router.post('/mineBlock', function (req, res, next) {
  var latestBlock = mineBlock();
  res.send(latestBlock);
});

router.get('/peers', function (req, res, next) {
  res.send(getSockets().map((s) => s._socket.remoteAddress + ':' + s._socket.remotePort));
});

router.post('/addPeer', function (req, res, next) {
  connectToPeers([req.body.peer]);
  res.send();
});

router.post('/getRecordsForPatient', function(req, res, next) {
  var address = req.body.publicKey;
  var transactions = getRecordsForPatient(address);
  var records = [];

  for(const transaction of transactions){

    var record = {
      record: transaction.record,
      sender: transaction.sender,
      timestamp: transaction.timestamp,
      fromAddress: transaction.fromAddress
    };
    records.push(record);
  }

  return res.send(records);
});

router.post('/getRecordsForDoctor', function(req, res, next) {
  var User = require('../models/user')();
  var address = req.body.publicKey;

  User.findOne({publicKey: address}, function(err, user) {
    if (err) {
      return res.send(err)
    }
    var transactions = getRecordsForDoctor(address, user.partners);
    var records = [];

    for(const transaction of transactions){
      var record = {
        record: transaction.record,
        sender: transaction.sender,
        timestamp: transaction.timestamp,
        fromAddress: transaction.fromAddress
      };
      records.push(record);
    }

    return res.send(records);
  });
});

module.exports = router;
