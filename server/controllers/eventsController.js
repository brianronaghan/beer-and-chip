var EventQuery = require('../queries/eventQueries');
var GuestQuery = require('../queries/guestQueries');
var ItemQuery = require('../queries/itemQueries');
var BasketQuery = require('../queries/basketQueries');
var nodemailer = require('../config/nodemailer');
var EmailQuery = require('../queries/emailQueries');

module.exports = {
  events: {
    get: function(req, res) {
      var userID = req.params.userID;
      EventQuery.getAll(userID, function(events) {
        res.json(events);
      });
    },
    post: function (req, res) {
      var data = {
        userID: req.body.userID,
        event: req.body.event,
        guests: req.body.guests,
        items: req.body.items
      };
      // Add event
      EventQuery.addOne(data.userID, data.event, function(event) {
        // Add event's guests
        // change to send addAll --- the whole event
        GuestQuery.addAll(event, data.guests, function() {
          // Add event's items and assign to guests
          // ADD THE STILL NEEDED ID to these parameters:
          var snID = GuestQuery.findStillNeeded(event.id, function (snID) {
            ItemQuery.addAll(event.id, data.items, snID,function() {
              var url = "http://localhost:3000/#/eventdetails/" + event.id;
              // call send email
              console.log(data.guests);
              EmailQuery.sendInvite('many', 'none',event.id, url, function (){
                res.send();
              });
            });
          });
        });
      });
    },
    delete: function(req, res) {
      var eventID = req.query.eventID;
      EventQuery.deleteOne(eventID, function(event) {
        res.send(200, event);
      });
    }
  },

  eventDetails: {
    get: function(req, res) {
      // Pull eventID from request params
      var eventID = req.params.eventID;
      var data = {}; // will hold response data

      EventQuery.getByID(eventID, function(event) {
        data.event = event; // get event
        checkQueries();
      });
      GuestQuery.getAll(eventID, function(guests) {
        data.guests = guests; // get event guests
        checkQueries();
      });
      ItemQuery.getAll(eventID, function(items) {
        data.items = items; // get event items
        checkQueries();
      });

      // check if all queries are done and return data in response
      function checkQueries() {
        if (Object.keys(data).length === 3) {
          res.json(data);
        }
      }
    }
  }
};
