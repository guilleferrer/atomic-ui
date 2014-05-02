angular.module('ui.atomic.back', [ ])
/**
 * Back directive
 */
    .directive('back', ['$window', function ($window) {

        return function (scope, element, attrs) {
            element.on('click', function () {
                $window.history.back();
            });
        }
    }]);