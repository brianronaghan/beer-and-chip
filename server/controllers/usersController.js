var UserQuery = require('../queries/userQueries');

module.exports = {
  get: function(req, res) {
    UserQuery.getByUserId(req.params.userId, function(user) {
      res.json(user.displayName);
    });
  }
};
