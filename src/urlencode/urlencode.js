angular.module('ui.atomic.urlencode', [])
    .filter('urlencode', [ function() {
        return function(input) {
            return encodeURIComponent(input);
        };
    }]);
