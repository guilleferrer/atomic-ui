angular.module('ui.atomic.search-box', [])
    .directive('searchBox', [ '$timeout', function factory($timeout) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: 'template/search-box/search-box.html',
            scope: {
                placeholder: '@'
            },
            link: function (scope, element, attrs) {
                var timeoutId;

                scope.erase = function () {
                    scope.search = '';
                }

                scope.$watch('search', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $timeout.cancel(timeoutId);
                        timeoutId = $timeout(function () {
                            onSearchChange(newVal);
                        }, 1000);
                    }
                });

                function onSearchChange(value) {
                    if (value != '') {
                        scope.$emit('searchEvent.SEARCH_CHANGE', value);
                    }

                }
            }
        };
    }]);