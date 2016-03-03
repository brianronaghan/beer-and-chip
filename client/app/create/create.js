angular.module('createEvent', [])

.controller('CreateController', ['$scope', 'CreateFactory', '$location', '$cookies', function($scope, CreateFactory, $location, $cookies) {
  
  $scope.event = {};
  $scope.hold = {};
  $scope.data = {};

  $scope.guests = [{}];
  $scope.items = [{}];

  $scope.addGuest = function() {
    $scope.guests.push({});
  };

  $scope.removeGuest = function(guest) {
    $scope.guests.splice(guest, 1);
  };

  $scope.addItem = function() {
    $scope.items.push({});
  };

  $scope.removeItem = function(item) {
    $scope.items.splice(item, 1);
  };


//Update function is invoked in submit button in create.html
  $scope.update = function(event, hold) {
    $scope.data.userID = $cookies.get('userID');
    var guestArray = [];
    for (var i = 0; i < $scope.guests.length; i++) {
      if($scope.guests[i].name && $scope.guests[i].email) {
        guestArray.push($scope.guests[i]);
      }
    }
    var itemArray = [];
    // console.log("ITEMS", hold);
    for (var j=0; j < $scope.items.length; j++) {
      if($scope.items[j] && $scope.items[j].name) {
        itemArray.push($scope.items[j]);
      }
    }


    $scope.data.event = event;
    $scope.data.guests = guestArray;
    $scope.data.items = itemArray;

    // $scope.master = angular.copy(event);
    CreateFactory.addEvent($scope.data)
    .then(function () {
      $location.path('/events');
    })
  };
  // clears out the form
  $scope.reset = function() {
    $scope.event = {};
    $scope.hold = {};
    $scope.guests = [{}];
    $scope.items = [{}];
    $scope.data = {};
  };

  $scope.reset();
}])
.factory('CreateFactory', function($http, $cookies) {
  //send a post request to server

  var addEvent = function(event) {
    // console.log("EVENT", event);
    return $http({
      method: 'POST',
      url: '/api/events',
      data: event
    });
  }
  return{
    addEvent: addEvent
  };
})
