var express = require('express');
var router = express.Router();
var path = require('path');

/* GET home page. */
router.get('/', function(req, res, next) {
  // if (process.env.NODE_ENV === 'production') {
  //   // For production mode
  //   res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  // } else {
  //   // For development mode
  //   res.sendFile(path.join(__dirname, '../client/public', 'index.html'));
  // }
  res.sendFile(path.join(__dirname, '../client/public', 'index.html'));
});

module.exports = router;
