var express = require('express');
var router = express.Router();


router.get('/getDoctor', function (req, res, next) {

  var User = require('../models/user')();

  User.find({role:'doctor', isApproved: true}, function(err, users) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log(users);
    return res.json(users);
  });
});

router.post('/grantAccess', function (req, res, next) {

  var User = require('../models/user')();

  var doctorKey = req.body.doctorKey;
  var patientKey = req.body.patientKey;

  // Save to Doctor record
  User.findOneAndUpdate({"publicKey": doctorKey}, {
    "$push": {
      "partners": patientKey
    }
  }, function (err, result) {
    if (err) {
      return res.send(err);
    }
    console.log("Result: ", result);
    // Save to Patient record
    User.findOneAndUpdate({"publicKey": patientKey}, {
      "$push": {
        "partners": doctorKey
      }
    }, function (err, result2) {
      if (err) {
        return res.send(err);
      }
      console.log("Result 2:", result2);

      console.log('Grant access successfully!');
      return res.send('Grant access successfully!');
    });
  })
});

router.post('/revokeAccess', function (req, res, next) {

  var User = require('../models/user')();

  var doctorKey = req.body.doctorKey;
  var patientKey = req.body.patientKey;

  // Save to Doctor record
  User.findOneAndUpdate({"publicKey": doctorKey}, {
    "$pull": {
      "partners": patientKey
    }
  }, function (err, result) {
    if (err) {
      return res.send(err);
    }
    console.log("Result: ", result);
    // Save to Patient record
    User.findOneAndUpdate({"publicKey": patientKey}, {
      "$pull": {
        "partners": doctorKey
      }
    }, function (err, result2) {
      if (err) {
        return res.send(err);
      }
      console.log("Result 2:", result2);

      console.log('Revoke access successfully!');
      return res.send('Revoke access successfully!');
    });
  })
});


module.exports = router;
