angular.module("template/entity-list/list.html", []).run(["$templateCache", function($templateCache) {
  $templateCache.put("template/entity-list/list.html",
    "<header >{{ 'Entity List' }}</header>\n" +
    "<list>\n" +
    "    <list-item data-ng-repeat=\"item in items\"></list-item>\n" +
    "</list>\n" +
    "<footer></footer>");
}]);
