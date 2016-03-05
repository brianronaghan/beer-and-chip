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

  createSettleUpBody: function (event, callback) {
    console.log("hi");
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


  // // add one guest
  // addOne: function(guest, callback) {
  //   Guest
	//     .create(guest)
	//     .then(function(newGuest) {
	//     	callback(newGuest);
	//     });
  // },
  //
  // // add multiple guests to one event (changed to take in the whole event so we can access the creator ID)
  // addAll: function(event, guests, callback) {
  //   // Add dummy guest to hold all unassigned items
  //   guests.unshift({name: "STILL NEEDED:", EventId: event.id});
  //   // automatically create a guest entry for the event creator
  //   var creatorName = "";
  //   // find the user that created the event
  //   User.findOne({
  //     where: {id:event.UserId}
  //   })
  //   .then(function (user){
  //     //set creatorname to that user's displayname
  //     creatorName = user.dataValues.displayName;
  //     guests.push({name: creatorName, EventId: event.id});
  //     for (var i=0; i < guests.length; i++) {
  //     	guests[i].EventId = event.id;
  //     }
  //     // update number of guests on event
  //     EventQuery.updateNumberOfGuests(event.id, guests.length-1,function () {
  //       Guest
  //         .bulkCreate(guests)
  //         .then(function(newGuests) {
  //           callback(newGuests);
  //         });
  //     });
  //   });
  // },
  //
  // // update attributes of one guest
  // updateOne: function(guestID, newAttrs, callback) {
  //   Guest
  //     .update(newAttrs, {
  //       where: {id: guestID}
  //     })
  //     .then(function() {
  //       callback();
  //     })
  // },
  //
  // // delete one guest
  // deleteOne: function(guestID, callback) {
  //   Guest
  //     .destroy({
  //       where: {id: guestID}
  //     })
  //     .then(function() {
  //       callback();
  //     });
  // },
  //
  // // find the STILL NEEDED ID for any given eventID
  // findStillNeeded: function (eventID, callback) {
  //   Guest
	// 		.find({
	// 			where: {
	// 				name: "STILL NEEDED:",
	// 				EventId: eventID
	// 			}
	// 		}).then(function (guest) {
  //       callback(guest.dataValues.id);
  //     });
  // }
