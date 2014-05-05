/*
 * atomic.ui
 * Version: 0.0.1 - 2014-05-05
 * License: ISC
 */
angular.module("ui.atomic", [ "ui.atomic.tpls", "pascalprecht.translate", "ui.atomic.alerts","ui.atomic.back","ui.atomic.confirm","ui.atomic.viewport","ui.atomic.full-screen","ui.atomic.tools"]);
angular.module("ui.atomic.tpls", ["template/confirm/confirm.html","template/full-screen/full-screen.html"]);
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
