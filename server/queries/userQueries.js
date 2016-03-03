var User = require('../models/models').User;

module.exports = {
  addOne: function(newUser, callback) {
    // TODO: MOVE FROM server.js 
  },

  getByFacebookID: function(facebookID, callback) {
    User
      .findOne({
      	where: {facebookID: facebookID},
      })
      .then(function(user) {
      	callback(user);
      });
  },

  // gets a user by id, return the entire user info
  getByUserId: function(userId, callback) {
    User.findOne({
      where: {id: userId}
    })
    .then(function(user) {
      callback(user);
    });
  } 
}