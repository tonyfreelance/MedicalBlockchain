var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlockchainSchema = new Schema({
  chain: [
    {
      index: String,
      previousHash: String,
      timestamp: String,
      transactions: [
        {
          fromAddress: String,
          toAddress: String,
          record: String
        }
      ],
      hash: String,
      nonce: Number
    }
  ],
  difficulty: Number,
  pendingTransactions: {
    type: Array,
    default: []
  }
});

var Blockchain = null;

module.exports = function(connection) {
  if(connection && Blockchain === null) {
    Blockchain = connection.model('Blockchain', BlockchainSchema);
  }
  return Blockchain;
};
