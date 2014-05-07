function MultipleChoiceDemoCtrl($scope) {
    $scope.colors = [
        {
            name: "violet"
        },
        {
            name: "orange"
        },
        {
            name: "green"
        },
        {
            name: "yellow"
        },
        {
            name: "cyan"
        },
        {
            name: "red"
        }
    ];

    $scope.selection = [ $scope.colors[0], $scope.colors[1]];
}