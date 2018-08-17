var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcryptjs');

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true
  },
  password: String,
  firstName: String,
  lastName: String,
  address: String,
  city: String,
  postalCode: String,
  country: String,
  phone: String, //format +xxx.xxxxxxxxx
  role: String,
  publicKey: String,
  partners: {
    type: Array,
    default: []
  },
  isApproved: { // For Doctor user type
    type: Boolean,
    default: false
  },
  hospital: String
});

/**
 * Compare the passed password with the value in the database. A model method.
 *
 * @param {string} password
 * @returns {object} callback
 */
UserSchema.methods.comparePassword = function comparePassword(password, callback) {
  bcrypt.compare(password, this.password, callback);
};

/**
 * The pre-save hook method.
 */
UserSchema.pre('save', function saveHook(next) {
  var user = this;

  // proceed further only if the password is modified or the user is new
  if (!user.isModified('password')) return next();


  return bcrypt.genSalt(function(saltError, salt) {
    if (saltError) { return next(saltError); }

    return bcrypt.hash(user.password, salt, function (hashError, hash) {
      if (hashError) { return next(hashError); }

      // replace a password string with hash value
      user.password = hash;

      return next();
    });
  });
});

var User = null;

module.exports = function(connection) {
  if(connection && User === null) {
    User = connection.model('User', UserSchema);
  }
  return User;
};
