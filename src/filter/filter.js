angular.module('ui.atomic.filter', ['ui.atomic.tools'])
/**
 * @description
 * The filterHelper creates an interface between the filter and the urls query
 *
 * @api :
 *   - searchToQuery :
 *          reads the 'q' from the url and returns a query {object}
 *          @return {object}
 *   - formToSearch :
 *          transforms a form {object} into a key-value url-encoded 'string'
 *          @return string
 */
    .factory('filterHelper', ['urlTools', '$stateParams', function (urlTools, $stateParams) {

        function searchToQuery() {
            return urlTools.parseKeyValue($stateParams.q);
        }

        function formToSearch(form) {
            var search = {};
            if (Object.keys(form).length > 0) {
                search['q'] = urlTools.toKeyValue(form, null);
            }

            return search;
        }

        return {
            'searchToQuery': searchToQuery,
            'formToSearch': formToSearch
        };
    }])
/**
 * @description
 * The mlFilter directive is an attribute directive that is applied to a form and creates a filter form that creates
 * a unique query url ( e.g. /api/resource?q=automatically-created-query ) that can be used to filter api results in a certain api call.
 * The parameter "q" is created as the key of the query value and cannot be changed ( yet ).
 * Also, it creates a "filter" model in the current scope, that can be accessed in the template.
 *  {boolean} $scope.filter.show ( if it should show / hide the filter's form )
 *  {boolean} $scope.filter.active ( if filter is applying right now )
 *
 * @api:
 *
 *  - mlFilter : is the query's model name in the current scope that can be already initialized to a certain value
 *  - name : is the form name
 *  - applyFilter() : used to submit the filter's form
 *  - resetFilter() : used to reset the filter
 *
 *
 * Usage example:
 *
 *         <form data-ml-filter="query" name="myform" data-ng-submit="applyFilter()" >
 *
 *             <input type="text" name="myform[foo]"  value="fooValue" >
 *             <input type="text" name="myform[bar]"  value="barValue" >
 *             <a href="" data-ng-click="resetFilter()" > Reset filter </a>
 *         </form>
 *
 *
 * @depends $stateParams, $state, $location, filterHelper
 */
    .directive('mlFilter', ['$state', '$stateParams', '$location', 'filterHelper', function ($state, $stateParams, $location, filterHelper) {

        return {

            link: function ($scope, element, attrs) {

                var queryName = attrs.mlFilter;
                var formName = attrs.name;

                $scope.filter = {
                    show: false,
                    active: false
                };

                $scope[formName] = {}; // Clears the form
                $scope[queryName] = filterHelper.searchToQuery();

                // Populate Form's model from query
                $scope[formName] = $scope[queryName];
                if (Object.keys($scope[formName]).length > 0) {
                    $scope.filter.active = true;
                }

                $scope.applyFilter = function () {
                    // If the form has not been altered... do nothing.
                    if ($scope[formName].$dirty === false) {
                        return;
                    }

                    var search = filterHelper.formToSearch($scope[formName]);
                    $location.search(search);
                    $scope.filter.show = false;
                    $scope.filter.active = true;

                    $scope.$emit('filterEvent.FILTER_CHANGE', search);
                };

                $scope.resetFilter = function () {
                    // Reset
                    $stateParams.q = null;
                    $state.go($state.current, $stateParams, {reload: false});
                    $scope[formName] = {}; // Clears the form
                    $scope[queryName] = '';
                    $scope.filter.show = false;
                    $scope.filter.active = false;
                };
            }
        }
    }]);
