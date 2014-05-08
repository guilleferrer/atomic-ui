/*
 * atomic.ui
 * Version: 0.0.1 - 2014-05-08
 * License: EULA
 * Author: Guillermo Ferrer <guilleferrer@gmail.com>
 */
angular.module("ui.atomic", [ "pascalprecht.translate", "ui.atomic.tpls", "ui.atomic.alerts","ui.atomic.back","ui.atomic.compile","ui.atomic.confirm","ui.atomic.fbinvite","ui.atomic.filter","ui.atomic.viewport","ui.atomic.full-screen","ui.atomic.infinite-scroll","ui.atomic.pager","ui.atomic.list","ui.atomic.mailto","ui.atomic.ng-name","ui.atomic.multiple-choice","ui.atomic.nl2br","ui.atomic.search-box","ui.atomic.testabit","ui.atomic.tools","ui.atomic.truncate","ui.atomic.urlencode","ui.atomic.user-advice","ui.atomic.whatsapp"]);
angular.module("ui.atomic.tpls", ["template/confirm/confirm.html","template/filter/button.html","template/filter/modal.html","template/full-screen/full-screen.html","template/list/list-item.html","template/list/paged-list.html","template/multiple-choice/multiple-choice-modal.html","template/multiple-choice/multiple-choice-picker.html","template/search-box/search-box.html","template/testabit/modal.html"]);
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

                        function showThankYouAlert(thankYouMessage){
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

angular.module("template/filter/button.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/filter/button.html",
    "<a class=\"btn btn-icon\" data-ng-click=\"showFilter()\">\n" +
    "    <i class=\"ml-icon-65\"></i>\n" +
    "    Show filter\n" +
    "</a>");
}]);

angular.module("template/filter/modal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/filter/modal.html",
    "<div class=\"modal-header\">\n" +
    "    {{ title }}\n" +
    "    <button class=\"btn btn-link pull-right\" data-ng-click=\"$modal.dismiss()\"><i class=\"ml-icon-30\"></i></button>\n" +
    "</div>\n" +
    "<div class=\"modal-body\" ng-include=\"formUrl\"></div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <ul class=\"buttons-holder btn-btn\">\n" +
    "        <li>\n" +
    "            <button type=\"button\" data-ng-click=\"resetFilter()\" class=\"btn btn-block\">\n" +
    "                {{ resetLabel }}\n" +
    "            </button>\n" +
    "        </li>\n" +
    "        <li>\n" +
    "            <button type=\"button\" data-ng-click=\"applyFilter()\" class=\"btn btn-block btn-primary\">\n" +
    "                {{ applyLabel }}\n" +
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

angular.module("template/multiple-choice/multiple-choice-modal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/multiple-choice/multiple-choice-modal.html",
    "<div class=\"modal-header\">\n" +
    "    {{ modalHeader }}\n" +
    "    <button class=\"btn btn-link pull-right\" data-ng-click=\"$modal.dismiss('cancel')\"><i class=\"ml-icon-30\"></i></button>\n" +
    "</div>\n" +
    "<div class=\"modal-body\">\n" +
    "    <div class=\"list-group decorated w-check\">\n" +
    "        <a class=\"list-group-item\" ng-repeat=\"choice in choices\"\n" +
    "           ng-click=\"selectToggle(choice)\" ng-class=\"{ true: 'active' }[choice.selected]\">\n" +
    "            <p class=\"list-group-item-text\" ng-bind=\"choice.name\"></p>\n" +
    "        </a>\n" +
    "    </div>\n" +
    "</div>\n" +
    "<div class=\"modal-footer\">\n" +
    "    <ul class=\"buttons-holder\">\n" +
    "        <li>\n" +
    "            <button class=\"btn btn-block btn-primary\" ng-click=\"$modal.close()\">\n" +
    "                {{ modalFooter }}\n" +
    "            </button>\n" +
    "        </li>\n" +
    "    </ul>\n" +
    "</div>");
}]);

angular.module("template/multiple-choice/multiple-choice-picker.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/multiple-choice/multiple-choice-picker.html",
    "<div>\n" +
    "    <div ng-transclude=\"\"></div>\n" +
    "    <select multiple class=\"hidden\" ng-model=\"ngModel\"\n" +
    "            ng-options=\"c.name for c in choices\">\n" +
    "    </select>\n" +
    "</div>");
}]);

angular.module("template/search-box/search-box.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/search-box/search-box.html",
    "<div class=\"form-group search-type-w-icon\">\n" +
    "    <i class=\"ml-icon-52\"></i>\n" +
    "    <input type=\"search\" class=\"form-control\"\n" +
    "           placeholder=\"{{ placeholder }}\"\n" +
    "           data-ng-model=\"search\"/>\n" +
    "    <a href=\"\" ng-click=\"erase()\" class=\"clear-form\">\n" +
    "        <i class=\"ml-icon-33\"></i>\n" +
    "    </a>\n" +
    "</div>");
}]);

angular.module("template/testabit/modal.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/testabit/modal.html",
    "<div class=\"modal-body testabit\">\n" +
    "    <i class=\"ml-icon-54\"></i>\n" +
    "    <h4>{{ title }}</h4>\n" +
    "    <p>{{ message }}</p>\n" +
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
