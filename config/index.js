// Main confi file
var env = process.env.NODE_ENV || 'development';

var configuration = require('./env/' + env);

configuration.dbURI = 'mongodb://localhost/medicalblockchain';
configuration.jwtSecret = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9';

module.exports = configuration;
