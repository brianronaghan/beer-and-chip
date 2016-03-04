var ItemQuery = require('../queries/itemQueries');
var EventQuery = require('../queries/eventQueries');
module.exports = {
	get: function(req, res) {
		var eventID = req.params.eventID;
		ItemQuery.getAll(eventID, function(items){
			res.json(items);
		});
	},

	post: function(req, res) {
		var item = req.body;
    if(!item.price) {
      item.price = null;
    }
		ItemQuery.addOne(item, function(newItem){
      if (newItem.price !== null) {
        EventQuery.updateTotalCost(newItem.EventId, Number(newItem.price), function () {
          res.json(newItem);
        });
      } else {
        res.json(newItem);
      }
		});
	},

	put: function(req, res) {
		var itemID = req.params.itemID;
		var newAttrs = req.body;
    console.log(newAttrs);
    ItemQuery.getCostOfOne(itemID, function (oldCost) {
      ItemQuery.updateOne(itemID, newAttrs, function(eventId) {
        console.log(eventId);
        if(newAttrs.hasOwnProperty('price')) {
          var difference = Number(newAttrs.price - oldCost);
          console.log("dif ",difference);
          EventQuery.updateTotalCost(eventId, difference, function () {
            res.send();
          });
        }
        res.send();
  		});
    });
	},

	delete: function(req, res) {
		var itemID = req.params.itemID;
		ItemQuery.deleteOne(itemID, function(oldItem){
      EventQuery.updateTotalCost(oldItem.EventId, -oldItem.price, function () {
        res.send();
      });
      res.send();
		});
	}
};
