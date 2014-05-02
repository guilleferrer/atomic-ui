angular.module('ui.atomic.whatsapp', [ 'adaptive.detection' ])
    .directive('whatsapp', ['$window', '$detection', '$rootScope', function($window, $detection, $rootScope) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                if($detection.isiOS()) {
                    element.bind("click", function() {
                        $window.location = "whatsapp://send?text="+encodeURIComponent(attrs.whatsapp);
                    });
                } else {
                    element.hide();
                }
            }
        }
    }])
;
