// Require sql model
var Guest = require('../models/models').Guest;
var User = require('../models/models').User;
var EventQuery = require('./eventQueries');
var GuestQuery = require('./guestQueries');
var UserQuery = require('./userQueries');
var ItemQuery = require('./itemQueries');
var nodemailer = require('../config/nodemailer');

module.exports = {
  // get all guests from an event
  // returns properly formatted emails of all guests for nodemailer call
  // writes an emailbody base
  createInviteBody: function (name, creator, event, url, callback) {
    // if guest - add guest to first thing
    var body = "";
    if (name !== 0) {
      body += "<h5>Hi " + name + "!</h5>";
    } else {
      body += "<h5>Hi there!</h5>";
    }
    body += "<h4>" + creator + " has invited you to : </h4>";
    body += "<a href='" + url + "'><h3>" + event.name + "!</h3></a>";
    if(event.date !== null) {
      body += "<p>When: <b>" + event.date + "</b></p>";
    }
    if(event.location !== null) {
      body += "<p>Where: <b>" + event.location + "</b></p>";
    }
    body += "<h4>" + creator + " suggests we get the following:";
    ItemQuery.getAll(event.id, function (items){
      body += "<ul>";
      items.forEach(function(item){
        body += "<li>" + item.name + "</li>";
      });
      body += "</ul>";
      body += "<a href='" + url +"'><h4> click here to sign up for items or to add more! </h5></a>";
      callback(body);
    });
  },

  createSettleUpBody: function (event, guest, url, callback) {
    var body = "";
    body += "<h5>Hi " + guest.name + "!</h5>";
    body += "<h4>Time to settle up for:</h4>";
    body += "<a href='" + url + "'><h3>" + event.name + "!</h3></a>";
    if(guest.dir === 'owes') {
      body += "<h5>You contributed LESS than the average of $" + event.totalCost/event.numGuests + "</h5>";
      body += "<h4>Time to settle up!</h4>";
      body += "<h5>Here's who to pay (and how much): </h5>";
      body += "<ul>";
      guest.payments.forEach(function (payment){
        body += "<li>Pay <em>"+ payment.to +"</em>" + "<b>$" + payment.amount + "</b></li>";
      });
    } else {
      body += "<h5>You contributed MORE than the average of $" + event.totalCost/event.numGuests + "</h5>";
      body += "<h4>Time to settle up!</h4>";
      body += "<h5>Here's who will pay you (and how much): </h5>";
      guest.payments.forEach(function (payment){
        body += "<li><em>" + payment.from + "</em> will pay you <b>$" + payment.amount + "</b></li>";
      });
      body += "</ul>";
      body += "<h3>Thanks " + guest.name + "!</h3>";
      callback(body);
    }
  },

  parseEmails: function(eventID, callback) {
    GuestQuery.getAll(eventID, function(guests) {
      var emails = "";
      for (var i = 0; i < guests.length; i++) {
        emails = emails + guests[i].email + ' ,';
      }
      emails = emails.slice(0, emails.length - 2);
      callback(emails);
    });
  },
  sendTabs: function (event, payments, callback) {
    // get all guests
    GuestQuery.getAll(event.id,function (guestResults) {
      var guests = {};
      guestResults.forEach(function (result) {
        guests[result.dataValues.id] = result.dataValues;
      });
      // iterate through payments
        // push payments to both TO and FROM guests
        //(set each guest as owed or owes)
      payments.forEach(function(payment){
        guests[payment.fromId].dir = 'owes';
        guests[payment.fromId].payments = guests[payment.fromId].payments || [];
        guests[payment.fromId].payments.push(payment);
        guests[payment.toId].dir = 'owed';
        guests[payment.toId].payments = guests[payment.toId].payments || [];
        guests[payment.toId].payments.push(payment);
      });

      function sendCB(key) {
        return function(key){
          console.log("run: ", key);
          module.exports.sendMoneyEmail(event.id, event, guests[key]);
        };
      }
      for (var key in guests) {
        if(guests[key].name !== "STILL NEEDED:" && guests[key].payments.length>0) {
          module.exports.sendMoneyEmail(event.id, event, guests[key], function(){
            sendCB(key);
          });
        }
      }
    });


  },
  sendMoneyEmail: function (eventId, event, guest, callback) {
    UserQuery.getByUserId(event.UserId, function (creator) {
      var url = "http://localhost:3000/#/eventdetails/" + eventId;

      var fromDisplay = "'";
      fromDisplay += creator.displayName;
      fromDisplay += " via beerandchip' <beeranchip@gmail.com>";
      // create the subjectLine
      var subjectLine = "Payment info for " + event.name;
      // create the emailBody
      var crea = creator.displayName.split(" ")[0];
      // A -IF mode === 'many'
      module.exports.createSettleUpBody(event, guest, url, function (emailBody){
        // Get and format all guest emails for nodemailer
        var mailOptions = nodemailer.createMailOptions(fromDisplay, subjectLine, guest.email, emailBody);
        nodemailer.transporter.sendMail(mailOptions, function(err, info) {
            if(err) {
              return console.log(err);
            }
            console.log('sendMON ' + info.response);
          }); // close send mail
        });// close parseemails
      });
      callback();
    },
  //guest  { EventId: '2', name: 'jack', email: 'j@j' }
  sendInvite: function (mode, guest, eventID, url, callback) {
    // mode is a string, if it's 'one, we're sending an individual invite
    // if 'many', we're sending to all guests
    if (mode === 'one') {
      email = guest.email;
      name = guest.name;
    }
    // START EMAIL SEND
    EventQuery.getByID(eventID, function (event) {
      // create the fromDisplay
      // get creator's display name
      UserQuery.getByUserId(event.dataValues.UserId, function (creator) {
        var fromDisplay = "'";
        fromDisplay += creator.displayName;
        fromDisplay += " via beerandchip' <beeranchip@gmail.com>";
        // create the subjectLine
        var subjectLine = "Invitation to " + event.name;
        // create the emailBody
        var crea = creator.displayName.split(" ")[0];
        // A -IF mode === 'many'
        if(mode === 'many') {
          module.exports.createInviteBody(0,crea, event, url, function (emailBody){
            // Get and format all guest emails for nodemailer
            module.exports.parseEmails(eventID, function(emails) {
              var mailOptions = nodemailer.createMailOptions(fromDisplay, subjectLine, emails, emailBody);
              //fromDisplay, subjectLine, eventReceivers, emailBody
              nodemailer.transporter.sendMail(mailOptions, function(err, info) {
                if(err) {
                  return console.error(err);
                }
                console.log('Message sent (all peeps): ' + info.response);
              }); // close send mail
            });// close parseemails
          }); // close createInviteBody
        }
        else { // if mode is 'one'
          module.exports.createInviteBody(name, crea, event, url, function (emailBody){
            // Get and format all guest emails for nodemailer
            var mailOptions = nodemailer.createMailOptions(fromDisplay, subjectLine, email, emailBody);
            //fromDisplay, subjectLine, eventReceivers, emailBody
            nodemailer.transporter.sendMail(mailOptions, function(err, info) {
              if(err) {
                return console.error(err);
              }
              console.log('Message sent (one person): ' + info.response);
            }); // close send mail
          }); // close createInviteBody
        }
        callback();
      }); // close getUserbyID
    });
  }
};
