var express = require('express');
var router = express.Router();
var config = require('../config');
var passport = require('passport');

/* POST request to check authorization during login */
router.post('/', function(req, res, next) {
  return passport.authenticate('local-login', function(err, userData) {
      if (err) {
        if (err.name === 'IncorrectCredentialsError') {
          console.log(err.message);
          return res.status(400).json({
            success: false,
            message: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: 'Could not process the form.'
        });
      }
      return res.send(userData);
    })(req, res, next);
});

module.exports = router;
