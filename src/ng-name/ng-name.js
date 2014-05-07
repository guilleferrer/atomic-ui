/**
 * @ngdoc directive
 * @name ngName
 *
 * @priority 100
 *
 * @description
 * The `ng-name` directive allows you the ability to evaluate scope expressions on the name attribute.
 * This directive does not react to the scope expression. It merely evaluates the expression, and sets the
 * {@link ngModel.NgModelController NgModelController}'s `$name` property and the `<input>` element's
 * `name` attribute.
 *
 * <div class="alert alert-info">
 *   This is particularly useful when building forms while looping through data with `ng-repeat`,
 *   allowing you evaluate expressions such as as control names.
 * </div>
 *
 * <div class="alert alert-warning">
 *   This is <strong>NOT</strong> a data binding, in the sense that the attribute is not observed nor is the scope
 *   expression watched. The ngName directive's link function runs after the ngModelController but before ngModel's
 *   link function. This allows the evaluated result to be updated to the $name property prior to the
 *   {@link form.FormController FormController}'s `$addControl` function being called.
 * </div>
 *
 * @element input
 * @param {expression} ngName {@link guide/expression Expression} to evaluate.
 *
 * @example
 <example name="ngName-directive">
 <file name="index.html">
 <div ng-controller="Ctrl">
 <form name="candyForm">
 <h2>Enter the amount of candy you want.</h2>
 <div ng-repeat="c in candy">
 <label for="{{ c.type }}">{{ c.type }}</label>
 <input type="text"
 ng-model="c.qty"
 ng-name="c.type + 'Qty'"
 id="{{ c.type }}"
 ng-pattern="/^([1-9][0-9]*|0)$/"
 required>
 </div>
 </form>
 <br>
 <div ng-repeat="c in candy">
 <div><b>{{ c.type }}</b></div>
 <div>candyForm.{{ c.type + 'Qty' }}.$valid = <b ng-bind="candyForm.{{ c.type + 'Qty' }}.$valid"></b></div>
 <div>Quantity = <b>{{ c.qty }}</b></div>
 <br>
 </div>
 </div>
 </file>
 <file name="script.js">
 function Ctrl($scope) {
        $scope.candy = [
          {
            type: 'chocolates',
            qty: null
          },
          {
            type: 'peppermints',
            qty: null
          },
          {
            type: 'lollipops',
            qty: null
          }
        ];
      }
 </file>
 <file name="protractor.js" type="protractor">
 var chocolatesInput = element(by.id('chocolates'));
 var chocolatesValid = element(by.binding('candyForm.chocolatesQty.$valid'));
 var peppermintsInput = element(by.id('peppermints'));
 var peppermintsValid = element(by.binding('candyForm.peppermintsQty.$valid'));
 var lollipopsInput = element(by.id('lollipops'));
 var lollipopsValid = element(by.binding('candyForm.lollipopsQty.$valid'));

 it('should initialize controls properly', function() {
        expect(chocolatesValid.getText()).toBe('false');
        expect(peppermintsValid.getText()).toBe('false');
        expect(lollipopsValid.getText()).toBe('false');
      });

 it('should be valid when entering n >= 0', function() {
        chocolatesInput.sendKeys('5');
        peppermintsInput.sendKeys('55');
        lollipopsInput.sendKeys('555');

        expect(chocolatesValid.getText()).toBe('true');
        expect(peppermintsValid.getText()).toBe('true');
        expect(lollipopsValid.getText()).toBe('true');
      });
 </file>
 </example>
 */
angular.module('ui.atomic.ng-name', [])
    .directive('ngName', ngNameDirective = function () {
        return {
            priority: 100,
            restrict: 'A',
            require: 'ngModel',
            link: {
                pre: function ngNameLinkFn(scope, elem, attrs, ctrl) {
                    if (!ctrl) throw 'Error , ngName requires ngModel';
                    ctrl.$name = scope.$eval(attrs.ngName);
                    attrs.$set('name', ctrl.$name);
                }
            }
        }
    })
;