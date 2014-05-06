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

