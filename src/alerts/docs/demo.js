function AlertsDemoCtrl($scope) {

    $scope.showAlert = function(){
        $scope.$emit('alert.show', { type: 'danger', msg: 'validationMessage', keep: false })
    }
}