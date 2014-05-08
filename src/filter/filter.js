angular.module('ui.atomic.filter', ['ui.bootstrap'])
    .factory('filterStorage', function filterStorageFactory() {
        var filterStorage = {};

        function save(key, value) {
            filterStorage[key] = value;
        }

        function get(key) {
            return filterStorage[key] || {};
        }

        return {
            'save': save,
            'get': get
        };
    })
    .directive('modalFilter', ['$modal' , 'filterStorage', function ($modal, filterStorage) {
        return {
            restrict: 'E',
            templateUrl: 'template/filter/button.html',
            replace: true,
            scope: {
                title: '@',
                text: '@',
                cancelLabel: '@',
                resetLabel: '@',
                applyLabel: '@',
                formName: '@',
                formUrl: '@'
            },
            link: function (scope) {

                scope.showFilter = function () {

                    scope.$modal = $modal.open({
                        windowClass: 'full-modal',
                        templateUrl: 'template/filter/modal.html',
                        scope: scope
                    });

                    scope.$modal.result.then(function (result) {
                        scope.$emit('filterEvent.FILTER_CHANGE', result);
                    });

                    scope.resetFilter = function () {
                        scope.$broadcast('filter.reset');
                    };

                    scope.applyFilter = function () {
                        scope.$broadcast('filter.apply');
                        scope.$modal.close(filterStorage.get(scope.formName));
                    };
                };
            }
        }
    }])
    .directive('modalFilterForm', [ 'filterStorage', function (filterStorage) {
        return {
            require: 'form',
            link: function (scope, elem, attrs) {
                var formName = attrs.name;

                angular.extend(scope[formName], filterStorage.get(formName));

                scope.$on('filter.reset', function () {
                    filterStorage.save(formName, {});
                    scope[formName] = {};
                });

                scope.$on('filter.apply', function () {
                    filterStorage.save(formName, scope[formName])
                });
            }
        }
    }]);