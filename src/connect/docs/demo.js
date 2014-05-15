function ConnectDemoCtrl($scope, $httpBackend) {
    $scope.myEntity = {
        id: 1,
        name: "My Entity name",
        description: "Description in my entity"
    };

    $scope.$on('connectEvent.SUCCESS', function () {
        console.log('Thank you for liking lemons');
    });

    $scope.$on('disconnectEvent.SUCCESS', function () {
        console.log("You don't like lemons anymore");
    });


    $httpBackend.whenPOST(/\/api\/connectables\/like\/connects\/\d+/).respond({ id : "Connected" });
    $httpBackend.whenPOST(/\/api\/connectables\/like\/disconnects\/\d+/).respond({ id : "Disconnected" });
}

ConnectDemoCtrl.$inject = ['$scope', '$httpBackend'];