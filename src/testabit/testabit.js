angular.module("ui.makelean.testabit", ['angulartics', 'angulartics.ga', 'ui.bootstrap', 'ui.router'])
    .value('testabitYesText')
    .value('testabitNoText')
    .provider('testabit', function () {

        var allowedCategories = [],
            allowedTypes = ["silent", "modal"],
            debugMode = false;

        this.setDebugMode = function (bool) {
            debugMode = bool;
        };

        this.setCategories = function (categories) {
            if (!angular.isArray(categories)) {
                throw 'Categories for testabit should be an array';
            }
            allowedCategories = categories;
        };

        this.$get = [ "$log", "$analytics" , function ($log, $analytics) {

            function eventTrack(category, action, label, value) {
                var params = {
                    'category': category,
                    'label': label
                };
                if (value !== '') {
                    params['value'] = value;
                }
                if (debugMode) {
                    $log.log('Testabit.eventTrack : ', 'action: ', action , '/ category: ', params.category, '/ label: ', params.label);
                }
                $analytics.eventTrack(action, params);
            }

            var testabit = {};
            angular.extend(testabit, {
                "eventTrack": eventTrack,
                "allowedCategories": allowedCategories,
                "allowedTypes": allowedTypes,
                "debugMode": debugMode
            });

            return testabit;
        }];
    })
    .directive('testabit', ['testabit', '$log', '$modal', 'testabitYesText', 'testabitNoText', function (testabit, $log, $modal, testabitYesText, testabitNoText) {

        function testabitError(err) {
            return "testabit error : " + err;
        }

        function validateOptions(attrs) {

            var error = false;
            // Check Testabit type
            if (-1 === testabit.allowedTypes.indexOf(attrs.testabit)) {
                $log.log(testabitError("Invalid testabit parameter '" + attrs.testabitCategory + "' . The testabit type should be one of these : "), testabit.allowedTypes);
                error = true;
            }

            if (attrs.testabit === "modal") {
                // You must define the title
                if (!attrs.testabitModalTitle) {
                    $log.log(testabitError("Invalid modal title '" + attrs.testabitModalTitle + "' . You have configured testabit type modal, so you must introduce the title of the modal"));
                    error = true;
                }
                // And the message
                if (!attrs.testabitModalMessage) {
                    $log.log(testabitError("Invalid modal message '" + attrs.testabitModalMessage + "' . You have configured testabit type modal, so you must introduce the message of the modal"));
                    error = true;
                }

            }

            // Check Category
            if (-1 === testabit.allowedCategories.indexOf(attrs.testabitCategory)) {
                $log.log(testabitError("Invalid category '" + attrs.testabitCategory + "' . The category should be one of these : "), testabit.allowedCategories);
                error = true;
            }

            // Check Requried Action
            if (!attrs.testabitAction) {
                $log.log(testabitError("Invalid action '" + attrs.testabitAction + "'"));
                error = true;
            }

            // Check Requried Label
            if (!attrs.testabitLabel) {
                $log.log(testabitError("Invalid label '" + attrs.testabitLabel + "'"));
                error = true;
            }

            if (error) {
                return false;
            }

            return {
                category: attrs.testabitCategory,
                action: attrs.testabitAction,
                label: attrs.testabitLabel,
                value: attrs.testabitValue
            };
        }


        return function (scope, element, attrs) {

            var yesText = attrs.testabitYesText || testabitYesText;
            var noText = attrs.testabitNoText || testabitNoText;

            if (testabit.debugMode) {
                element.css('border', '2px dashed white');
            }

            var clickAction = function (event) {

                // In case the element is a real link we cannot eventTracks since it is navigating to the next page!
                var options = validateOptions(attrs);
                if (options === false) {
                    if (testabit.debugMode) {
                        element.css('border', '2px dashed red');
                    }
                    return;
                }

                if (attrs.testabit === "modal") {
                    var btns = [
                        {
                            label: noText,
                            result: 0,
                            cssClass: 'btn-ml-default'
                        },
                        {
                            label: yesText,
                            result: 1,
                            cssClass: 'btn-ml-primary'
                        }
                    ];

                    var modalInstance = $modal.open({
                        templateUrl: 'template/dialog/testabit-message.html',
                        controller: 'MessageBoxController',
                        resolve: {
                            model: function () {
                                return {
                                    title: attrs.testabitModalTitle,
                                    message: attrs.testabitModalMessage,
                                    buttons: btns
                                }
                            }
                        }
                    });

                    modalInstance.result.then(function (result) {
                        var actionSufix = (parseInt(result) > 0) ? 'positive_vote' : 'negative_vote';
                        testabit.eventTrack(options.category, (options.action + '.' + actionSufix), options.label, result);
                    });

                } else {
                    testabit.eventTrack(options.category, options.action, options.label, options.value);
                }
            };

            element.bind('click', function () {
                scope.$apply(clickAction);
            });
        }
    }])
    .controller('MessageBoxController', [ '$scope', '$modalInstance', 'model', function ($scope, $modalInstance, model) {

        $scope.close = function (result) {
            $modalInstance.close(result);
        };

        $scope.title = model.title;
        $scope.message = model.message;
        $scope.buttons = model.buttons;
    }])
;