angular.module('ui.atomic.filter', ['ui.atomic.tools'])

    .factory('filterStorage', function filterStorageFactory() {
        var filterStorage = [];

        return filterStorage;
    })
    .directive('modalFilter', ['$modal', '$templateCache', '$http', '$compile', function ($modal, $templateCache, $http, $compile) {
        return {
            templateUrl: 'template/filter/button.html',
            scope: {
                title: '@',
                text: '@',
                cancelLabel: '@',
                resetLabel: '@',
                applyLabel: '@',
                formName: '@'
            },
            link: function (scope) {
                var modalInstance = {};

                function getFormTemplate() {
                    $http
                        .get('/api/filters/' + scope.formName + '/filter.html')
                        .then(function (response) {
                            $templateCache.put('template/filter/form.html', response.data);
                        });
                }

                function showFilter() {
                    modalInstance = $modal.open({
                        windowClass: 'full-modal',
                        templateUrl: 'template/filter/modal.html',
                        controller: 'FilterPopupController',
                        scope: scope
                    });
                }

                scope.onFilterButtonClick = function () {
                    showFilter();
                };

                getFormTemplate();
            }
        }
    }])
    .controller('FilterPopupController', [ '$scope', '$modalInstance', function ($scope, $modalInstance) {

        $scope.resetFilter = function () {
            $scope.$broadcast('filterEvent.RESET_FILTER_CLICK');
        };

        $scope.applyFilter = function () {
            $scope.$broadcast('filterEvent.APPLY_FILTER_CLICK');

            $modalInstance.dismiss('cancel');
        };

        $scope.close = function () {
            $modalInstance.dismiss('cancel');
        };
    }])
    .directive('modalFilterForm', ['$modal', '$templateCache', '$compile', function ($modal, $templateCache, $compile) {
        return {
            controller: 'FilterFormController',
            scope: {
                formName: '='
            },
            link: function (scope, element, attr, ctrl) {
                var template = angular.element($templateCache.get('template/filter/form.html'));
                var formContentElement = $compile(template)(scope);

                element.html(formContentElement);
            }
        }
    }])

    .controller('FilterFormController', [ '$scope', 'filterStorage', function ($scope, filterStorage) {
        $scope.initFilter = function () {
            if (!filterStorage[$scope.formName]) {
                filterStorage[$scope.formName] = {};
            }
            $scope[$scope.formName] = {};

            angular.extend($scope[$scope.formName], filterStorage[$scope.formName]);
        };

        $scope.resetFilter = function () {
            filterStorage[$scope.formName] = {};
            $scope[$scope.formName] = {};
        };

        $scope.applyFilter = function () {
            angular.extend(filterStorage[$scope.formName], $scope[$scope.formName]);

            $scope.$emit('filterEvent.FILTER_CHANGE', $scope[$scope.formName]);
        };

        $scope.$on('filterEvent.APPLY_FILTER_CLICK', function () {
            $scope.applyFilter();
        });

        $scope.$on('filterEvent.RESET_FILTER_CLICK', function () {
            $scope.resetFilter();
        });

        $scope.initFilter();
    }]);