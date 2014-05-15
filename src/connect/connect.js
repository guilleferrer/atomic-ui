angular.module('ui.atomic.connect', [])
    .directive('connect', ['$http', function ($http) {
        'use strict';
        return {
            restrict: 'A',
            scope: {
                entity: '='
            },
            controller: ['$scope', '$attrs', function ($scope, $attrs) {
                var type = $attrs.connect,
                    counterProp = 'nb_' + type,
                    userConnectedProp = 'has_user_' + type;

                $scope.connect = function () {
                    var url = '/api/connectables/' + type + '/connects/' + $scope.entity.id;
                    $http.post(url).success(function () {
                        $scope.entity[userConnectedProp] = true;
                        $scope.entity[counterProp]++;
                        $scope.$emit('connectEvent.SUCCESS', {entity: $scope.entity});
                    });
                };

                $scope.disconnect = function () {
                    var url = '/api/connectables/' + type + '/disconnects/' + $scope.entity.id;
                    $http.post(url).success(function () {
                        $scope.entity[userConnectedProp] = false;
                        $scope.entity[counterProp]--;
                        $scope.$emit('disconnectEvent.SUCCESS', {entity: $scope.entity});
                    });
                };

            }],
            link: function (scope, iElement, iAttrs) {
                var type = iAttrs.connect,
                    userConnectedProp = 'has_user_' + type;

                //Initialize button text if required
                function setUI() {
                    if (iAttrs.disconnectText && iAttrs.connectText) {
                        if (scope.entity[userConnectedProp]) {
                            iElement.text(iAttrs.disconnectText);
                        } else {
                            iElement.text(iAttrs.connectText);
                        }
                    }

                    // TODO use ng-class directive
                    if (iAttrs.connectedClass) {
                        if (scope.entity[userConnectedProp]) {
                            iElement.addClass(iAttrs.connectedClass);
                        } else {
                            iElement.removeClass(iAttrs.connectedClass);
                        }
                    }
                }

                scope.$watch('entity', function (value) {
                    if (value) {
                        setUI();
                    }
                });

                //Listen connect button click
                iElement.bind('click', function () {
                    if (scope.entity[userConnectedProp]) {
                        scope.disconnect();
                    } else {
                        scope.connect();
                    }
                });

                //Change button text after connect/disconnect action
                scope.$on('disconnectEvent.SUCCESS', function () {
                    setUI();
                });

                scope.$on('connectEvent.SUCCESS', function () {
                    setUI();
                });
            }
        };
    }]);
