angular.module('ui.makelean.mail', [ ])
    .directive('mailto', function() {
        return {
            restrict: 'A',
            scope: {
                mailto:'='
            },
            link: function(scope, element, attrs) {
                var mailto = attrs.mailto,
                    mailtoSubject = attrs.mailtoSubject,
                    mailtoContent = attrs.mailtoContent;

                element.bind("click", function() {
                    window.location = "mailto:"+mailto+"?subject="+mailtoSubject+"&body="+encodeURIComponent(mailtoContent);
                });

                scope.$watch('mailto', function(value){
                    if(value) {
                        mailto = value;
                    }
                })
            }
        }
    })
;