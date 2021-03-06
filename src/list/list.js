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
                scope.loadOnSearchEvent = attrs.$attr.loadOnSearchEvent ? true : false;
                var query = scope.$eval(attrs.apiQuery) || {};

                if(!scope.loadOnSearchEvent){
                    scope.pager = new Pager(attrs.apiUrl, query);
                }

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