function AlertsDemoCtrl($scope) {

    $scope.showAlert = function(){
        $scope.$emit('alert.show', { type: 'danger', msg: 'This is a danger alert for demo purposes', keep: false })
    }
}