var GuestQuery = require('../queries/guestQueries');
var ItemQuery = require('../queries/itemQueries');

module.exports = {
  get: function(req, res) {
    var eventID = req.body.eventID;
    GuestQuery.getAll(eventID, function(guests) {
      res.json(guests);
    });
  },

  post: function(req, res) {
    var guest = req.body;
    GuestQuery.addOne(guest, function(newGuest) {
      res.json(newGuest);
    });
  },

  put: function(req, res) {
    var guestID = req.params.guestID;
    var newAttrs = req.body;
    GuestQuery.updateOne(guestID, newAttrs, function() {
      res.send();
    });
  },

  delete: function(req, res) {
    var guestID = req.params.guestID;
    var eventID = req.params.eventID;
    var unAssId;
    GuestQuery.findStillNeeded(eventID, function (id){
      unAssId = id;
      // need to add function where (BEFORE WE DELETE THE GUEST)
      // we reassign any items a deleted guest had claimed to the STILL NEEDED 'guest'
      ItemQuery.reassignUsersItems(guestID, eventID, unAssId, function(){
        GuestQuery.deleteOne(req.params.guestID, function(){
          res.send();
        });
      });
    });



  }
};
