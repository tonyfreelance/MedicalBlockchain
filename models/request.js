var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var RequestSchema = new Schema({
  doctorKey: String,
  doctorName: String,
  status: String
});


var Request = null;

module.exports = function(connection) {
  if(connection && Request === null) {
    Request = connection.model('Request', RequestSchema);
  }
  return Request;
};
