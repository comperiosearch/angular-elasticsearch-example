searchApp.controller('NavController', function NavController($scope, $location) {
    $scope.routeIs = function(routeName) {
        return $location.path() === routeName;
    };
});
