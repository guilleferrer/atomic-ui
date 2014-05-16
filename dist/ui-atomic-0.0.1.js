/*
 * atomic.ui
 * Version: 0.0.1 - 2014-05-16
 * License: EULA
 * Author: Guillermo Ferrer <guilleferrer@gmail.com>
 */
angular.module("ui.atomic", ["ui.atomic.alerts","ui.atomic.back","ui.atomic.compile","ui.atomic.confirm","ui.atomic.connect","ui.atomic.fbinvite","ui.atomic.filter","ui.atomic.viewport","ui.atomic.full-screen","ui.atomic.infinite-scroll","ui.atomic.pager","ui.atomic.list","ui.atomic.mailto","ui.atomic.map","ui.atomic.ng-name","ui.atomic.multiple-choice","ui.atomic.nl2br","ui.atomic.rating","ui.atomic.search-box","ui.atomic.testabit","ui.atomic.tools","ui.atomic.truncate","ui.atomic.urlencode","ui.atomic.user-advice","ui.atomic.whatsapp"]);
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

        /**
         * Listeners
         */
        $rootScope.$on('submit.error', function (event, form) {
            addAlert({ type: 'danger', msg: 'alerts.form.validationMessage', keep: false });
        });

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
angular.module('ui.atomic.compile', [], ['$compileProvider', function ($compileProvider) {
    // configure new 'compile' directive by passing a directive
    // factory function. The factory function injects the '$compile'
    $compileProvider.directive('compile', [ '$compile', function ($compile) {
        // directive factory creates a link function
        return function (scope, element, attrs) {
            scope.$watch(
                function (scope) {
                    // watch the 'compile' expression for changes
                    return scope.$eval(attrs.compile);
                },
                function (value) {
                    // when the 'compile' expression changes
                    // assign it into the current DOM
                    element.html(value);

                    // compile the new DOM and link it to the current
                    // scope.
                    // NOTE: we only compile .childNodes so that
                    // we don't get into infinite loop compiling ourselves
                    $compile(element.contents())(scope);
                }
            );
        };
    }])
}]);


angular.module('ui.atomic.confirm', ['ui.bootstrap'])
    .directive('confirmUrl', ['$http', '$window', '$modal', function ($http, $window, $modal) {

        return {
            scope: {
                title: '@confirmTitle',
                message: '@confirmMessage',
                buttonYes: '@confirmYes',
                buttonNo: '@confirmNo'
            },
            link: function (scope, element, attrs) {

                var url = attrs.confirmUrl,
                    method = attrs.confirmMethod || 'delete',
                    actionBtnClass = attrs.actionBtnClass || 'btn-ml-danger',
                    followUrl = attrs.followUrl == "true";

                element.bind('click', function (event) {

                    event.preventDefault();

                    scope.buttons = [
                        {
                            label: scope.buttonYes,
                            result: 1,
                            cssClass: actionBtnClass
                        },
                        {
                            label: scope.buttonNo,
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

        }
    }]);
angular.module('ui.atomic.connect', [])
    .directive('connect', ['$http', function ($http) {
        'use strict';
        return {
            restrict: 'A',
            scope: {
                entity: '='
            },
            controller: ['$scope', '$attrs', function ($scope, $attrs) {
                var type = $attrs.connect,
                    counterProp = 'nb_' + type,
                    userConnectedProp = 'has_user_' + type;

                $scope.connect = function () {
                    var url = '/api/connectables/' + type + '/connects/' + $scope.entity.id;
                    $http.post(url).success(function () {
                        $scope.entity[userConnectedProp] = true;
                        $scope.entity[counterProp]++;
                        $scope.$emit('connectEvent.SUCCESS', {entity: $scope.entity});
                    });
                };

                $scope.disconnect = function () {
                    var url = '/api/connectables/' + type + '/disconnects/' + $scope.entity.id;
                    $http.post(url).success(function () {
                        $scope.entity[userConnectedProp] = false;
                        $scope.entity[counterProp]--;
                        $scope.$emit('disconnectEvent.SUCCESS', {entity: $scope.entity});
                    });
                };

            }],
            link: function (scope, iElement, iAttrs) {
                var type = iAttrs.connect,
                    userConnectedProp = 'has_user_' + type;

                //Initialize button text if required
                function setUI() {
                    if (iAttrs.disconnectText && iAttrs.connectText) {
                        if (scope.entity[userConnectedProp]) {
                            iElement.text(iAttrs.disconnectText);
                        } else {
                            iElement.text(iAttrs.connectText);
                        }
                    }

                    // TODO use ng-class directive
                    if (iAttrs.connectedClass) {
                        if (scope.entity[userConnectedProp]) {
                            iElement.addClass(iAttrs.connectedClass);
                        } else {
                            iElement.removeClass(iAttrs.connectedClass);
                        }
                    }
                }

                scope.$watch('entity', function (value) {
                    if (value) {
                        setUI();
                    }
                });

                //Listen connect button click
                iElement.bind('click', function () {
                    if (scope.entity[userConnectedProp]) {
                        scope.disconnect();
                    } else {
                        scope.connect();
                    }
                });

                //Change button text after connect/disconnect action
                scope.$on('disconnectEvent.SUCCESS', function () {
                    setUI();
                });

                scope.$on('connectEvent.SUCCESS', function () {
                    setUI();
                });
            }
        };
    }]);

angular.module('ui.atomic.fbinvite', [ ]).
    factory('Facebook', function () {
        var requestNonAppFriends = function (params, callback) {
            FB.ui({
                method: 'apprequests',
                filters: ['app_non_users'],
                title: params.title,
                message: params.message
            }, function (response) {
                if (response && callback) {
                    callback(response);
                }
            });
        };

        return {
            fb: function () {
                return FB;
            },
            requestNonAppFriends: function (params, callback) {
                requestNonAppFriends(params, callback);
            }
        }
    })
    .directive('fbinvite', ['$http, Facebook', function ($http, Facebook) {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, controller) {
                var fb = Facebook;
                if (angular.isUndefined(attrs.fbinviteMessage)) {
                    throw 'fbinvite-message parameter is required';
                }
                var params = {title: attrs.fbinviteTitle, message: attrs.fbinviteMessage};
                element.on("click", function () {
                    fb.requestNonAppFriends(params);
                });
            }
        }
    }]);


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
/* ng-infinite-scroll - v1.0.0 - 2013-02-23 */
angular.module('ui.atomic.infinite-scroll', [])
    .directive('infiniteScroll', ['$rootScope', '$window', '$timeout', function ($rootScope, $window, $timeout) {
        return {
            link: function (scope, elem, attrs) {
                var checkWhenEnabled, handler, scrollDistance, scrollEnabled;
                $window = angular.element($window);
                scrollDistance = 0;
                if (attrs.infiniteScrollDistance != null) {
                    scope.$watch(attrs.infiniteScrollDistance, function (value) {
                        return scrollDistance = parseFloat(value);
                    });
                }
                scrollEnabled = true;
                checkWhenEnabled = false;
                if (attrs.infiniteScrollDisabled != null) {
                    scope.$watch(attrs.infiniteScrollDisabled, function (value) {
                        scrollEnabled = !value;
                        if (scrollEnabled && checkWhenEnabled) {
                            checkWhenEnabled = false;
                            return handler();
                        }
                    });
                }
                handler = function () {
                    var elementBottom, remaining, shouldScroll, windowBottom;
                    windowBottom = $window.height();// + elem.parent().scrollTop();
                    elementBottom = elem.offset().top + elem.height();
                    remaining = elementBottom - windowBottom;
                    shouldScroll = remaining <= 20 * scrollDistance;
                    if (shouldScroll && scrollEnabled) {
                        if ($rootScope.$$phase) {
                            return scope.$eval(attrs.infiniteScroll);
                        } else {
                            return scope.$apply(attrs.infiniteScroll);
                        }
                    } else if (shouldScroll) {
                        return checkWhenEnabled = true;
                    }
                };

                elem.parents('.scroller').on('scroll', handler);
                scope.$on('$destroy', function () {
                    return elem.parents('.scroller').off('scroll', handler);
                });
                return $timeout((function () {
                    if (attrs.infiniteScrollImmediateCheck) {
                        if (scope.$eval(attrs.infiniteScrollImmediateCheck)) {
                            return handler();
                        }
                    } else {
                        return handler();
                    }
                }), 0);
            }
        };
    }
    ]);

angular.module("ui.atomic.pager", [])

    .provider('pagerCache', function () {

        this.$get = ['$cacheFactory', function ($cacheFactory) {
            return $cacheFactory('pager');
        }];
    })
    .provider('Pager', function () {


        var initialPage = 1;
        /**
         * You can define if you want to start from a certain page
         * by default uses 0
         *
         * @param page
         */
        this.setInitialPage = function (page) {
            initialPage = page;
        }


        this.$get = ['$http', '$rootScope', 'pagerCache', function ($http, $rootScope, pagerCache) {


            /**
             * Creates a Pager that fetches data from the url
             * with the given search parameters
             *
             * @param string url
             * @param {} search
             * @constructor
             */
            function Pager(url, search, middleware) {
                this.id = new Date().getTime();
                this.search = search || {};
                this.middleware = middleware || function (item) {
                    return item;
                };
                this.url = url;
                this.page = initialPage;
                this.finished = false;
                this.busy = false;
                this.showNoResults = false;
                this.results = [];
                this.nbResults = 0;
                this.nbUnread = 0;
            }


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

            function encodeUriQuery(val, pctEncodeSpaces) {
                return encodeURIComponent(val).
                    replace(/%40/gi, '@').
                    replace(/%3A/gi, ':').
                    replace(/%24/g, '$').
                    replace(/%2C/gi, ',').
                    replace(/%20/g, (pctEncodeSpaces ? '%20' : '+'));
            }

            /**
             * Gets the new page
             */
            Pager.prototype.nextPage = function (callback, useCache) {
                var getParams = {};

                if (useCache !== false) {
                    getParams.cache = pagerCache;
                }

                /**
                 * The pager is still busy with the last request of new Page
                 */
                if (this.busy) {
                    return;
                }

                /**
                 * The pager has already finished all the pages to be loaded
                 */
                if (this.finished) {
                    return;
                }

                /**
                 * First of all, mark as busy
                 */
                this.busy = true;


                var url = this.url;
                this.search = angular.extend(this.search, {'page': this.page});
                var search = toKeyValue(this.search);
                url = url + (search ? '?' + search : '');


                var that = this;
                /**
                 * Call for the results of next page
                 */
                $http
                    .get(url, getParams)
                    .then(function (response) {

                        var data = response.data
                        that.busy = false;
                        that.nbResults = data.nbResults;
                        that.nbUnread += data.nbUnread;

                        that.showNoResults = data.results.length == 0;

                        // TODO middleware for paged lists?

                        // TODO : handle removal of DOM elements for long lists
                        angular.forEach(data.results, function (feed) {
                            that.results.push(that.middleware(feed));
                        });


                        /**
                         * If there are no pages, then show the no-activity page
                         */
                        if (data.nbPages == 0 && that.results.length == 0) {
                            // Attach the pager id in the no_results event
                            $rootScope.$broadcast('pager.no_results', that.id);
                        }

                        if (angular.isFunction(callback)) {
                            callback(that);
                        }

                        $rootScope.$broadcast('pager.page_loaded', that.page, that.results);
                        /**
                         * If it reached the end of the list... do not increase the page anymore
                         * Mark finished=true
                         */
                        if (data.nbPages == that.page || data.results.length == 0) {
                            that.finished = true;
                            $rootScope.$broadcast('pager.last_page');
                            return;
                        }
                        that.page += 1;
                    });
            };

            return Pager;
        }]
    });


angular.module('ui.atomic.list', ['ui.atomic.pager', 'ui.atomic.infinite-scroll'])
    .directive('list', [ 'Pager', '$rootScope', function (Pager, $rootScope) {
        return {
            restrict: 'E',
            templateUrl: 'template/list/paged-list.html',
            replace: true,
            transclude: true,
            link: function (scope, element, attrs) {
                scope.listClass = attrs.listClass || 'list-group';
                scope.listCache = attrs.$attr.listNoCache ? false : true;
                var query = scope.$eval(attrs.apiQuery) || {};
                scope.pager = new Pager(attrs.apiUrl, query);

                $rootScope.$on('searchEvent.SEARCH_CHANGE', function (event, value, params) {
                    angular.extend(query, params);
                    scope.pager = new Pager(attrs.apiUrl, query);
                    scope.pager.nextPage();
                })
            }
        };
    }])
    .directive('listItem', function () {

        return {
            restrict: 'E',
            replace: true,
            templateUrl: function (tElement, tAttrs) {

                return tAttrs.itemTplUrl || 'template/list/list-item.html';
            }
        };
    });
angular.module('ui.atomic.mailto', [ ])
    .directive('mailto', function () {
        return {
            restrict: 'A',
            scope: {
                mailto: '='
            },
            link: function (scope, element, attrs) {
                var mailto = attrs.mailto,
                    mailtoSubject = attrs.mailtoSubject,
                    mailtoContent = attrs.mailtoContent;

                element.bind("click", function () {
                    window.location = "mailto:" + mailto + "?subject=" + mailtoSubject + "&body=" + encodeURIComponent(mailtoContent);
                });

                scope.$watch('mailto', function (value) {
                    if (value) {
                        mailto = value;
                    }
                })
            }
        }
    });
/**
 * Map Directive. TODO move to ui.atomic.map
 *
 */
angular.module('ui.atomic.map', ['leaflet-directive', 'ui.atomic.pager'])
/**
 *  @description
 *  The map directive creates a map on your page and loads a series of markers in it
 *  The markers are loaded via a call to the API
 *
 *  Api:
 *    - api-url :   ( default : undefined ) defines the backend url to be called to load the markers.
 *                  It expects a json array of objects having a "marker" property having the coordinates of the marker
 *                  to be loaded in the map.
 *    - marker-entity-name: ( default 'location' ) property whose value contains the coordinates of the marker position
 *    - popup: &  scope function that defines the popup text to be shown in every marker point
 *    - query:  ( default: {} ) model that allows filtering the markers to be added in a specific way
 *    - mycenter: ( default {} ) model that allows to force the center of the map to a certain location
 *
 */
    .directive('map', ['Pager', function (Pager) {
        'use strict';
        return {
            restrict: 'C',
            scope: {
                popup: '&',
                query: "=apiQuery",
                mycenter: '='
            },
            templateUrl : 'template/map/map.html',
            controller: ['$scope', '$attrs', '$timeout', 'leafletData', '$rootScope', function ($scope, $attrs, $timeout, leafletData, $rootScope) {
                //Initialize the api pager
                var timeoutId,
                    url = $attrs.apiUrl,
                    markerEntityName = $attrs.markerEntityName || 'location';

                $scope.query = $scope.query || {};

                //Configure the leaflet directive
                angular.extend($scope, {
                    width: $attrs.width || '100%',
                    height: $attrs.height || '100%',
                    markers: [],
                    defaults: {
                        maxZoom: $attrs.maxZoom || 18,
                        timeout: 30000
                    },
                    layers: {
                        baselayers: {
                            googleRoadmap: {
                                name: 'Google Streets',
                                layerType: 'ROADMAP',
                                type: 'google'
                            },
                            googleHybrid: {
                                name: 'Google Hybrid',
                                layerType: 'HYBRID',
                                type: 'google'
                            }
                        }
                    }
                });

                if ($scope.mycenter) {
                    $scope.center = $scope.mycenter;
                    loadMap();
                    return;
                } else {
                    $scope.center = {
                        autoDiscover: true,
                        zoom: parseInt($attrs.zoom) || 16
                    };
                }

                // Search Events
                $rootScope.$on('searchEvent.SEARCH_CHANGE', function (event, value, params) {
                    angular.extend($scope.query, params);
                    loadMap();
                });

                $rootScope.$on('filterEvent.SEARCH_CHANGE', function (event, value, params) {
                    angular.extend($scope.query, params);
                    loadMap();
                });

                //Function to initialize de map
                function loadMap() {
                    var lat = $rootScope.currentPosition ? $rootScope.currentPosition.lat : 41.3975834,
                        lng = $rootScope.currentPosition ? $rootScope.currentPosition.lng : 2.1907346;
                    //Extend query params in order to filter by distance
                    angular.extend($scope.query, {
                        orderBy: {
                            lat: lat,
                            lng: lng
                        },
                        orderDir: 'ASC'
                    });
                    $scope.pager = new Pager(url, $scope.query, function (item) {
                        var markerExtend = {
                            distance: item.distance,
                            icon: {
                                iconUrl: '/bundles/undfmaps/images/map_pin.png'
                            }
                        };
                        if (angular.isFunction($scope.popup())) {
                            markerExtend.message = $scope.popup()(item[markerEntityName]);
                        }

                        return angular.extend(item[markerEntityName], markerExtend);
                    });

                    //Iteratively request all result pages till every
                    //single marker is on the map.
                    (function loadMarkers() {
                        $scope.pager.nextPage(function () {
                            timeoutId = $timeout(loadMarkers, 100);
                        });
                    })();

                    $scope.markers = $scope.pager.results;
                    if ($rootScope.currentPosition) {
                        $scope.markers.push({
                            lat: $rootScope.currentPosition.lat,
                            lng: $rootScope.currentPosition.lng,
                            icon: {
                                iconUrl: '/bundles/undfmaps/images/map_user.png',
                                iconSize: [25, 25],
                                shadowSize: [5, 5],
                                shadowAnchor: [5, 5]
                            }
                        });
                    }
                }

                if ($rootScope.currentPosition || $rootScope.isGeoLocationInactive) {
                    if ($rootScope.isGeoLocationInactive) {
                        //Reinitiate the center position in Barcelona
                        $scope.center = {
                            lat: 41.385052,
                            lng: 2.173233,
                            zoom: parseInt($attrs.zoom) || 16
                        };
                    }
                    loadMap();
                }

                //Center the map on the current position (if the window navigator
                //is available)
                if (!$rootScope.currentPosition) {
                    leafletData.getMap().then(function (map) {
                        map.on('locationfound',function (e) {
                            $rootScope.isGeoLocationInactive = false;
                            $rootScope.currentPosition = {
                                lat: e.latitude,
                                lng: e.longitude
                            };
                            loadMap();

                        }).on('locationerror', function () {
                            $rootScope.isGeoLocationInactive = true;
                            //By default, center the map in Barcelona
                            $scope.center = {
                                lat: 41.385052,
                                lng: 2.173233,
                                zoom: parseInt($attrs.zoom) || 16
                            };

                            loadMap();
                            alert("No es posible calcular su ubicación.");
                        });
                    });

                    //Emit click events on the markers and attach marker info to the event
                    $scope.$on('leafletDirectiveMarkersClick', function (e, marker_index) {
                        $scope.$emit('onMarkerClick', $scope.markers[marker_index]);
                    });
                }
            }]
        };
    }]);


/**
 * @ngdoc directive
 * @name ngName
 *
 * @priority 100
 *
 * @description
 * The `ng-name` directive allows you the ability to evaluate scope expressions on the name attribute.
 * This directive does not react to the scope expression. It merely evaluates the expression, and sets the
 * {@link ngModel.NgModelController NgModelController}'s `$name` property and the `<input>` element's
 * `name` attribute.
 *
 * <div class="alert alert-info">
 *   This is particularly useful when building forms while looping through data with `ng-repeat`,
 *   allowing you evaluate expressions such as as control names.
 * </div>
 *
 * <div class="alert alert-warning">
 *   This is <strong>NOT</strong> a data binding, in the sense that the attribute is not observed nor is the scope
 *   expression watched. The ngName directive's link function runs after the ngModelController but before ngModel's
 *   link function. This allows the evaluated result to be updated to the $name property prior to the
 *   {@link form.FormController FormController}'s `$addControl` function being called.
 * </div>
 *
 * @element input
 * @param {expression} ngName {@link guide/expression Expression} to evaluate.
 *
 * @example
 <example name="ngName-directive">
 <file name="index.html">
 <div ng-controller="Ctrl">
 <form name="candyForm">
 <h2>Enter the amount of candy you want.</h2>
 <div ng-repeat="c in candy">
 <label for="{{ c.type }}">{{ c.type }}</label>
 <input type="text"
 ng-model="c.qty"
 ng-name="c.type + 'Qty'"
 id="{{ c.type }}"
 ng-pattern="/^([1-9][0-9]*|0)$/"
 required>
 </div>
 </form>
 <br>
 <div ng-repeat="c in candy">
 <div><b>{{ c.type }}</b></div>
 <div>candyForm.{{ c.type + 'Qty' }}.$valid = <b ng-bind="candyForm.{{ c.type + 'Qty' }}.$valid"></b></div>
 <div>Quantity = <b>{{ c.qty }}</b></div>
 <br>
 </div>
 </div>
 </file>
 <file name="script.js">
 function Ctrl($scope) {
        $scope.candy = [
          {
            type: 'chocolates',
            qty: null
          },
          {
            type: 'peppermints',
            qty: null
          },
          {
            type: 'lollipops',
            qty: null
          }
        ];
      }
 </file>
 <file name="protractor.js" type="protractor">
 var chocolatesInput = element(by.id('chocolates'));
 var chocolatesValid = element(by.binding('candyForm.chocolatesQty.$valid'));
 var peppermintsInput = element(by.id('peppermints'));
 var peppermintsValid = element(by.binding('candyForm.peppermintsQty.$valid'));
 var lollipopsInput = element(by.id('lollipops'));
 var lollipopsValid = element(by.binding('candyForm.lollipopsQty.$valid'));

 it('should initialize controls properly', function() {
        expect(chocolatesValid.getText()).toBe('false');
        expect(peppermintsValid.getText()).toBe('false');
        expect(lollipopsValid.getText()).toBe('false');
      });

 it('should be valid when entering n >= 0', function() {
        chocolatesInput.sendKeys('5');
        peppermintsInput.sendKeys('55');
        lollipopsInput.sendKeys('555');

        expect(chocolatesValid.getText()).toBe('true');
        expect(peppermintsValid.getText()).toBe('true');
        expect(lollipopsValid.getText()).toBe('true');
      });
 </file>
 </example>
 */
angular.module('ui.atomic.ng-name', [])
    .directive('ngName', ngNameDirective = function () {
        return {
            priority: 100,
            restrict: 'A',
            require: 'ngModel',
            link: {
                pre: function ngNameLinkFn(scope, elem, attrs, ctrl) {
                    if (!ctrl) throw 'Error , ngName requires ngModel';
                    ctrl.$name = scope.$eval(attrs.ngName);
                    attrs.$set('name', ctrl.$name);
                }
            }
        }
    })
;
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
angular.module('ui.atomic.nl2br', [])
    .filter('nl2br', [function () {
        return function (text, is_xhtml) {
            if (text) {
                var is_xhtml = is_xhtml || true;
                var breakTag = (is_xhtml) ? '<br />' : '<br>';
                var text = (text + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
                return text;
            }
            return '';
        }
    }]
    );
(function (angular) {
    'use strict';
    angular.module('ui.atomic.rating', [ 'ui.bootstrap' ])
        .directive('starRating', [ '$rootScope', function ($rootScope) {
            return {
                restrict: 'A',
                scope: {
                    entity: '=',
                    myUserId: '='
                },
                templateUrl: 'template/rating/star-rating.html',
                controller: ['$scope' , function ($scope) {

                    $scope.onStarClick = function (index) {
                        if (!$scope.readOnly) {
                            $scope.rate = index + 1;
                            $scope.$emit('ratingEvent.STAR_CLICK', $scope.rate);
                        }
                    };
                }],
                link: function (scope, elem, attrs) {
                    var max = parseInt(attrs.max) || 10,
                        showMyVote = (attrs.showMyVote === 'true');

                    var initialize = function () {
                        for (var i = 0; i < max; i++) {
                            scope.starRange[i] = { index: i };
                        }
                    };

                    var getMyScore = function () {
                        if (!scope.myUserId) {
                            throw('myUserId must be defined in if showMyVote is set to true');
                        }
                        var score = 0;
                        // TODO : remove dependency with entity. Get votes directly from the model
                        angular.forEach(scope.entity.rating.votes, function (vote) {
                            if (vote.created_by === parseInt(scope.myUserId)) {
                                score = vote.score;
                            }
                        });

                        return score;
                    };

                    scope.starRange = [];
                    scope.size = attrs.starSize || 'small';
                    scope.rate = 0;
                    scope.readOnly = (attrs.readOnly === 'true');

                    scope.$watch('entity', function (value) {
                        if (value) {
                            scope.rate = (showMyVote) ? getMyScore() : value.rating.score;
                        }
                    });

                    $rootScope.$on('ratingEvent.SUCCESS', function (event, data) {
                        if (scope.entity && scope.entity.rating.id === data.id) {
                            scope.entity.rating = data;
                            scope.rate = data.score;
                        }
                    });

                    initialize();
                }
            };
        }])

        .directive('starRatingPopup', ['$http', '$modal', '$rootScope', function ($http, $modal, $rootScope) {
            return {
                restrict: 'A',
                scope: {
                    entity: '=starRatingEntity',
                    myUserId: '@starRatingPopupMyUserId'
                },
                link: function (scope, elem, attrs) {
                    var popupText = attrs.starRatingPopupText,
                        popupAcceptButtonText = attrs.starRatingPopupAcceptButtonText,
                        popupCancelButtonText = attrs.starRatingPopupCancelButtonText,
                        rate = 0;

                    elem.bind('click', function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        scope.text = popupText;
                        scope.buttons = [
                            {
                                label: popupAcceptButtonText,
                                result: 1,
                                cssClass: 'btn-primary'
                            },
                            {
                                label: popupCancelButtonText,
                                result: 0,
                                cssClass: 'btn-ml-default'
                            }
                        ];

                        var modalInstance = $modal.open({
                            scope: scope,
                            templateUrl: 'template/rating/rating-popup.html'
                        });

                        scope.close = function (result) {
                            modalInstance.close(result);
                        };

                        modalInstance.result.then(function (result) {
                            if (result === 1) {
                                var url = '/api/ratings/' + scope.entity.rating.id + '/votes/' + rate + '/rating';

                                $http.post(url).success(function (data) {
                                    $rootScope.$emit('ratingEvent.SUCCESS', data);
                                });
                            }
                        });
                    });

                    scope.$on('ratingEvent.STAR_CLICK', function (event, data) {
                        rate = data;
                    });
                }
            };
        }])
    ;
})(window.angular);
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
angular.module("ui.atomic.testabit", ['angulartics', 'angulartics', 'ui.bootstrap'])
    .config(['$analyticsProvider', function ($analyticsProvider) {
        var lastVisitedPage = '/';
        $analyticsProvider.registerPageTrack(function (path) {
            lastVisitedPage = path;
            if (window.ga) {
                window.ga('send', 'pageview', path);
            }

            if (window.plugins && window.plugins.gaPlugin) {
                window.plugins.gaPlugin.trackPage(function () {
                }, function () {
                }, path)
            }
        });

        $analyticsProvider.registerEventTrack(function (action, properties) {
            if (window.ga) {
                window.ga('send', 'event', properties.category, action, properties.label, { page: lastVisitedPage });
            }

            if (window.plugins && window.plugins.gaPlugin) {
                var eventTrackSuccess = function () {
                    console.log('successEventTrack');
                };

                var eventTrackError = function () {
                    console.log('errorEventTrack');
                };
                window.plugins.gaPlugin.trackEvent(eventTrackSuccess, eventTrackError, properties.category, action, properties.label, -1);
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
    .directive('testabit', ['testabit', '$log', '$modal', '$translate', function (testabit, $log, $modal, $translate) {

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
                            label: 'testabit.button.no',
                            result: 0,
                            cssClass: 'btn-default'
                        },
                        {
                            label: 'testabit.button.yes',
                            result: 1,
                            cssClass: 'btn-primary'
                        }
                    ];

                    var modalInstance = $modal.open({
                        templateUrl: 'template/testabit/modal.html',
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

                        $translate('testabit.alert.thankyou_message').then(showThankYouAlert, showThankYouAlert);

                        function showThankYouAlert(thankYouMessage) {
                            scope.$emit('alert.show', { type: 'success', msg: thankYouMessage, keep: false });
                        }
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
        $scope.title = model.title;
        $scope.message = model.message;
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

angular.module('ui.atomic.truncate', [])
    .filter('truncate', function () {
        return function (text, length, end) {

            if(!text) {
                return '';
            }
            if (isNaN(length))
                length = 100;

            if (end === undefined)
                end = "...";

            if (text.length <= length || text.length - end.length <= length) {
                return text;
            }
            else {
                return String(text).substring(0, length-end.length) + end;
            }

        };
    });

angular.module('ui.atomic.urlencode', [])
    .filter('urlencode', [ function() {
        return function(input) {
            return encodeURIComponent(input);
        };
    }]);

angular.module('ui.atomic.user-advice', [])
    .directive('userAdvice', ['$http, $document, $rootScope', function ($http, $document, $rootScope) {

        return {
            link: function (scope, element, attrs) {

                var advice_slug = attrs.userAdvice,
                    disableUrl = '/api/advices/' + advice_slug + '/disable',
                    disableAdvice = function () {

                        scope.$apply(function () {
                                $http.get(disableUrl);
                                $document.find('.advice-' + advice_slug).remove();
                                $rootScope.$broadcast('advice.disable', advice_slug);
                            }
                        );
                    }

                element.bind('click', disableAdvice);
            }

        }
    }])
;
angular.module('ui.atomic.whatsapp', [ 'adaptive.detection' ])
    .directive('whatsapp', ['$window', '$detection', '$rootScope', function($window, $detection, $rootScope) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if($detection.isiOS()) {
                    element.bind("click", function() {
                        $window.location = "whatsapp://send?text="+encodeURIComponent(attrs.whatsapp);
                    });
                } else {
                    element.hide();
                }
            }
        }
    }]);
