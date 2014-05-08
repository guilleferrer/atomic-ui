function FilterDemoCtrl($scope) {

    $scope.$on('filterEvent.FILTER_CHANGE', function (event, result) {
        $scope.currentFilter = result;
    })

}