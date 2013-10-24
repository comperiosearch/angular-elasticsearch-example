/**
* angular.module defines a module for our applicatoin, 'searchApp', with
* an array of the modules searchApp depends on.
* elasticjs.service is a javascript client for elasticsearch
* ngSanitize angularjs module to sanitize HTML
*/
var searchApp = angular.module('searchApp', [
    'elasticjs.service',
    'ngSanitize',
    'infinite-scroll'
])
    .config(['$routeProvider', function($routeProvider){
        $routeProvider
            .when('/stackoverflow', {
                controller: 'Stackoverflow',
                templateUrl: 'views/stack.html'
            })
            .when('/', {
                controller: 'Twitter',
                templateUrl: 'views/twitter.html'
            })
    }]);