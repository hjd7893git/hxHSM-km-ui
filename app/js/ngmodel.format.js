/******************************************
 *                                        *
 * Auth: green gerong                     *
 * Date: 2012                             *
 * blog: http://greengerong.github.io/    *
 * github: https://github.com/greengerong *
 *                                        *
 ******************************************/

'use strict';

(function(gobal, angular) {
    angular.module('ngmodel.format', [])
        .constant("modelFormatConfig", {
            "currency": {
                "formatter": function(args) {
                    var modelValue = args.$modelValue,
                        filter = args.$filter,
                        attrs = args.$attrs,
                        $eval = args.$eval;

                    var val = filter("currency")(modelValue);
                    return attrs.prefixed && $eval(attrs.prefixed) ? val : val.substr(1);
                },
                "parser": function(args) {
                    var viewValue = args.$viewValue;
                    var num = viewValue.replace(/[^0-9.]/g, '');
                    var result = parseFloat(num, 10);
                    return isNaN(result) ? undefined : parseFloat(result.toFixed(2));
                },
                "isEmpty": function(value) {
                    return !value.$modelValue;
                },
                "keyDown": function(args) {
                    var event = args.$event,
                        viewValue = args.$viewValue,
                        modelValue = args.$modelValue;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event) || gobal.keyHelper.functionKeyBoard(event) || gobal.keyHelper.currencyKeyBoard(event, viewValue) || gobal.keyHelper.floatKeyBoard(event, viewValue))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "digit": {
                "formatter": function(args) {
                    return args.$modelValue;
                },
                "parser": function(args) {
                    return args.$viewValue ? args.$viewValue.replace(/[^0-9]/g, '') : undefined;
                },
                "isEmpty": function(value) {
                    return !value.$modelValue;
                },
                "keyDown": function(args) {
                    var event = args.$event;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event) || gobal.keyHelper.functionKeyBoard(event))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "int": {
                "formatter": function(args) {
                    var modelValue = args.$modelValue,
                        filter = args.$filter;
                    return filter("number")(modelValue);
                },
                "parser": function(args) {
                    var val = parseInt(args.$viewValue.replace(/[^0-9]/g, ''), 10);
                    return isNaN(val) ? undefined : val;
                },
                "isEmpty": function(value) {
                    return !value.$modelValue;
                },
                "keyDown": function(args) {
                    var event = args.$event;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event) || gobal.keyHelper.functionKeyBoard(event))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                }
            },
            "float": {
                "formatter": function(args) {
                    var modelValue = args.$modelValue,
                        filter = args.$filter;
                    return filter("number")(modelValue);
                },
                "parser": function(args) {
                    var val = parseFloat(args.$viewValue.replace(/[^0-9.]/g, '')),
                        ENOB = 3,
                        tempNum = Math.pow(10, ENOB);
                    return isNaN(val) ? undefined : Math.round(val * tempNum) / tempNum;
                },
                "isEmpty": function(value) {
                    return !value.$modelValue;
                },
                "keyDown": function(args) {
                    var event = args.$event,
                        viewValue = args.$viewValue;

                    if (!(gobal.keyHelper.smallKeyBoard(event) || gobal.keyHelper.numberKeyBpoard(event) || gobal.keyHelper.functionKeyBoard(event) || gobal.keyHelper.floatKeyBoard(event, viewValue))) {
                        event.stopPropagation();
                        event.preventDefault();
                    }

                }
            },
            "boolean": {
                "formatter": function(args) {
                    var modelValue = args.$modelValue;
                    if (!angular.isUndefined(modelValue)) {
                        return modelValue.toString();
                    }
                },
                "parser": function(args) {
                    var viewValue = args.$viewValue;
                    if (!angular.isUndefined(viewValue)) {
                        return viewValue.trim() === "true";
                    }
                },
                "isEmpty": function(value) {
                    return angular.isUndefined(value);
                }
            },
            "date": {
                "formatter": function(args) {
                    var x = args.$modelValue;
                    if (angular.isDefined(x)) {
                        var y = parseInt(x.substr(0, 4));
                        var m = parseInt(x.substr(4, 2)) - 1;
                        var d = parseInt(x.substr(6));
                        return new Date(y, m, d);
                    }
                },
                "parser": function(args) {
                    var x = args.$viewValue;
                    if (angular.isDefined(x)) {
                        return args.$filter("date")(x, 'yyyyMMdd');
                    }
                },
                "isEmpty": function(value) {
                    return angular.isUndefined(value);
                }
            },
            "datetime-local": {
                "formatter": function(args) {
                    var x = args.$modelValue;
                    if (angular.isDefined(x)) {
                        var y = parseInt(x.substr(0, 4));
                        var m = parseInt(x.substr(4, 2)) - 1;
                        var d = parseInt(x.substr(6, 2));
                        var h = parseInt(x.substr(8, 2));
                        var M = parseInt(x.substr(10, 2));
                        var s = parseInt(x.substr(12));
                        return new Date(y, m, d, h, M, s);
                    }
                },
                "parser": function(args) {
                    var x = args.$viewValue;
                    if (angular.isDefined(x)) {
                        return args.$filter("date")(x, 'yyyyMMddHHmmss');
                    }
                },
                "isEmpty": function(value) {
                    return angular.isUndefined(value);
                }
            },
            "text": {
                "formatter": function(args) {
                    return args.$modelValue;
                },
                "parser": function(args) {
                    return args.$viewValue;
                },
                "isEmpty": function(value) {
                    return angular.isUndefined(value);
                }
            }
        })
        .directive("modelFormat", ["modelFormatConfig", "$filter", "$parse", "$log",
            function(modelFormatConfig, $filter, $parse, $log) {
                return {
                    require: 'ngModel',
                    link: function(scope, element, attrs, ctrl) {
                        var config = modelFormatConfig[attrs.modelFormat] || {};


                        var parseFuction = function(funKey) {
                            if (attrs[funKey]) {
                                var func = $parse(attrs[funKey]);
                                return (function(args) {
                                    return func(scope, args);
                                });
                            }
                            return config[funKey];
                        };

                        var formatter = parseFuction("formatter");
                        var parser = parseFuction("parser");
                        var isEmpty = parseFuction("isEmpty");
                        var keyDown = parseFuction("keyDown");
                        var getModelValue = function() {
                            return $parse(attrs.ngModel)(scope);
                        };

                        if (keyDown) {
                            element.bind("blur", function() {
                                element.val(formatter({
                                    "$modelValue": getModelValue(),
                                    "$filter": $filter,
                                    "$attrs": attrs,
                                    "$eval": scope.$eval
                                }));
                            }).bind("keydown", function(event) {
                                keyDown({
                                    "$event": event,
                                    "$viewValue": element.val(),
                                    "$modelValue": getModelValue(),
                                    "$attrs": attrs,
                                    "$eval": scope.$eval,
                                    "$ngModelCtrl": ctrl
                                });
                            });
                        }


                        ctrl.$parsers.push(function(viewValue) {
                            return parser({
                                "$viewValue": viewValue,
                                "$filter": $filter,
                                "$log": $log,
                                "$attrs": attrs,
                                "$eval": scope.$eval
                            });
                        });

                        ctrl.$formatters.push(function(value) {
                            return formatter({
                                "$modelValue": value,
                                "$filter": $filter,
                                "$log": $log,
                                "$attrs": attrs,
                                "$eval": scope.$eval
                            });
                        });

                        ctrl.$isEmpty = function(value) {
                            return isEmpty({
                                "$modelValue": value,
                                "$attrs": attrs,
                                "$eval": scope.$eval
                            });
                        };
                    }
                };
            }
        ])
        .directive("checkBoxToArray", [

            function() {
                return {
                    restrict: "A",
                    require: "ngModel",
                    link: function(scope, element, attrs, ctrl) {
                        var value = scope.$eval(attrs.checkBoxToArray);
                        ctrl.$parsers.push(function(viewValue) {
                            var modelValue = ctrl.$modelValue ? angular.copy(ctrl.$modelValue) : [];
                            if (viewValue === true && modelValue.indexOf(value) === -1) {
                                modelValue.push(value);
                            }

                            if (viewValue !== true && modelValue.indexOf(value) != -1) {
                                modelValue.splice(modelValue.indexOf(value), 1);
                            }

                            return modelValue.sort();
                        });

                        ctrl.$formatters.push(function(modelValue) {
                            return modelValue && modelValue.indexOf(value) != -1;
                        });

                        ctrl.$isEmpty = function($modelValue) {
                            return !$modelValue || $modelValue.length === 0;
                        };
                    }
                }
            }
        ]);


    var smallKeyBoard = function(event) {
        var which = event.which;
        return (which >= 96 && which <= 105);
    };

    var numberKeyBpoard = function(event) {
        var which = event.which;
        return (which >= 48 && which <= 57) && !event.shiftKey;
    };

    var functionKeyBoard = function(event) {
        var which = event.which;
        return (which <= 40) || (navigator.platform.indexOf("Mac") > -1 && event.metaKey) || (navigator.platform.indexOf("Win") > -1 && event.ctrlKey);
    };

    var currencyKeyBoard = function(event, viewValue) {
        var which = event.which;
        return (viewValue.toString().indexOf('$') === -1 && which === 52 && event.shiftKey);
    };

    var floatKeyBoard = function(event, viewValue) {
        var which = event.which;
        return [188].indexOf(which) != -1 || (which === 190 || which === 110) && viewValue.toString().indexOf('.') === -1;
    }

    gobal.keyHelper = {
        smallKeyBoard: smallKeyBoard,
        numberKeyBpoard: numberKeyBpoard,
        functionKeyBoard: functionKeyBoard,
        currencyKeyBoard: currencyKeyBoard,
        floatKeyBoard: floatKeyBoard
    };

})(this, angular);
