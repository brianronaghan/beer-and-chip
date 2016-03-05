var nodemailer = require('../config/nodemailer');
var EmailQuery = require('../queries/emailQueries');

module.exports = {
  // Uses nodemailer to send out event details to guests
  // sends initial invite initial INVITE
  post: function(req, res) {
    var eventID = req.params.eventID;
    var url = "http://localhost:3000/#/eventdetails/" + eventID;
    EmailQuery.sendInvite('many', 'none',eventID, url, function (){
      res.send();
    });
  }

};
  // put: function(req,res) {
  //   console.log("put $$$");
  //
  // },
  // delete: function (req,res) {
  //   console.log("delete");
  // },
