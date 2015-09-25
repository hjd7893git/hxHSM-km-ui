/**
 * 过滤器,用于格式化或转换。
 * Created by Ben on 15/8/29.
 */
'use strict';

// filter也依赖于ngRoute
angular.module('myApp.filters', ['ngRoute'])

    .filter('iif', function () {
        return function (cond, vIf, vElse, vUndef) {
            return angular.isUndefined(cond) ? vUndef : (cond ? vIf : vElse);
        };
    })

    .filter('ifdef', ['$log', function ($log) {
        return function (cond, vDef, vUndef) {
            var ret = angular.isUndefined(cond) ? vUndef : vDef;
            return ret;
        };
    }])

    .filter('biDate', function () {
        return function (x) {
            return x.substr(0, 4) + '-' + x.substr(4, 2) + '-' + x.substr(6);
        };
    })

    .filter('biTime', function () {
        return function (x) {
            return x.substr(0, 2) + ':' + x.substr(2, 2) + ':' + x.substr(4);
        };
    })

    .filter('treeStringify', ['$log', '$rootScope', function ($log, $rootScope) {
        var stringify = function (tree, chosens, tab) {
            var out = "";
            angular.element.each(tree, function (n, ele) {
                angular.element.each(chosens, function (n1, ele1) {
                    if (ele.id == ele1.menuId) {
                        out = out + tab + "▶ " + ele.name + "\n";
                        return false;
                    }
                });
                out = out + stringify(ele.items, chosens, tab + "    ");
            });
            return out;
        };
        return function (chosens, tree) {
            var out = "";
            if (angular.isDefined(chosens) && angular.isDefined($rootScope.menuTree))
                out = stringify($rootScope.menuTree, chosens, "");
            return out;
        };
    }])

    .filter('theOption', ['myOptions', function (myOptions) {
        return function (o) {
            return myOptions.findOption(o);
        };
    }])

    .filter('tableList', ['myOptions', function (myOptions) {
        return function (o) {
            return myOptions.getTableNames();
        };
    }])

    .filter('optionName', ['myOptions', 'optionNameOfFilter', function (myOptions, optionNameOfFilter) {
        return function (v, o) {
            var names = (angular.isString(o)) ? myOptions.findOption(o) : o;
            return angular.isDefined(names) ? optionNameOfFilter(v, names) : '';
        };
    }])

    .filter('tableRowInfo', ['myOptions', function (myOptions) {
        return function (v, rec) {
            var name;
            angular.element.each(myOptions.getTableControllers(), function (nx, elex) {
                if (elex.tableId == v) {
                    var key = angular.isDefined(elex.keyInfo) ? (angular.isString(elex.keyInfo) ? rec[elex.keyInfo] : elex.keyInfo(rec)) : rec['id'];
                    name = elex.title + '：' + key;
                    return false;
                }
            });
            return (angular.isDefined(name)) ? name : '' + v;
        };
    }])

    .filter('optionNameOf', function () {
        return function (v, names) {
            var name;
            angular.element.each(names, function (nx, elex) {
                if (elex.value == v) {
                    name = elex.name;
                    return false;
                }
            });
            return (angular.isDefined(name)) ? name : '' + v;
        };
    });