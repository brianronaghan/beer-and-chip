var Sequelize = require('sequelize');
var db = require('../config/db');

//define models
var User = db.define('User', {
  facebookID: {
    type: Sequelize.STRING,
    unique: true
  },
  googleID: {
    type: Sequelize.STRING,
    unique: true
  },
  displayName: Sequelize.STRING,
  email: Sequelize.STRING
});

var Event = db.define('Event', {
  name: Sequelize.STRING,
  description: Sequelize.STRING,
  date: Sequelize.DATE,
  location: Sequelize.STRING
});

var Guest = db.define('Guest', {
  email: Sequelize.STRING,
  name: Sequelize.STRING
});

var Item = db.define('Item', {
  name: Sequelize.STRING,
  category: Sequelize.STRING,
  price: Sequelize.FLOAT
});


//set bi-directional associations
User.hasMany(Event);
Event.belongsTo(User);

Event.hasMany(Guest);
Guest.belongsTo(Event);

Event.hasMany(Item);
Item.belongsTo(Event);

Guest.hasMany(Item);
Item.belongsTo(Guest);

//create tables in MySql if they don't already exist
User.sync()
  .then(function() {
    Event.sync()
      .then(function() {
        Guest.sync()
          .then(function() {
            Item.sync();
          });
      });
  });


module.exports = {
  User: User,
  Event: Event,
  Guest: Guest,
  Item: Item
};
