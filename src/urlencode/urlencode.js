angular.module('filters.makelean.urlencode', [])
    .filter('urlencode', [ function() {
        return function(input) {
            return encodeURIComponent(input);
        };
    }]);
