var express = require('express');
var router = express.Router();
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

/* POST request to create brand domain and socials */
router.post('/', function (req, res, next) {

	var User = require('../models/user')();

	  var privateKey = generatePrivateKey();
	  var publicKey = ec.keyFromPrivate(privateKey, 'hex').getPublic().encode('hex');

    // Instantiate a client info Object
		var userData = {};
		userData.firstName = req.body.firstName.trim();
		userData.lastName = req.body.lastName.trim();
		userData.email = req.body.email.trim().toLowerCase();
		userData.password = req.body.password.trim();
		userData.address = req.body.address.trim();
		userData.city = req.body.city.trim();
		userData.postalCode = req.body.postalCode.trim();
		userData.country = req.body.country.trim();
		userData.phone = req.body.phone.trim();
    userData.role = req.body.role;
		userData.publicKey = publicKey;
		userData.hospital = req.body.hospital

    console.log(userData);

    var userQuery =  {
			email: req.body.email
		};

    User.findOne(userQuery, function(err, user) {
			if(err) {
				return res.status(err.status || 500).send({err: err});
			}
			// User existed
			if(user) {
				return res.status(err.status || 500).send({err: "User existing"});
			}
			// User not existed yet
			else {
				var newUser = new User(userData);
				newUser.save(function(err, createdUser) {
					if(err) return res.status(err.status || 500).send({err: err});

					console.log(createdUser);
					res.status(200);
				});
			}
    });


});

var generatePrivateKey = function() {
    var keyPair = ec.genKeyPair();
    var privateKey = keyPair.getPrivate();
    return privateKey.toString(16);
};

module.exports = router;
