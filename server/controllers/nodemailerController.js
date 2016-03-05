var nodemailer = require('../config/nodemailer');
var EmailQuery = require('../queries/emailQueries');
var EventQuery = require('../queries/eventQueries');

module.exports = {
  // uses nodemailer to send BILL
  post: function(req, res) {
    var eventID = req.params.eventID;
    var url = "162.243.218.81:3000/#/eventdetails/" + eventID;
    EmailQuery.sendInvite('many', 'none',eventID, url, function (){
      res.send();
    });
  },
  settleUp: function (req, res) {
    EventQuery.getByID(req.params.eventID, function(event){
      EmailQuery.sendTabs(event, req.body, function() {console.log("done with sending tabs!");});
    });
  },
  delete: function (req,res) {
    console.log("delete");
  },
  put: function (req, res) {
    // there's no functionality yet for updating... To come
    console.log("send upd");
  }
};
