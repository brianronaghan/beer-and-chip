// Require sql models
var Item = require('../models/models.js').Item;
var Guest = require('../models/models.js').Guest;

module.exports = {
	//get all items for an event
	getAll: function(eventID, callback) {
		Item
			.findAll({
				where: {eventId: eventID}
			})
			.then(function(items){
				callback(items);
			});

	},
	//add one item
	addOne: function(item, callback) {
		Guest
			.find({
				where: {
					name: "STILL NEEDED:",
					EventId: item.EventId
				}
			})
			.then(function(guest) {
				item.GuestId = guest.id;
				Item
					.create(item)
					.then(function(newItem){
						callback(newItem);
					});
			})
	},
	//add multiple items to one event
	addAll: function(eventID, items, callback) {
		Guest
			.findAll({
				where: {EventId: eventID}
			})
			.then(function(guests) {
				// Distribute items among guests
				if (guests.length) {
					for (var i=0, j = 0; i < items.length; i++, j++) {
						j = (j === guests.length) ? 0 : j;
						items[i].EventId = eventID;
						items[i].GuestId = guests[j].id;
					}
				}
				Item
					.bulkCreate(items)
					.then(function(newItems) {
						callback(newItems);
					});
			});
	},

	// update attributes of one item
	updateOne: function(itemID, newAttrs, callback) {
		Item
			.update(newAttrs, {
				where: {id: itemID}
			})
			.then(function() {
				callback();
			});
	},
  // reassign items of one user to the STILL TO BE added
  reassignUsersItems: function(userId, eventId, unAssId, callback) {
    Item
      .findAll({
        where: {EventId: eventId,
                GuestId: userId
        }
      })
      .then(function (items) {
        return items.map(function (itemObj){
          return itemObj.id;
        });
      })
      .then(function (listOfItemIds){
        Item
    			.update({GuestId:unAssId}, {
    				where: {id: {
              $in:listOfItemIds
            }}
    			});
        callback();
      });

	},
	// delete one item
	deleteOne: function(itemID, callback) {
		Item
			.destroy({
				where: {id: itemID}
			})
			.then(function() {
				callback();
			})
	}
};
