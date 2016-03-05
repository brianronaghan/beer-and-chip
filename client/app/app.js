// Declare app level module which depends on filters, and services
angular.module('myApp', [
  'createEvent', 'eventList', 'eventDetails', 'payouts', 'ngRoute', 'auth', 'dndLists'
])
.config(['$routeProvider', '$httpProvider',function($routeProvider, $httpProvider) {
  $routeProvider.when('/', {
    templateUrl: '/app/create/create.html',
    controller: 'CreateController'
  });
  $routeProvider.when('/events', {
    templateUrl: 'app/events/events.html',
    controller: 'EventsController'
  });
  $routeProvider.when('/eventdetails/:eventID', {
    templateUrl: 'app/eventDetails/eventDetails.html',
    controller: 'eventDetailsController',
  })
  $routeProvider.when('/signin',{
    templateUrl: 'app/auth/signin.html',
    controller: 'AuthController'
  })
  $routeProvider.when('/d3test', {
    templateUrl: 'app/payout/payout.html',
    controller: 'PayoutController'
  })
  $routeProvider.otherwise({redirectTo: '/'});


  //THis was in Fred's code, but we don't have tokens. 
    // We add our $httpInterceptor into the array
    // of interceptors. Think of it like middleware for your ajax calls
    // $httpProvider.interceptors.push('AttachTokens');
}])

.run(['$rootScope', '$location', 'AuthFactory', function($rootScope, $location, AuthFactory) {
  $rootScope.$on('$routeChangeStart', function(event, toState) {
    console.log(toState)
    if(toState.$$route && toState.$$route.originalPath === '/events' && !AuthFactory.isAuth()) {
      $location.path('/signin');
    }
    if(toState.$$route && toState.$$route.originalPath === '/' && !AuthFactory.isAuth()) {
      $location.path('/signin');
    }
    if(toState.$$route && toState.$$route.originalPath === '/signin') {
      $location.path('/signin');
    }
  });
}]);