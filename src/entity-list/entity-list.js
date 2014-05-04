/**
 * Crud List Component
 */
angular.module('atomic.entity.list', ['ui.router', 'ml.routes.menu', 'ngResource'])
/**
 * State Definition
 */
    .config(['$stateProvider', function ($stateProvider) {

        $stateProvider.state('entity.list', {
            url: '/list',
            templateUrl: "template/crud-list/list.html",
            controller: 'CRUDListCtrl'
        });
    }])
/**
 * Controller
 */
    .controller('CRUDListCtrl', [ '$scope', '$stateParams', function ($scope, $stateParams) {

        $scope.items = [
        /**
         * list item definition
         */
            {
            }
        ];
    }])
/**
 * State interconnections
 */
    .run(function($rootScope){
        $rootScope.$on('listItemEvents.click')
    })
;





