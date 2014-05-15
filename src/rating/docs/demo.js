function RatingDemoCtrl($scope, $rootScope, $httpBackend) {

    $scope.myEntity = {
        rating: {
            id: 1,
            votes: [
                {
                    score: 3,
                    created_by: 7
                }
            ]
        }
    };

    $scope.$on('ratingEvent.STAR_CLICK', function (event, rate) {
        console.log('ratingEvent.STAR_CLICK : ', rate);
    });

    $rootScope.$on('ratingEvent.SUCCESS', function (event, rate) {
        console.log('ratingEvent.SUCCESS : ', rate);
    });

    $httpBackend.whenPOST(/^\/api\/ratings\/1\/votes\/\d\/rating/).respond({
        id: 1,
        votes: [
            {
                score: 3,
                created_by: 7
            }
        ]
    });
}

RatingDemoCtrl.$inject = [ '$scope', '$rootScope', '$httpBackend'];