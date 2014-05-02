angular.module('ui.atomic.confirm-url', ['ui.bootstrap'])
/**
 * @description
 *
 * The confirm-url directive shows a confirmation dialog before calling the url given
 *
 * @api:
 *
 *  - confirm-url : {string} The url that is used to call after confirmation
 *  - confirm-title: {string} The title of the confirm modal
 *  - confirm-message: {string} The message of the confirmation modal
 *  - confirm-yes: {string} The text of 'yes' option in the modal
 *  - confirm-no: {string} The text of 'no' option in the modal
 *  - follow-url: {boolean} Should it act as a link and change page ( to the url given in the confirm-delete parameter )
 *
 * @events : $emits {'apiEvent.ACTION_SUCCESS'} when follow-url is set to false ( does not change page )
 */
    .directive('confirmUrl', ['$http', '$window', '$modal', function ($http, $window, $modal) {

        return function (scope, element, attrs) {

            var url = attrs.confirmUrl,
                confirmTitle = attrs.confirmTitle,
                confirmMessage = attrs.confirmMessage,
                confirmYes = attrs.confirmYes,
                confirmNo = attrs.confirmNo,
                method = attrs.confirmMethod || 'delete',
                actionBtnClass = attrs.actionBtnClass || 'btn-ml-danger',
                followUrl = attrs.followUrl == "true";

            element.bind('click', function (event) {

                event.preventDefault();

                scope.title = confirmTitle
                scope.message = confirmMessage
                scope.buttons = [
                    {
                        label: confirmYes,
                        result: 1,
                        cssClass: actionBtnClass
                    },
                    {
                        label: confirmNo,
                        result: 0,
                        cssClass: 'btn-ml-default'
                    }
                ];

                var modalInstance = $modal.open({
                    scope: scope,
                    templateUrl: 'template/dialog/message.html'
                });

                scope.close = function (result) {
                    modalInstance.close(result);
                };

                modalInstance.result.then(function (result) {
                    if (result === 1) {
                        if (followUrl === true) {
                            $window.location = url;
                        } else {
                            $http[method](url).success(function (data) {
                                scope.$emit('apiEvent.ACTION_SUCCESS', data);
                            })
                        }
                    }
                });

                return false;
            });
        }
    }]);