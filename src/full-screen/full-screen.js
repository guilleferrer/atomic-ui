angular.module('ui.makelean.full-screen', ['ui.bootstrap', 'ui.makelean.viewport'])
    .directive('fullScreen', [ '$modal' , 'viewport', function ($modal, viewport) {

        return {
            scope: {
                images: '=fullScreen'
            },
            link: function (scope, element, attrs) {

                var modalInstance;
                element.on('click', function () {

                    modalInstance = $modal.open({
                        windowClass: 'full-modal full-screen',
                        templateUrl: 'template/dialog/full-width.html',
                        scope: scope
                    });

                    modalInstance.opened.then(function () {
                        viewport.set('maximum-scale', '2');
                    });

                    modalInstance.result.then(function () {
                        viewport.set('maximum-scale', '1');
                    })
                })

                scope.cancel = function () {
                    modalInstance.close();
                }

            }
        }
    }])
    .run([ '$templateCache', function ($templateCache) {
        $templateCache.put('template/dialog/full-width.html', '<div class="modal-header">' +
            '<button class="btn btn-link pull-right" data-ng-click="cancel()"><i class="ml-icon-30"></i></button>' +
            '</div>' +
            '<div class="modal-body testabit">' +
            '<ul rn-carousel class="image">' +
            '<li ng-repeat="image in images">' +
            '<img ng-src="{{image}}"/>'+
            '</li>' +
            '</ul>' +
            '</div>'
        );
    }])
