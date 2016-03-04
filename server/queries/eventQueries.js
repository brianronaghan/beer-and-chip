var Event = require('../models/models').Event;
var Guest = require('../models/models').Guest;
var UserQueries = require('./userQueries');

module.exports = {
// create and add one event and passes the new event to a callback
  addOne: function(userID, event, callback) {
    event.UserId = userID;
  	Event
  	  .create(event)
  	  .then(function(newEvent) {
  	  	callback(newEvent);
  	  });
  },

// passes all events from a user to a callback
  getAll: function(userID, callback) {
  	Event
  		.findAll({
  	    where: {UserId: userID}
  	  })
  	  .then(function(events) {
  	    callback(events);
  	  });
  },

// get event by ID and pass to a callback
  getByID: function(ID, callback) {
  	Event
  	  .find({
  	  	where: {ID: ID}
  	  })
  	  .then(function(event) {
  	  	callback(event);
  	  });
  },
  deleteOne: function(itemID, callback) {
      Guest
        .destroy({
          where: {EventId: itemID}
        })
        .then(function() {
          return Event.destroy({
            where: {id: itemID}
          })
        .then(function(event) {
          callback(event);
        });
    });
  },
  updateNumberOfGuests: function (eventID,guestNum, callback) {

    Event
      .update({numGuests:guestNum}, {
        where: {id: eventID}
      })
      .then(function (){
        callback();
      });
  },
  // will either increment or decrement # of guests, based on whether dir is 1 or -1
  incOrDecGuestNum: function (eventID, dir, callback) {
    Event.findOne({
      where: {id: eventID}
    })
    .then (function (event) {
      var newNum = event.numGuests + dir;
    Event
      .update({numGuests:newNum}, {
        where: {id: eventID}
      })
      .then(function (){
        callback();
      });
    });
  },

  updateTotalCost: function (eventID, priceToAdd, callback) {
    Event.findOne({
      where: {id: eventID}
    })
    .then (function (event) {
      var newCost;
      if (event.totalCost !== null) {
        newCost = event.totalCost + priceToAdd;
      } else {
        newCost = priceToAdd;
      }
      Event
        .update({totalCost:newCost}, {
          where: {id: eventID}
        })
        .then(function (){
          callback();
        });
    });
  }
};
