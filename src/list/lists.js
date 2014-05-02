angular.module('ui.makelean.lists', ['ui.makelean.pager', 'infinite-scroll', "tpl/list/paged-list.html"])
    .directive('list', [ 'Pager', '$rootScope', function (Pager, $rootScope) {

        return {
            restrict: 'E',
            templateUrl: 'tpl/list/paged-list.html',
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

                return tAttrs.itemTplUrl || '/tpl/list/list-item.html';
            }
        };
    });

angular.module("tpl/list/paged-list.html", []).run(["$templateCache", function ($templateCache) {

    $templateCache.put("tpl/list/paged-list.html",
        "<div class='paged-list-container'>" +
            "<ul data-ng-class=\"listClass\" data-infinite-scroll=\"pager.nextPage(angular.noop, listCache)\" data-infinite-scroll-distance=\"1\" data-ng-transclude></ul>" +
            "<span id=\"spinner-mini\" data-us-spinner=\"{lines: 13, length: 0, width: 5, radius: 14, corners: 1, rotate: 0, direction: 1, color: '#000', speed: 1.7, trail: 100, shadow: false, hwaccel: false, className: 'spinner', zIndex: 2e9, top: 'auto', left: 'auto' }\"></span>" +
        "</div>"
    );
}]);
