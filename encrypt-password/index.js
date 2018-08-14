var fs = require('fs');
var path = require('path');

var encrypt = {
  encryptPassword: fs.readFileSync(path.join(__dirname, 'EncryptPassword')).toString(),
  encryptAlgorithm: 'aes-256-ctr'
};

module.exports = encrypt;
