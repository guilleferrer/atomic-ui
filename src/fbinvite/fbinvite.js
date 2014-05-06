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

