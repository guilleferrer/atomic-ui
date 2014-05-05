/*
 * atomic.ui
 * Version: 0.0.1 - 2014-05-05
 * License: ISC
 */
angular.module("ui.atomic", [ "ui.atomic.tpls", "pascalprecht.translate", "ui.atomic.alerts","ui.atomic.back","ui.atomic.confirm","ui.atomic.viewport","ui.atomic.full-screen","ui.atomic.testabit","ui.atomic.tools"]);
angular.module("ui.atomic.tpls", ["template/confirm/confirm.html","template/full-screen/full-screen.html","template/testabit/modal.html"]);
angular.module('ui.atomic.alerts', [ "ui.bootstrap.alert"])
    .run([ '$rootScope', '$timeout', function ($rootScope, $timeout) {
        // Global alerts Initialization
        $rootScope.alerts = [];

        $rootScope.closeAlert = function (index) {
            $rootScope.alerts.splice(index, 1);
        };

        var addAlert = function (alert) {
            $rootScope.alerts.push(alert);

            // Remove the alert after 3,5 seconds
            $timeout(function () {
                $rootScope.alerts.pop();
            }, 3500);
        };

        $rootScope.$on('submit.error', function (event, form) {
            addAlert({ type: 'danger', msg: 'validationMessage', keep: false });
        });

        // When you want to emit an aler, include the following alert object:
        /* 
         * { 
         *    type : 'danger', // info, warning, success
         *    msg: 'My message for the alert'
         *  }
         *
         *
         * */
        $rootScope.$on('alert.show', function (event, alert) {
            addAlert(alert);
        });

        $rootScope.$on("$stateChangeSuccess", function () {
            for (var i = $rootScope.alerts.length - 1; i >= 0; i--) {
                if (!$rootScope.alerts[i].keep) {
                    $rootScope.closeAlert(i);
                }
            }
        });
    }]);

angular.module('ui.atomic.back', [ ])
    .directive('back', ['$window', function ($window) {

        return function (scope, element, attrs) {
            element.on('click', function () {
                $window.history.back();
            });
        }
    }]);
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
angular.module('ui.atomic.full-screen', ['ui.bootstrap', 'angular-carousel', 'ui.atomic.viewport'])
    .directive('fullScreen', [ '$modal' , 'viewport', function ($modal, viewport) {

        return {
            scope: {
                images: '=fullScreen'
            },
            link: function (scope, element, attrs) {
                var modalInstance;
                element.on('click', function () {

                    modalInstance = $modal.open({
                        windowClass: 'full-modal full-screen',
                        templateUrl: 'template/full-screen/full-screen.html',
                        scope: scope
                    });

                    modalInstance.opened.then(function () {
                        viewport.set('maximum-scale', '2');
                    });

                    modalInstance.result.then(function () {
                        viewport.set('maximum-scale', '1');
                    })
                })

                scope.cancel = function () {
                    modalInstance.close();
                }

            }
        }
    }]);
angular.module("ui.atomic.testabit", ['angulartics', 'angulartics', 'ui.bootstrap'])
    .config(['$analyticsProvider', function ($analyticsProvider) {
        var lastVisitedPage = '/';
        $analyticsProvider.registerPageTrack(function (path) {
            lastVisitedPage = path;
            if (window.ga) {
                ga('send', 'pageview', path);
            }
        });

        $analyticsProvider.registerEventTrack(function (action, properties) {
            if (window.ga) {
                window.ga('send', 'event', properties.category, action, properties.label, { page: lastVisitedPage });
            }
        });
    }])
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
                    $log.log('Testabit.eventTrack : ', 'action: ', action, '/ category: ', params.category, '/ label: ', params.label);
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
    .directive('testabit', ['testabit', '$log', '$modal', function (testabit, $log, $modal) {

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
                            label: 'testabit.no',
                            result: 0,
                            cssClass: 'btn-ml-default'
                        },
                        {
                            label: 'testabit.yes',
                            result: 1,
                            cssClass: 'btn-ml-primary'
                        }
                    ];

                    var modalInstance = $modal.open({
                        templateUrl: 'template/testabit/modal.html',
                        controller: 'MessageBoxController',
                        resolve: {
                            model: function () {
                                return {
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

        $scope.buttons = model.buttons;
    }])
;
angular.module('ui.atomic.tools', [])
    .factory('urlTools', function () {

        function toKeyValue(obj, prefix) {
            var str = [];
            for (var p in obj) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                str.push(typeof v == "object" ?
                    toKeyValue(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
            return str.join("&");
        }

        /**
         * Tries to decode the URI component without throwing an exception.
         *
         * @private
         * @param str value potential URI component to check.
         * @returns {boolean} True if `value` can be decoded
         * with the decodeURIComponent function.
         */
        function tryDecodeURIComponent(value) {
            try {
                return decodeURIComponent(value);
            } catch (e) {
                // Ignore any invalid uri component
            }
        }


        /**
         * Parses an escaped url query string into key-value pairs.
         * @returns Object.<(string|boolean)>
         */
        function parseKeyValue(/**string*/keyValue) {
            var obj = {}, key_value, key;
            angular.forEach((keyValue || "").split('&'), function (keyValue) {
                if (keyValue) {
                    key_value = keyValue.split('=');
                    key = tryDecodeURIComponent(key_value[0]);
                    if (angular.isDefined(key)) {
                        var val = angular.isDefined(key_value[1]) ? tryDecodeURIComponent(key_value[1]) : true;
                        if (!obj[key]) {
                            obj[key] = val;
                        } else if (isArray(obj[key])) {
                            obj[key].push(val);
                        } else {
                            obj[key] = [obj[key], val];
                        }
                    }
                }
            });
            return obj;
        }

        return {
            'toKeyValue': toKeyValue,
            'parseKeyValue': parseKeyValue
        };
    });

angular.module('ui.atomic.viewport', [])
    .factory('viewport', function () {

        var viewPort = getViewPort();

        function getViewPort() {
            var viewPortContent = angular.element('meta[name="viewport"]').attr('content')

            return parseViewPortContent(viewPortContent);
        }


        function parseViewPortContent(viewPortContent) {
            var obj = {};
            var viewPortContentArray = viewPortContent.replace(/ /g, '').split(',');
            angular.forEach(viewPortContentArray, function (part) {
                var parts = part.split('=');
                this[parts[0]] = parts[1];
            }, obj);

            return obj;
        }

        function serializeViewPortContent(obj) {
            var parts = [];
            angular.forEach(obj, function (value, key) {
                parts.push(key + '=' + value);
            });

            return parts.join(',');
        }

        function setViewPort(key, value) {
            viewPort[key] = value;

            var serializedViewPort = serializeViewPortContent(viewPort);
            angular.element('meta[name="viewport"]').attr('content', serializedViewPort)
        }

        return {
            'get': getViewPort,
            'set': setViewPort
        }
    });

angular.module("template/confirm/confirm.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/confirm/confirm.html",
    "<div class=\"modal-body\">\n" +
    "    <h4 class=\"margin-add-bottom-10\">{{ 'confirm.title' | translate }}</h4>\n" +
    "\n" +
    "    <p class=\"medium-paragraph\">{{ 'confirm.message' | translate }}</p>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <ul class=\"buttons-list padding-add-x-20 padding-add-bottom-20 margin-rm-all\">\n" +
    "        <li ng-repeat=\"btn in buttons\">\n" +
    "            <button\n" +
    "                    ng-click=\"close(btn.result)\"\n" +
    "                    class=\"btn btn-block\"\n" +
    "                    ng-class=\"btn.cssClass\">\n" +
    "                {{ btn.label | translate }}\n" +
    "            </button>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("template/full-screen/full-screen.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/full-screen/full-screen.html",
    "<button class=\"btn btn-link pull-right\" data-ng-click=\"cancel()\"><i class=\"ml-icon-30\"></i></button>\n" +
    "<h1>{{ 'fullscreen.title' | translate }}</h1>\n" +
    "<div class=\"modal-body testabit\">\n" +
    "    <ul rn-carousel rn-carousel-control class=\"image\">\n" +
    "        <li ng-repeat=\"image in images\">\n" +
    "            <img ng-src=\"{{ image.url }}\"/>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("template/testabit/modal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/testabit/modal.html",
    "<div class=\"modal-body testabit\">\n" +
    "    <i class=\"ml-icon-54\"></i>\n" +
    "    <h4>{{ 'testabit.modal.title' | translate }}</h4>\n" +
    "    <p>{{ 'testabit.modal.message' | translate }}</p>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <ul class=\"double-btn padding-add-x-20 padding-add-bottom-10 margin-rm-all\">\n" +
    "        <li ng-repeat=\"btn in buttons\">\n" +
    "            <button ng-click=\"close(btn.result)\"\n" +
    "                    class=\"btn\"\n" +
    "                    ng-class=\"btn.cssClass\">\n" +
    "                {{ btn.label | translate }}\n" +
    "            </button>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);
