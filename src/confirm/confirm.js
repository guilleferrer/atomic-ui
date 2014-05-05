angular.module('ui.atomic.confirm', ['ui.bootstrap'])
    .directive('confirmUrl', ['$http', '$window', '$modal', function ($http, $window, $modal) {

        return function (scope, element, attrs) {

            var url = attrs.confirmUrl,
                method = attrs.confirmMethod || 'delete',
                actionBtnClass = attrs.actionBtnClass || 'btn-ml-danger',
                followUrl = attrs.followUrl == "true";

            element.bind('click', function (event) {

                event.preventDefault();

                scope.buttons = [
                    {
                        label: 'confirm.yes',
                        result: 1,
                        cssClass: actionBtnClass
                    },
                    {
                        label: 'confirm.no',
                        result: 0,
                        cssClass: 'btn-ml-default'
                    }
                ];

                var modalInstance = $modal.open({
                    scope: scope,
                    templateUrl: 'template/confirm/confirm.html'
                });

                scope.close = function (result) {
                    modalInstance.close(result);
                };

                modalInstance.result.then(function (result) {
                    if (result === 1) {
                        if (followUrl === true) {
                            $window.location = url;
                        } else {
                            $http[method](url).success(function (data) {
                                scope.$emit('apiEvent.ACTION_SUCCESS', data);
                            })
                        }
                    }
                });

                return false;
            });
        }
    }]);