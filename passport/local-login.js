var jwt = require('jsonwebtoken');
var PassportLocalStrategy = require('passport-local').Strategy;
var config = require('../config');
var User = require('../models/user')();
// var EC = require('elliptic').ec;
// var ec = new EC('secp256k1');

/**
 * Return the Passport Local Strategy object.
 */
module.exports = new PassportLocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  session: false,
  passReqToCallback: true
}, function(req, email, password, done) {

  var userData = {
    email: email.trim(),
    password: password.trim()
  };
  // find a user by email address
  return User.findOne({ email: userData.email }, function(err, user) {
    if (err) { return done(err); }

    if (!user) {
      var error = new Error('Incorrect email or password');
      error.name = 'IncorrectCredentialsError';
      return done(error);
    }

    // check if a hashed user's password is equal to a value saved in the database
    return user.comparePassword(userData.password, function(passwordErr, isMatch) {
      if (err) { return done(err); }

      if (!isMatch) {
        var error = new Error('Incorrect email or password');
        error.name = 'IncorrectCredentialsError';
        return done(error);
      }

      console.log('Login success');

      var userData = {
        fullName: user.firstName + ' ' + user.lastName,
        publicKey: user.publicKey
      }

      return done(null, userData);
    });
  });
});
