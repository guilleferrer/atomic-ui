angular.module('ui.makelean.alerts', [])
    .run([ '$rootScope', 'validationMessage', '$timeout', function ($rootScope, validationMessage, $timeout) {

        // Global alerts Initialization
        $rootScope.alerts = [];

        $rootScope.closeAlert = function (index) {
            $rootScope.alerts.splice(index, 1);
        };

        var addAlert = function(alert){
            $rootScope.alerts.push(alert);

            // Remove the alert after 3,5 seconds
            $timeout(function () {
                $rootScope.alerts.pop();
            }, 3500);
        };

        $rootScope.$on('submit.error', function (event, form) {
            var message = validationMessage || 'Oh snap! Change a few things up and try submitting again.';
            addAlert({ type: 'danger', msg: message, keep: false });
        });

        // When you want to emit an aler, include the following alert object:
        /* 
         * { 
         *    type : 'danger', // info, warning, success
         *    msg: 'My message for the alert'
         *  }
         *
         *
         * */
        $rootScope.$on('alert.show', function(event, alert){
            addAlert(alert);
        });

        $rootScope.$on("$stateChangeSuccess", function () {
            for(var i = $rootScope.alerts.length -1; i >= 0 ; i--){
                if(!$rootScope.alerts[i].keep){
                    $rootScope.closeAlert(i);
                }
            }
        });
    }])
