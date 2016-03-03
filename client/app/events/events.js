angular.module('eventList', [])

.controller('EventsController', ['$scope', 'EventFactory', '$location','$cookies', function($scope, EventFactory, $location, $cookies) {

  //this is where we will store our data after our initializeEvents
  //api request, $scope.data: 
  $scope.data = { };
  //this requests the data and puts it into $scope.data
  var initializeEvents = function() {
  	EventFactory.getEvents()
  	  .then(function (events) {
  	  	$scope.data.events = events;
  	  })
  	  .catch(function(error) {
  	  	console.error("EventsController", error);
  	  })
  }

  //after all the data is displayed: when the user clicks on a specific
  //event this function is fired:
  $scope.getEvent = function( event ) {
    console.log("EVENT", event);
    // storeFactory.eventID = event.id;
    $cookies.put('eventID', event.id);
    $location.path('/eventdetails/' + event.id);
  }

  $scope.deleteEvents = function(event) {
    EventFactory.deleteEvents(event);
    initializeEvents();
  }

  //when the page is requested by the user, the initialize
  //function automatically runs:
  //*@*@*@*WARNING NEED TO COMMENT THIS LINE AFTER DATABASE FUNCTIONS
  initializeEvents();

}])
.factory('EventFactory', function($http, $cookies) {
	var getEvents = function() {
    return $http({
			method: 'GET',
			url: '/api/events/' + $cookies.get('userID')
		})
		.then(function(resp) {
			return resp.data;
		})
	}

  var deleteEvents = function(event) {
    console.log('i RAN', event.id)
    return $http({
      method: 'DELETE',
      url: '/api/events/',
      params: {eventID: event.id}
    })
    .then(function(res) {
      return res.data;
    })
  }

  return {
    deleteEvents: deleteEvents,
    getEvents: getEvents
  }
});