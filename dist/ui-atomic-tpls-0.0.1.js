/*
 * atomic.ui
 * Version: 0.0.1 - 2014-05-06
 * License: ISC
 */
angular.module("ui.atomic", [ "ui.atomic.tpls", "pascalprecht.translate", "ui.atomic.alerts","ui.atomic.back","ui.atomic.compile","ui.atomic.confirm","ui.atomic.fbinvite","ui.atomic.tools","ui.atomic.filter","ui.atomic.viewport","ui.atomic.full-screen","ui.atomic.infinite-scroll","ui.atomic.pager","ui.atomic.list","ui.atomic.mailto","ui.atomic.nl2br","ui.atomic.search","ui.atomic.testabit","ui.atomic.truncate","ui.atomic.urlencode","ui.atomic.user-advice","ui.atomic.whatsapp"]);
angular.module("ui.atomic.tpls", ["template/confirm/confirm.html","template/full-screen/full-screen.html","template/list/list-item.html","template/list/paged-list.html","template/testabit/modal.html"]);
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

angular.module('ui.atomic.filter', ['ui.atomic.tools'])
/**
 * @description
 * The filterHelper creates an interface between the filter and the urls query
 *
 * @api :
 *   - searchToQuery :
 *          reads the 'q' from the url and returns a query {object}
 *          @return {object}
 *   - formToSearch :
 *          transforms a form {object} into a key-value url-encoded 'string'
 *          @return string
 */
    .factory('filterHelper', ['urlTools', '$stateParams', function (urlTools, $stateParams) {

        function searchToQuery() {
            return urlTools.parseKeyValue($stateParams.q);
        }

        function formToSearch(form) {
            var search = {};
            if (Object.keys(form).length > 0) {
                search['q'] = urlTools.toKeyValue(form, null);
            }

            return search;
        }

        return {
            'searchToQuery': searchToQuery,
            'formToSearch': formToSearch
        };
    }])
/**
 * @description
 * The mlFilter directive is an attribute directive that is applied to a form and creates a filter form that creates
 * a unique query url ( e.g. /api/resource?q=automatically-created-query ) that can be used to filter api results in a certain api call.
 * The parameter "q" is created as the key of the query value and cannot be changed ( yet ).
 * Also, it creates a "filter" model in the current scope, that can be accessed in the template.
 *  {boolean} $scope.filter.show ( if it should show / hide the filter's form )
 *  {boolean} $scope.filter.active ( if filter is applying right now )
 *
 * @api:
 *
 *  - mlFilter : is the query's model name in the current scope that can be already initialized to a certain value
 *  - name : is the form name
 *  - applyFilter() : used to submit the filter's form
 *  - resetFilter() : used to reset the filter
 *
 *
 * Usage example:
 *
 *         <form data-ml-filter="query" name="myform" data-ng-submit="applyFilter()" >
 *
 *             <input type="text" name="myform[foo]"  value="fooValue" >
 *             <input type="text" name="myform[bar]"  value="barValue" >
 *             <a href="" data-ng-click="resetFilter()" > Reset filter </a>
 *         </form>
 *
 *
 * @depends $stateParams, $state, $location, filterHelper
 */
    .directive('mlFilter', ['$state', '$stateParams', '$location', 'filterHelper', function ($state, $stateParams, $location, filterHelper) {

        return {

            link: function ($scope, element, attrs) {

                var queryName = attrs.mlFilter;
                var formName = attrs.name;

                $scope.filter = {
                    show: false,
                    active: false
                };

                $scope[formName] = {}; // Clears the form
                $scope[queryName] = filterHelper.searchToQuery();

                // Populate Form's model from query
                $scope[formName] = $scope[queryName];
                if (Object.keys($scope[formName]).length > 0) {
                    $scope.filter.active = true;
                }

                $scope.applyFilter = function () {
                    // If the form has not been altered... do nothing.
                    if ($scope[formName].$dirty === false) {
                        return;
                    }

                    var search = filterHelper.formToSearch($scope[formName]);
                    $location.search(search);
                    $scope.filter.show = false;
                    $scope.filter.active = true;

                    $scope.$emit('filterEvent.FILTER_CHANGE', search);
                };

                $scope.resetFilter = function () {
                    // Reset
                    $stateParams.q = null;
                    $state.go($state.current, $stateParams, {reload: false});
                    $scope[formName] = {}; // Clears the form
                    $scope[queryName] = '';
                    $scope.filter.show = false;
                    $scope.filter.active = false;
                };
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
                            label: 'testabit.button.no',
                            result: 0,
                            cssClass: 'btn-ml-default'
                        },
                        {
                            label: 'testabit.button.yes',
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

angular.module("template/confirm/confirm.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/confirm/confirm.html",
    "<div class=\"modal-body\">\n" +
    "    <h4 class=\"margin-add-bottom-10\">{{ title }}</h4>\n" +
    "\n" +
    "    <p class=\"medium-paragraph\">{{ message }}</p>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <ul class=\"buttons-list padding-add-x-20 padding-add-bottom-20 margin-rm-all\">\n" +
    "        <li ng-repeat=\"btn in buttons\">\n" +
    "            <button\n" +
    "                    ng-click=\"close(btn.result)\"\n" +
    "                    class=\"btn btn-block\"\n" +
    "                    ng-class=\"btn.cssClass\">\n" +
    "                {{ btn.label }}\n" +
    "            </button>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("template/full-screen/full-screen.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/full-screen/full-screen.html",
    "<button class=\"btn btn-link pull-right\" data-ng-click=\"cancel()\"><i class=\"ml-icon-30\"></i></button>\n" +
    "<div class=\"modal-body testabit\">\n" +
    "    <ul data-rn-carousel data-rn-carousel-control class=\"image\">\n" +
    "        <li ng-repeat=\"image in images\">\n" +
    "            <img ng-src=\"{{ image.url }}\"/>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("template/list/list-item.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/list/list-item.html",
    "<li class=\"media padding-add-all-10 border-add-bottom\">\n" +
    "    <a class=\"media-item-link clickable\" data-on-click=\"mediaItemClick()\">\n" +
    "        <img class=\"media-object masked pull-left\" data-ng-src=\"{{ item.imageUrl }}\">\n" +
    "        <div class=\"media-body\">\n" +
    "            <h4 class=\"media-heading\">{{ item.title }}</h4>\n" +
    "            <p>{{ item.description }}</p>\n" +
    "            <span class=\"media-badge \">{{ item.badge }}</span>\n" +
    "        </div>\n" +
    "    </a>\n" +
    "\n" +
    "</li>");
}]);

angular.module("template/list/paged-list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/list/paged-list.html",
    "<div class=\"paged-list-container\">\n" +
    "    <ul data-ng-class=\"listClass\" data-infinite-scroll=\"pager.nextPage(angular.noop, listCache)\" data-infinite-scroll-distance=\"1\" data-ng-transclude>\n" +
    "        <list-item data-ng-repeat=\"result in pager.results\"></list-item>\n" +
    "    </ul>\n" +
    "\n" +
    "    <span id=\"spinner-mini\" data-us-spinner=\"{lines: 13, length: 0, width: 5, radius: 14, corners: 1, rotate: 0,\n" +
    "    direction: 1, color: '#000', speed: 1.7, trail: 100, shadow: false, hwaccel: false, className: 'spinner', zIndex:\n" +
    "    2e9, top: 'auto', left: 'auto' }\"></span>\n" +
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
