angular.module('ui.atomic.multiple-choice', ['ui.bootstrap', 'ui.atomic.ng-name'])
    .directive('multipleChoice', [ '$modal', '$log', '$filter', function ($modal, $log, $filter) {

        return {
            restrict: 'E',
            scope: {
                choices: '=',
                ngModel: '=',
                modalHeader: '@',
                modalFooter: '@'
            },
            transclude: true,
            templateUrl: 'template/multiple-choice/multiple-choice-picker.html',
            link: function (scope, element) {

                scope.selectToggle = function (option) {
                    option.selected = !option.selected;
                }

                function select(option) {
                    option.selected = true;
                }

                element.on('click', function openModal() {
                        // store the initial selection in case the user closes the modal and dismissed the changes he made
                        var initialSelection = scope.ngModel;
                        angular.forEach(scope.ngModel, select);

                        // Create modal
                        scope.$modal = $modal.open({
                            windowClass: 'full-modal',
                            templateUrl: 'template/multiple-choice/multiple-choice-modal.html',
                            scope: scope
                        });

                        scope.$modal.result.then(function () {
                            scope.ngModel = $filter('filter')(scope.choices, { selected: true });
                        }, function () {
                            scope.ngModel = initialSelection
                        });
                    }
                );
            }
        }
    }]);