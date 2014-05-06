angular.module("ui.atomic.search", ['ui.atomic.pager'])

    /**
     * Emits a searchEvent.SEARCH_CHANGE with an object that contains the value of the input
     * Event must be listened on $rootScope as $rootScope.$on('searchEvent.SEARCH_CHANGE', doSomething())
     */
    .directive('searchDispatcher', ['$timeout', function($timeout) {
        return {
            link: function (scope, element, attrs) {

                var timeoutId;
                var searchField = attrs.searchField;

                scope.$watch(attrs.ngModel, function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $timeout.cancel(timeoutId);
                        timeoutId = $timeout(function () {
                            onSearchChange(newVal);
                        }, 1000);
                    }
                });


                function onSearchChange(value) {
                    var params = {};
                    params[searchField] = value;
                    scope.$emit('searchEvent.SEARCH_CHANGE', value, params);
                }
            }
        };
    }])

    .directive('searchPager', ['$timeout', '$rootScope', 'Pager', function($timeout, $rootScope, Pager) {
        return {
            scope: {
                searchParams: "@",
                pager: "=searchPager"
            },
            require: 'ngModel',
            link: function (scope, element, attrs) {

                var timeoutId;
                scope.$watch(attrs.ngModel, function (newVal, oldVal) {

                    if (newVal !== oldVal) {
                        $timeout.cancel(timeoutId);
                        timeoutId = $timeout(function () {
                            $rootScope.$broadcast('search.change', newVal, scope.$eval(scope.searchParams));
                        }, 1000);
                    }
                });


                function onSearchChange(e, search, params) {
                    search && (params.name = search);
                    scope.pager = new Pager(scope.pager.url, params);
                    scope.pager.nextPage();
                }

                scope.$on('search.change', onSearchChange);
            }
        };
    }])

    .directive('search', ['$timeout', '$rootScope', '$resource', function ($timeout, $rootScope, $resource) {

        return {
            restrict: 'EA',
            templateUrl: function (tElem, tAttrs) {
                return tAttrs.templateUrl || '/tpl/search.html';
            },
            scope: {
                searchParams: "@",
                searchUrl: "@",
                class: '@',
                inputClass: '@',
                listClass: '@',
                placeholder: '@',
                noResultMessage: '@'
            },
            replace: true,
            transclude: true,
            controller: function ($scope, $rootScope) {
                $scope.results = [];
                $scope.search = '';
                $scope.showNoresult = false;


                var params = $scope.$eval($scope.searchParams) || {},
                    timeoutId;

                $scope.$watch('search', function (newVal, oldVal) {
                    if (newVal !== oldVal) {
                        $timeout.cancel(timeoutId);
                        timeoutId = $timeout(function () {
                            $scope.$emit('search.change', newVal, params);
                        }, 500);
                    }
                    if (!newVal) {
                        $scope.showNoresult = false;
                        $scope.results = [];
                    }
                });

                function onSearchChange(e, search, params) {
                    if (search) {
                        params.name = search;
                        $resource($scope.searchUrl, params).get(function (response) {
                            $scope.results = response.results;
                            $scope.showNoresult = ($scope.results.length === 0);
                        });
                    }
                }

                $rootScope.$on('search.change', onSearchChange);

            }
        };
    }])

    .directive('searchItem', function factory() {
        return {
            restrict: 'EA',
            templateUrl: '/tpl/search/item.html',
            require: '^search',
            replace: true
        };
    })

;

