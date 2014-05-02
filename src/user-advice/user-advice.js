angular.module('ui.makelean.user_advice', ['ui.router'])
    .directive('userAdvice', ['$http, $document, $rootScope', function($http, $document, $rootScope) {

        return {
            link: function(scope, element, attrs) {

                var advice_slug = attrs.userAdvice,
                    disableUrl = '/api/advices/' + advice_slug + '/disable',
                    disableAdvice = function() {

                        scope.$apply(function() {
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