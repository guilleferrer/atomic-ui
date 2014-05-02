(function (angular) {
    'use strict';

    angular.module('angulartics.ga', ['angulartics'])
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

        }]);

})(angular);
