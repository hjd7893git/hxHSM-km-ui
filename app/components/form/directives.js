/**
 * 杂项组件。
 * Created by Ben on 15/3/31.
 */
'use strict';

angular.module('myApp.components.form', [])

    .directive('biEditItem', function($templateCache) {
        return {
            restrict: 'E',
            templateUrl: 'components/form/biEditItemTemplate.html',
            replace: true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemFs: '=itemFs',
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
    .directive('biTableItem', function ($templateCache) {
        return {
            restrict: 'E',
            templateUrl: 'components/form/biTableItemTemplate.html',
            replace: true,
            scope: {
                itemMargin: '=itemMargin',
                itemLabel: '=itemLabel',
                itemFs: '=itemFs',
                itemFm: '=itemFm',
                itemTip: '=itemTip',
                itemValue: '=itemValue',
                itemOldValue: '=itemOldValue',
                itemDataType: '=itemDataType',
                itemLocked: '=itemLocked',
                itemName: '=itemName',
                itemRequired: '=itemRequired',
                itemMinLength: '=itemMinLength',
                itemMaxLength: '=itemMaxLength',
                itemRegExpr: '=itemRegExpr',
                mr: '=mr'
            },
            controller: 'biFormItemCtrl'
        };
    })
    .controller('biFormItemCtrl', ['$log', '$scope', function ($log, $scope) {
        $scope.inputError = '';
        $scope.mr = false;
        $scope.isNotInsert = function () {
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
        $scope.chooseMenus = function () {
            $scope.$parent.chooseMenus();
        };
        var getPageId = function (p) {
            for (var attr in p.pageIDs) {
                if (p.pageIDs[attr] == p.crudPanels.activePanel)
                    return attr;
            }
            return '';
        };

        $scope.clickEvent = function () {
            $scope.goods = $scope.itemFs;
            var text = $scope.itemValue;
            if (text != '' && angular.isDefined(text)) {
                var vid = $scope.regexpByIpList(text)
                if (!vid) {
                    $scope.inputError = "格式错误！"
                } else {
                    if ($scope.goods != "" && $scope.goods.in_array(text)) {
                        $scope.inputError = text + "已经存在！";
                    } else if ($scope.goods == "") {
                        $scope.itemFs = Array(text);
                    } else {
                        $scope.goods.push($scope.itemValue);
                        $scope.mCrf();
                    }
                }
            }

            $scope.itemValue = '';
        }
        $scope.enterEvent = function (e) {
            var keycode = window.event ? e.keyCode : e.which;
            if (keycode == 13) {
                $scope.clickEvent();
            }
        }
        $scope.dele = function ($index) {
            $scope.goods = $scope.itemFs;
            $scope.goods.splice($index, 1);
            $scope.getNewData();
        }
        $scope.mCrf = function () {
            $("#tab").show();
            $scope.inputError = "";
            $scope.mr = true;
            $scope.itemValue = "";

        }
        $scope.getNewData = function () {
            $scope.goods = $scope.itemFs; //数据回归
            $scope.itemValue = $scope.cult($scope.goods,",");
            $scope.inputError = "";
            // $scope.mr = false;

        }
        Array.prototype.in_array = function (e) {
            for (var i = 0; i < this.length; i++) {
                if (this[i] == e)
                    return true;
            }
            return false;
        }
        $scope.cult = function (res,p) {
            if (angular.isDefined(res)) {
                if (res instanceof Array) {
                    var mt = res[0];
                    for (var i = 1; i < res.length; i++) {
                        if ((res[i].indexOf("/") != -1 || res[i].indexOf("-") != -1) && "." == p) {
                            var m1 = res[i].split("/");
                            var m2 = res[i].split("-");
                            if (m1.length > 1) mt = mt + p + m1[0];
                            if (m2.length > 1) mt = mt + p + m2[0];
                        } else
                            mt = mt + p + res[i]
                    }
                    return mt;
                }
                if (typeof(res) == 'string') {
                    var mt = res.split(",");
                    return mt;
                }

            }
            return null;
        }
        $scope.don = function () {
            // $scope.mr = false;
            $("#tab").hide()
        }

        $scope.regexpByIpList = function (ipList) {
            var regexp = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
            var regexp_ = /^(([1-9]|([1-9]\d)|(1\d\d)|(2([0-4]\d|5[0-5]))))$/;
            try {
                var mc = ipList.split(".")[3];
                var m1 = mc.split("-")[1];
                var m2 = mc.split("/")[1];
                var mf_ = regexp.test($scope.cult(ipList.split("."),".")); //合法为true
                var mf_1 = false;
                var mf_t = false;
                if (angular.isDefined(m1)) {
                    mf_1 = regexp_.test(m1);
                    mf_t = true;
                }
                if (angular.isDefined(m2)) {
                    mf_1 = 32 > parseInt(m2) && parseInt(m2) > 8;
                    mf_t = true;
                }
            } catch (e) {
                return false
            }
            if (mf_t) {
                if (mf_ && mf_1) return true;
            } else if (mf_) return true;
            else false;
        }

        // 输入域检查, 汉字长度算1, 但没关系, MySQL里也是算1, 都不是按Byte字节算的.
        // 输入域需定义name(封装后定义item-name)才能生效
        $scope.isValidated = function (n, rqr, min, max, reg) {
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

