angular.module('ui.atomic.multiple-choice', ['ui.bootstrap', 'ui.atomic.ng-name'])
    .directive('multipleChoice', [ '$modal', '$log', '$filter', function ($modal, $log, $filter) {

        return {
            restrict: 'E',
            scope: {
                choices: '=',
                ngModel: '=',
                modalFooter: '@',
                modalHeader: '@'

            },
            replace: true,
            transclude: true,
            templateUrl: 'template/multiple-choice/multiple-choice-picker.html',
            link: function (scope, element, attrs) {

                var modalInstance, initialSelection;

                scope.$watch('choices', function () {
                    if (scope.choices) {
                        // Initialize the form with the selection choices
                        initialSelection = $filter('filter')(scope.choices, { selected: true });
                        applySelection(initialSelection);
                    }
                });

                function applySelection(selectedChoices) {
                    scope.ngModel = selectedChoices;
                }

                function dismissModal() {
                    applySelection(initialSelection);
                }

                function openModal() {

                    // Create modal
                    modalInstance = $modal.open({
                        windowClass: 'full-modal',
                        templateUrl: 'template/multiple-choice/multiple-choice-modal.html',
                        controller: 'MultipleChoiceModalCtrl',
                        resolve: {
                            choices: function () {
                                return scope.choices;
                            },
                            modalHeader: function () {
                                return scope.modalHeader;
                            },
                            modalFooter: function () {
                                return scope.modalFooter;
                            }
                        }
                    });


                    modalInstance.result.then(applySelection, dismissModal);
                }

                element.on('click', openModal);
            }

        }
    }])
    .controller('MultipleChoiceModalCtrl', [ '$scope', '$modalInstance', '$filter', 'choices' , 'modalHeader', 'modalFooter', function ($scope, $modalInstance, $filter, choices, modalHeader, modalFooter) {

        $scope.choices = choices;
        $scope.modalHeader = modalHeader;
        $scope.modalFooter = modalFooter || 'OK';

        $scope.ok = function () {
            var selectedChoices = $filter('filter')($scope.choices, { selected: true });
            $modalInstance.close(selectedChoices);
        };

        $scope.cancel = function () {
            // Only set as selected those which are really selected
            $modalInstance.dismiss('cancel');
        };
    }]);
