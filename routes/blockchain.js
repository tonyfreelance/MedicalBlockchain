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


// console.log(blockchainMethods);

router.get('/', function(req, res, next) {
  res.send(JSON.stringify(getBlockchain()));
});

router.post('/createTransaction', function(req, res, next) {
  createTransaction(req.body.fromAddress, req.body.toAddress, req.body.record);
  res.send("OK");
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

module.exports = router;
