var express = require('express');
var router = express.Router();
var blockchainMethods = require("../blockchain/blockchain");
var createTransaction = blockchainMethods.createTransaction;
var mineBlock = blockchainMethods.mineBlock;

router.post('/getDoctors', function (req, res, next) {

  var User = require('../models/user')();

  User.findOne({publicKey: req.body.publicKey}, function(err, patient) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    User.find({role:'doctor', isApproved: true}, function(err, doctors) {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      var results = {
        unsharedDoctors: [],
        sharedDoctors: []
      };

      for (const doctor of doctors) {
        if (!patient.partners.includes(doctor.publicKey)){
          results.unsharedDoctors.push(doctor);
        } else {
          results.sharedDoctors.push(doctor);
        }
      }
      console.log(results);
      return res.json(results);
    });
  })
});

router.post('/getPatients', function (req, res, next) {

  var User = require('../models/user')();

  User.findOne({publicKey: req.body.publicKey}, function(err, doctor) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    User.find({role:'patient'}, function(err, patients) {
      if (err) {
        console.log(err);
        return res.send(err);
      }
      var results = {
        sharedPatients: []
      };

      for (const patient of patients) {
        if (doctor.partners.includes(patient.publicKey)){
          results.sharedPatients.push(patient);
        }
      }
      console.log(results);
      return res.json(results);
    });
  })
});

router.post('/grantAccess', function (req, res, next) {

  var User = require('../models/user')();

  var doctorKey = req.body.doctorKey;
  var patientKey = req.body.patientKey;
  var transactions = req.body.transactions;

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

      if (transactions !== undefined || transactions.length !== 0) {
        User.findOne({publicKey: patientKey}, function(err, user) {
          if (err) {
            return res.send(err)
          }
          var sender = user.firstName + ' ' + user.lastName;

          // Send to current records to newly added doctor
          for(const transaction of transactions) {
            createTransaction(patientKey, doctorKey, transaction.record, sender);
          }
          mineBlock();

          return res.send('Grant access successfully!');
        });
      } else {
        return res.send('Grant access successfully!');
      }
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

router.post('/getApprovalStatus', function (req, res, next) {

  var Request = require('../models/request')();

  Request.findOne({doctorKey: req.body.publicKey}, function(err, request) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    if (request) {
      return res.send(request.status);
    } else {
      return res.send("Rejected");
    }
  })
});

router.post('/requestApproval', function (req, res, next) {

  var Request = require('../models/request')();

  var requestObj = {
    doctorKey: req.body.doctorKey,
    doctorName: req.body.doctorName,
    status: "Pending"
  };

  Request.findOneAndUpdate({doctorKey: req.body.doctorKey}, requestObj, {upsert: true}, function (err, request) {
    if (err) {
      return res.send(err);
    }
    res.send("Pending");
  });
});

router.get('/getRequests', function (req, res, next) {

  var Request = require('../models/request')();

  Request.find({}, function(err, requests) {
    if (err) {
      console.log(err);
      return res.send(err);
    }
    console.log(requests);
    return res.send(requests);
  })
});

router.post('/approveRequest', function (req, res, next) {

  var Request = require('../models/request')();
  var User = require('../models/user')();

  Request.findOneAndUpdate({doctorKey: req.body.doctorKey}, {status: 'Approved'}, {upsert: false}, function (err, request) {
    if (err) {
      return res.send(err);
    }
    if (request) {
      User.findOneAndUpdate({publicKey: req.body.doctorKey}, {isApproved: true}, {upsert: false}, function (err, user) {
        if (err) {
          return res.send(err);
        }
        return res.send("Approved");
      });
    }
  });
});

router.post('/rejectRequest', function (req, res, next) {

  var Request = require('../models/request')();
  var User = require('../models/user')();

  Request.findOneAndUpdate({doctorKey: req.body.doctorKey}, {status: 'Rejected'}, {upsert: false}, function (err, request) {
    if (err) {
      return res.send(err);
    }
    if (request) {
      User.findOneAndUpdate({publicKey: req.body.doctorKey}, {isApproved: false}, {upsert: false}, function (err, user) {
        if (err) {
          return res.send(err);
        }
        return res.send("Rejected");
      });
    }
  });
});


module.exports = router;
