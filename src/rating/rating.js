(function (angular) {
    'use strict';
    angular.module('ui.atomic.rating', [ 'ui.bootstrap' ])
        .directive('starRating', [ '$rootScope', function ($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    entity: '=',
                    myUserId: '='
                },
                templateUrl: 'template/rating/star-rating.html',
                controller: ['$scope' , function ($scope) {

                    $scope.onStarClick = function (index) {
                        if (!$scope.readOnly) {
                            $scope.rate = index + 1;
                            $scope.$emit('ratingEvent.STAR_CLICK', $scope.rate);
                        }
                    };
                }],
                link: function (scope, elem, attrs) {
                    var max = parseInt(attrs.max) || 10,
                        showMyVote = (attrs.showMyVote === 'true');

                    var initialize = function () {
                        for (var i = 0; i < max; i++) {
                            scope.starRange[i] = { index: i };
                        }
                    };

                    var getMyScore = function () {
                        if (!scope.myUserId) {
                            throw('myUserId must be defined in if showMyVote is set to true');
                        }
                        var score = 0;
                        // TODO : remove dependency with entity. Get votes directly from the model
                        angular.forEach(scope.entity.rating.votes, function (vote) {
                            if (vote.created_by === parseInt(scope.myUserId)) {
                                score = vote.score;
                            }
                        });

                        return score;
                    };

                    scope.starRange = [];
                    scope.size = attrs.starSize || 'small';
                    scope.rate = 0;
                    scope.readOnly = (attrs.readOnly === 'true');

                    scope.$watch('entity', function (value) {
                        if (value) {
                            scope.rate = (showMyVote) ? getMyScore() : value.rating.score;
                        }
                    });

                    $rootScope.$on('ratingEvent.SUCCESS', function (event, data) {
                        if (scope.entity && scope.entity.rating.id === data.id) {
                            scope.entity.rating = data;
                            scope.rate = data.score;
                        }
                    });

                    initialize();
                }
            };
        }])

        .directive('starRatingPopup', ['$http', '$modal', '$rootScope', function ($http, $modal, $rootScope) {
            return {
                restrict: 'A',
                scope: {
                    entity: '=starRatingEntity',
                    myUserId: '@starRatingPopupMyUserId'
                },
                link: function (scope, elem, attrs) {
                    var popupText = attrs.starRatingPopupText,
                        popupAcceptButtonText = attrs.starRatingPopupAcceptButtonText,
                        popupCancelButtonText = attrs.starRatingPopupCancelButtonText,
                        rate = 0;

                    elem.bind('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        scope.text = popupText;
                        scope.buttons = [
                            {
                                label: popupAcceptButtonText,
                                result: 1,
                                cssClass: 'btn-primary'
                            },
                            {
                                label: popupCancelButtonText,
                                result: 0,
                                cssClass: 'btn-ml-default'
                            }
                        ];

                        var modalInstance = $modal.open({
                            scope: scope,
                            templateUrl: 'template/rating/rating-popup.html'
                        });

                        scope.close = function (result) {
                            modalInstance.close(result);
                        };

                        modalInstance.result.then(function (result) {
                            if (result === 1) {
                                var url = '/api/ratings/' + scope.entity.rating.id + '/votes/' + rate + '/rating';

                                $http.post(url).success(function (data) {
                                    $rootScope.$emit('ratingEvent.SUCCESS', data);
                                });
                            }
                        });
                    });

                    scope.$on('ratingEvent.STAR_CLICK', function (event, data) {
                        rate = data;
                    });
                }
            };
        }])
    ;
})(window.angular);