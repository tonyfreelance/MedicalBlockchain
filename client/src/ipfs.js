var IPFS = require("ipfs-api");
var ipfs = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" });
//run with local daemon
// const ipfsApi = require(‘ipfs-api’);
// const ipfs = new ipfsApi(‘localhost’, ‘5001’, {protocol:‘http’});
module.exports = ipfs;