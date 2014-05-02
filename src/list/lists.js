angular.module('ui.atomic.lists', ['ui.atomic.pager', 'infinite-scroll', "tpl/list/paged-list.html"])
    .directive('list', [ 'Pager', '$rootScope', function (Pager, $rootScope) {

        return {
            restrict: 'E',
            templateUrl: 'template/list/paged-list.html',
            replace: true,
            transclude: true,
            link: function(scope, element, attrs) {
                scope.listClass = attrs.listClass || 'list-group';
                scope.listCache = attrs.$attr.listNoCache ? false : true;
                var query = scope.$eval(attrs.apiQuery) || {};
                scope.pager = new Pager(attrs.apiUrl, query);

                $rootScope.$on('searchEvent.SEARCH_CHANGE', function(event, value, params){
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

                return tAttrs.itemTplUrl || '/template/list/list-item.html';
            }
        };
    });
