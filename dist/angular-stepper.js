/*! angular-stepper - v1.0.0 - 2017-08-06
* Copyright (c) Julien Bouquillon <julien@revolunet.com> 2017; Licensed  */
angular.module('revolunet.stepper', [])

.directive('rnStepper', function() {
    return {
        restrict: 'AE',
        require: 'ngModel',
        scope: {
            min: '=',
            max: '=',
            ngModel: '=',
            onChange: '&',
            item: '=',
            ngReadonly: "="
        },
        template: '<button type="button" ng-disabled="isOverMin()" ng-click="decrement()">-</button>' +
                  '<input type="text" ng-model="ngModel" ng-readonly="true">' +
                  '<button type="button" ng-disabled="isOverMax()" ng-click="increment()">+</button>',
        link: function(scope, iElement, iAttrs, ngModelController) {

            scope.label = '';

            if (angular.isDefined(iAttrs.label)) {
                iAttrs.$observe('label', function(value) {
                    scope.label = ' ' + value;
                    ngModelController.$render();
                });
            }

            ngModelController.$render = function() {
                // update the validation status
                checkValidity();
            };

            // when model change, cast to integer
            ngModelController.$formatters.push(function(value) {
                return parseInt(value, 10);
            });

            // when view change, cast to integer
            ngModelController.$parsers.push(function(value) {
                return parseInt(value, 10);
            });

            function checkValidity() {
                // check if min/max defined to check validity
                var valid = !(scope.isOverMin(true) || scope.isOverMax(true));
                // set our model validity
                // the outOfBounds is an arbitrary key for the error.
                // will be used to generate the CSS class names for the errors
                ngModelController.$setValidity('outOfBounds', valid);
            }

            function updateModel(offset) {
                // update the model, call $parsers pipeline...
                ngModelController.$setViewValue(ngModelController.$viewValue + offset);
                // update the local view
                ngModelController.$render();
                console.log("Stepper Value Change");
                console.log(scope.onChange);
                // Callback
                scope.onChange({item: scope.item});
            }

            scope.isOverMin = function(strict) {
                if(scope.ngReadonly){
                    return true;
                }
                var offset = strict?0:1;
                return (angular.isDefined(scope.min) && (ngModelController.$viewValue - offset) < parseInt(scope.min, 10));
            };
            scope.isOverMax = function(strict) {
                if(scope.ngReadonly){
                    return true;
                }
                var offset = strict?0:1;
                return (angular.isDefined(scope.max) && (ngModelController.$viewValue + offset) > parseInt(scope.max, 10));
            };


            // update the value when user clicks the buttons
            scope.increment = function() {
                updateModel(+1);
            };
            scope.decrement = function() {
                updateModel(-1);
            };

            // check validity on start, in case we're directly out of bounds
            checkValidity();

            // watch out min/max and recheck validity when they change
            scope.$watch('min+max', function() {
                checkValidity();
            });
            
            scope.onChange({item: scope.item});
        }
    };
});
