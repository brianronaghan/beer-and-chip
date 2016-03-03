angular.module('eventDetails', ['eventList'])
.controller('eventDetailsController', ['$scope', '$http', 'requestFactory', '$cookies', '$routeParams', function($scope, $http, requestFactory, $cookies, $routeParams) {
/** ADD ITEM AND ADD GUEST INPUT BOXES **/

  // Holds text input from add item and add guest input boxes
  $scope.itemName;
  $scope.guestName;
  $scope.guestEmail;

  // clear text in text field, takes a string as input
  $scope.resetField = function(field) {
    $scope[field] = "";
  };

  // sends a POST request to insert a new item
  $scope.addItemFunc = function(itemName, itemPrice){
    var newItem = {
      EventId: $cookies.get('eventID'),
      name: itemName, // this is coming from ng-model
      price: itemPrice
    };
    return $http({
      method: 'POST',
      url: '/api/items',
      data: newItem
    }).then(function(){
        $scope.resetField('itemName'); // reset text field
        $scope.resetField('itemPrice');
        initializeDetails();
    });

  };

  // sends a POST request to insert a new guest
  $scope.addGuestFunc = function(guestName, guestEmail){
    var newGuest = {
      EventId: $cookies.get('eventID'),
      name: guestName, //this is coming from ng-model
      email: guestEmail
    };
    return $http({
      method: 'POST',
      url: '/api/guests',
      data: newGuest
    }).then(function(){
        $scope.resetField('guestName');
        $scope.resetField('guestEmail');
        initializeDetails();
    });

  };

  $scope.deleteGuest = function(guestId){
    return $http({
      method: 'DELETE',
      url: '/api/guests/' + guestId +'/' + $routeParams.eventID
    }).then(function(um){
      initializeDetails();
    });

  };
  // function that determines whether a user is the still needed or the creatorName
  $scope.isSafe = function (user) {
    if ($scope.details.creatorName) {
      var userName = $scope.getName(user);
      var userId = $scope.getId(user);
      var stringUser = userName.toString();
      if (userId == $scope.details.guests[0].id) {
        return false;
      } else if (stringUser.trim() == $scope.details.creatorName.trim()) {
        return false;
      } else {
        return true;
      }
    }
  };

/** DRAG AND DROP TABLE **/

  // Holds guests and the items they are bringing (guests)
  // The selected property is specific to drag-and-drop (which item is selected)
  $scope.models = {
    selected: null,
    guests: {} // each guest will be a column in the table
  };

  // ng-model for storing event details
  $scope.details;

  // For simplicity when refering to the ng-model guests
  // var guests =  $scope.models.guests;

  var initializeDetails = function() {
    $scope.models.guests = {};
    // Makes request to server for all event details
    requestFactory.getEvents($routeParams.eventID)
      .then(function(details) {
        // assigns event details to ng-model details
        $scope.details = details;
        // $scope.models.guests = details.guests;

        // temporarily holds guestId: [items]
        var temp = {};

        // Populate temp
        for (var j = 0; j < details.items.length; j++) {
          var GuestId = details.items[j].GuestId;
          var item = details.items[j];
          if (temp[GuestId]) {
            temp[GuestId].push(item);
          } else {
            temp[GuestId] = [item];
          }
        }

        // Populate the ng-model guests
        for (var i = 0; i < details.guests.length; i++){
          var guestName = details.guests[i].name;
          var guestId = details.guests[i].id;
          // Adds guestName and guestId to ng-model guests
          // and assigns guests an items array or an empty array
          $scope.models.guests[guestName + ' ' + guestId] = temp[guestId] ? temp[guestId] : [];
        }
        // added this so next then has details
        return details;
      })
      // this function is to get the creator name from the database
      .then(function(details) {
        return requestFactory.getUserDetails(details.event.UserId);
      })
      .then(function(creatorName) {
        $scope.details.creatorName = creatorName.data;
      });
  };

  // Fires when an item is moved to a column
  $scope.reassignItem = function(item, guestInfo) {
    var guestId = $scope.getId(guestInfo);
    requestFactory.updateItem(item, guestId);
    // nessesary for drag-and-drop visualization
    // return false to reject visual update
    return item;
  };

  // parse guestInfo for guest id
  $scope.getId = function(guestInfo) {
    // var name = guestInfo.match(/([^\s])+/g);
    // return name[1];
    var name = guestInfo;
    name = name.split(' ');
    return name[name.length - 1];
  };

  // parse guestInfo for guest name
  $scope.getName = function(guestInfo) {
    // var name = guestInfo.match(/([^\s])+/);
    // return name[0];
    var name;
    name = guestInfo;
    name.trim();
    name = name.split(" ");
    var newName = "";
    for(var i = 0; i < name.length - 1; i++) {
      newName += name[i] + ' ';
    }
    return newName;
  };

  $scope.deleteItem = requestFactory.deleteItem;

/** EMAIL **/
  // sends unique eventDetails url to all guests
  $scope.email = function() {
    var eventID = $cookies.get("eventID");
    requestFactory.sendEmails(eventID);
  };

/** INITIALIZE ON PAGE LOAD **/
  initializeDetails();
}])

.factory('requestFactory', function($http, $cookies) {
  var getEvents = function(eventID) {
    return $http({
      method: 'GET',
      url: '/api/eventDetails/' + eventID
    })
    .then(function(res) {
      return res.data;
    })
  };

  var sendEmails = function(eventID) {
    return $http({
      method: 'GET',
      url: '/api/email/' + eventID
    });
  };

  var updateItem = function(item, guestId) {
    return $http({
      method: 'PUT',
      url: '/api/items/' + item.id,
      data: {GuestId: guestId}
    })
    .then(function() {
      console.log("UPDATED DB");
    })
  };

  var getUserDetails = function(userId) {
    return $http( {
      method: 'GET',
      url: '/api/users/' + userId,
    })
    .then(function(userName) {
      return userName;
    });


  };

  var deleteItem = function (itemId) {
    return $http({
      method: 'DELETE',
      url: '/api/items/' + itemId
    });
  }

  return {
    getEvents: getEvents,
    sendEmails: sendEmails,
    updateItem: updateItem,
    getUserDetails: getUserDetails,
    deleteItem: deleteItem
  }
})
