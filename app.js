var express = require('express');
var path = require('path');
var config = require('./config');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var index = require('./routes/index');
var register = require('./routes/register');
var login = require('./routes/login');
var blockchainRoute = require('./routes/blockchain');
var connect = require('./routes/connect');

var blockchainMethods = require("./blockchain/blockchain");
var initP2PServer = blockchainMethods.initP2PServer;
var connectToPeers = blockchainMethods.connectToPeers;

var mongoose   = require('mongoose');
var passport = require('passport');
var app = express();

var http_port = process.env.HTTP_PORT || 3001;
var p2p_port = process.env.P2P_PORT || 6001;
var initialPeers = process.env.PEERS ? process.env.PEERS.split(',') : [];

// Connect to DB
var mainAppConnection = mongoose.createConnection(config.dbURI);
// Register models to ensure models are initialized only once in main app
require('./models/user')(mainAppConnection);
require('./models/request')(mainAppConnection);

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express serves static assets in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static('client/build'));
// }

// pass the passport middleware
app.use(passport.initialize());
// load passport strategies
var localLoginStrategy = require('./passport/local-login');
passport.use('local-login', localLoginStrategy);

// pass the authenticaion checker middleware
var authCheck = require('./middleware/auth-check');

// Routes
app.use('/api/register', register);
app.use('/api/login', login);
app.use('/api/blockchain', blockchainRoute);
app.use('/api/connect', connect);
app.use('/*', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  // res.render('error');
});

var environment = process.env.NODE_ENV || 'development';

// Set the port
app.set('port', http_port);
// Run the app!
app.listen(app.get('port'), function() {
  console.log('We are in ' + environment + ' mode now!');
  console.log('Server is running at: http://localhost:' + app.get('port') + '/');
});

connectToPeers(initialPeers);
initP2PServer(p2p_port);

module.exports = app;
