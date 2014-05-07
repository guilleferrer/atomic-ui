function SearchDemoCtrl($scope) {

    $scope.$on('searchEvent.SEARCH_CHANGE', function (event, searchTerm) {
        alert('You have searched for : "' + searchTerm + '"');
    });
}