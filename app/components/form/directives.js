/**
 * 杂项组件。
 * Created by Ben on 15/3/31.
 */
'use strict';

angular.module('myApp.components.form', [])

    .directive('biEditItem', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biEditItemTemplate.html',
            replace : true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemTip: '=itemTip',
                itemValue: '=itemValue',
                itemOldValue: '=itemOldValue',
                itemDataType: '=itemDataType',
                itemLocked: '=itemLocked',
                itemName: '=itemName',
                itemRequired: '=itemRequired',
                itemMinLength: '=itemMinLength',
                itemMaxLength: '=itemMaxLength',
                itemRegExpr: '=itemRegExpr'
            },
            controller: 'biFormItemCtrl'
        };
    })
    .directive('biDateItem', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biDateItemTemplate.html',
            replace : true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemValue: '=itemValue',
                itemOldValue: '=itemOldValue',
                itemDataType: '=itemDataType',
                itemLocked: '=itemLocked',
                itemName: '=itemName',
                itemRequired: '=itemRequired',
                itemMinLength: '=itemMinLength',
                itemMaxLength: '=itemMaxLength',
                itemRegExpr: '=itemRegExpr'
            },
            controller: 'biFormItemCtrl'
        };
    })
    .directive('biSelectItem', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biSelectItemTemplate.html',
            replace : true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemLocked: '=itemLocked',
                itemValue: '=itemValue',
                itemOldValue: '=itemOldValue',
                itemDataType: '=itemDataType',
                itemOptions: '=itemOptions',
                isOptionField: '=isOptionField',
                itemName: '=itemName',
                itemRequired: '=itemRequired'
            },
            controller: 'biFormItemCtrl'
        };
    })
    .directive('biAreaItem', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biAreaItemTemplate.html',
            replace : true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemLocked: '=itemLocked',
                itemValue: '=itemValue',
                itemOldValue: '=itemOldValue',
                itemEq: '=itemEq',
                itemSetting: '=itemSetting'
            },
            controller: 'biFormItemCtrl'
        };
    })
    .directive('biTextItem', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biTextItemTemplate.html',
            replace : true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemTip: '=itemTip',
                itemLocked: '=itemLocked',
                itemValue: '=itemValue',
                itemOldValue: '=itemOldValue',
                itemName: '=itemName',
                itemRequired: '=itemRequired',
                itemMinLength: '=itemMinLength',
                itemMaxLength: '=itemMaxLength',
                itemRegExpr: '=itemRegExpr'
            },
            controller: 'biFormItemCtrl'
        };
    })
    .directive('biCheckItem', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biCheckItemTemplate.html',
            replace : true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemValue: '=itemValue',
                itemOldValue: '=itemOldValue',
                onItemChanged: '=onItemChanged',
                itemLocked: '=itemLocked'
            },
            controller: 'biFormItemCtrl'
        };
    })
    .directive('biQueryItem', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biQueryItemTemplate.html',
            replace : true,
            scope: {
                itemLabel: '=itemLabel',
                itemTip: '=itemTip',
                itemValue: '=itemValue'
            }
        };
    })
    .directive('biQuerySelect', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/form/biQuerySelectTemplate.html',
            replace : true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemOptions: '=itemOptions',
                itemDataType: '=itemDataType',
                itemValue: '=itemValue'
            }
        };
    })
    .controller('biFormItemCtrl', ['$log', '$scope', function($log, $scope) {
        $scope.inputError = '';
        $scope.isNotInsert = function() {
            if ($scope.$parent.opType == 1)
                return false;
            else if (angular.isDefined($scope.$parent.ref) && $scope.$parent.ref && (!angular.isArray($scope.$parent.ref))) {
                if (angular.isDefined($scope.$parent.ref.rec))
                    return ($scope.$parent.ref.rec.opType == 2);
                else
                    return false;
            }
            else
                return ($scope.$parent.opType == 2 || $scope.$parent.rec.opType == 2);
        };
        $scope.chooseMenus = function() {
            $scope.$parent.chooseMenus();
        };
        var getPageId = function(p) {
            for (var attr in p.pageIDs) {
                if (p.pageIDs[attr] == p.crudPanels.activePanel)
                    return attr;
            }
            return '';
        };
        // 输入域检查, 汉字长度算1, 但没关系, MySQL里也是算1, 都不是按Byte字节算的.
        // 输入域需定义name(封装后定义item-name)才能生效
        $scope.isValidated = function(n, rqr, min, max,reg) {
            if (angular.isUndefined(n))
                return false;
            var p = this.$parent;
            var formName = getPageId(p) + 'Form'; // 注意页面里form元素的name的命名
            var form = p[formName];
            if (angular.isUndefined(form))
                return false;
            $scope.inputError = '';
            if (angular.isDefined(form.showError) && form.showError) {
                if (angular.isDefined(rqr) && form[n].$error.required) {
                    $scope.inputError = '必输域';
                    return true;
                }
                else if (angular.isDefined(min) && form[n].$error.minlength) {
                    $scope.inputError = '输入过短';
                    return true;
                }
                else if (angular.isDefined(max) && form[n].$error.maxlength) {
                    $scope.inputError = '输入太长';
                    return true;
                }
                else if (angular.isDefined(reg) && form[n].$error.pattern) {
                    $scope.inputError = '输入不合法';
                    return true;
                }
            }
            return false;
        };
    }]);

