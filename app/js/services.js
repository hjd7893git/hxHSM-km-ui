/**
 * 与后台的通讯封装。
 * Created by Ben on 15/4/3.
 */
'use strict';

angular.module('myApp.services', ['ngResource'])

    .factory('myServer', ['$http', '$log', '$q', '$resource', '$modal', '$timeout', function($http, $log, $q, $resource, $modal, $timeout) {
        var URLPrefix = "http://localhost:8080/service/";
        return {
            call: function(uri, data) {
                var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
                var conf = {
                    url: URLPrefix + uri,
                    method: 'POST',
                    data: data
                };
                $http(conf).success(function(data, status, headers) {
                    var ret = {status: status, data: data};
                    deferred.resolve(ret);  // 声明执行成功，即请求数据成功，可以返回数据了
                }).error(function(data, status, headers) {
                    var ret = {status: status, data: data};
                    deferred.reject(ret);   // 声明执行失败，即服务器返回错误
                });
                return deferred.promise;
            },
            errorDialog: function($scope, who) {
                var errorModal = $modal({scope: $scope, template: 'views/dialog/error.html', show: false});
                $scope.showModal = function(ret) {
                    if (angular.isDefined(ret)) {
                        $scope.title = '服务错误';
                        $scope.errorCode = ret.status;
                        if (angular.isDefined(ret.data) && ret.data != null) {
                            var json = JSON.parse(ret.data);
                            $scope.errorMsg = json.error;
                        } else
                            $scope.errorMsg = '服务端异常(错误未知)';
                    } else {
                        $scope.title = '通讯错误';
                        $scope.errorCode = '-1';
                        $scope.errorMsg = '服务端未启动或网络原因.';
                    }
                    errorModal.$promise.then(errorModal.show);
                };
            },
            roleMenuDialog: function($scope, who) {
                var arrayDup = function(a) { // 数组复制
                    return angular.element.map(a, function(obj){
                        return angular.element.extend(true, {}, obj);
                    });
                };
                var menuModal = $modal({scope: $scope, template: 'views/dialog/rolemenus.html', show: false});
                var clearChosenMenus = function(children, abId) {
                    angular.element.each(children, function(n, ele) {
                        ele.chosen = 0;
                        ele.bakChosen = 0;
                        ele[abId] = -1;
                        clearChosenMenus(ele.items, abId);
                    });
                };
                var setChosenMenus = function(m, cid, children, abId) {
                    var done = false;
                    angular.element.each(children, function(n, ele) {
                        if (ele.id == m.menuId) {
                            done = true;
                            ele[cid] = m.chosen;
                            if (angular.isDefined(m.id))
                                ele[abId] = m.id;
                            return false;
                        }
                    });
                    if (!done) {
                        angular.element.each(children, function(n, ele) {
                            done = setChosenMenus(m, cid, ele.items, abId);
                            if (done)
                                return false;
                        });
                    }
                    return done;
                };
                $scope.chooseMenus = function() {
                    if (angular.isDefined($scope.$root.menuTree)) {
                        clearChosenMenus($scope.$root.menuTree);
                        if (angular.isDefined($scope.rec.menus)) {
                            angular.element.each($scope.rec.menus, function(n, ele) {
                                setChosenMenus(ele, 'chosen', $scope.$root.menuTree, 'rmId');
                            });
                        }
                        if (angular.isDefined($scope.bak.menus)) {
                            angular.element.each($scope.bak.menus, function(n, ele) {
                                setChosenMenus(ele, 'bakChosen', $scope.$root.menuTree, 'rmId');
                            });
                        }
                    }
                    menuModal.$promise.then(menuModal.show);
                };
                $scope.toggleMenuChosen = function(me, up) {
                    // 统一子节点选中状态
                    me.chosen = (angular.isUndefined(me.chosen)) ? 1 : ((me.chosen != 1) ? 1 : 0);
                    var cascadeChosen = function(children, chosen) {
                        angular.element.each(children, function(n, ele) {
                            ele.chosen = chosen;
                            cascadeChosen(ele.items, chosen);
                        });
                    };
                    cascadeChosen(me.items, me.chosen);
                    // 更新父节点选中状态
                    var ancestorChosen = function(baba, chosen) {
                        if (baba != null) {
                            var babaChosen = chosen;
                            angular.element.each(baba.$modelValue.items, function(n, ele) {
                                var sibling = (angular.isUndefined(ele.chosen)) ? 0 : ele.chosen;
                                if (chosen != sibling) {
                                    babaChosen = -1;
                                    return false;
                                }
                            });
                            baba.$modelValue.chosen = babaChosen;
                            ancestorChosen(baba.$parentNodeScope, chosen);
                        }
                    };
                    ancestorChosen(up, me.chosen);
                };
                var findChosenMenus = function(children, chosens) {
                    angular.element.each(children, function(n, ele) {
                        var chosen = (angular.isUndefined(ele.chosen)) ? 0 : ele.chosen;
                        var bakChosen = (angular.isUndefined(ele.bakChosen)) ? 0 : ele.bakChosen;
                        var rm;
                        if (chosen != 0 && bakChosen == 0)
                            rm = {"menuId": ele.id, "chosen": chosen, "opType": 1};
                        else if (chosen == 0 && bakChosen != 0)
                            rm = {"menuId": ele.id, "chosen": chosen, "opType": 3};
                        else if (chosen != 0 && bakChosen != 0 && chosen != bakChosen)
                            rm = {"menuId": ele.id, "chosen": chosen, "opType": 2};
                        else if (chosen != 0 && bakChosen != 0 && chosen == bakChosen)
                            rm = {"menuId": ele.id, "chosen": chosen, "opType": 0};
                        if (angular.isDefined(rm)) {
                            if (angular.isDefined(ele['rmId']) && ele['rmId'] >= 0)
                                rm.id = ele['rmId'];
                            chosens.push(rm);
                        }
                        findChosenMenus(ele.items, chosens);
                    });
                };
                $scope.confirm = function(rec) {
                    rec.menus = [];
                    findChosenMenus($scope.$root.menuTree, rec.menus);
                    menuModal.$promise.then(menuModal.hide);
                };
            },
            crud: function($scope, tableId, title, myRes) {
                $scope.lock = true;
                $scope.recStatus = -1; // Inputting
                $scope.opType = 0;
                $scope.qry = {};
                $scope.hisQry = {};
                $scope.allChosen = false;
                $scope.crudPanels = {activePanel: 99};
                $scope.pageNo = {n: 0}; // 直接用pageNo = 0;会有问题: 要么程序改变值,要么input框改变值,混用就不灵了(双向绑定)
                $scope.hisPageNo = {n: 0};
                $scope.historyResource = $resource(URLPrefix + 'history');
                $scope.tableId = tableId;
                $scope.title = title;
                var sessionId = $scope.$root.sessionId;
                $scope.pageIDs = {query: 0};
                $scope.curdPages = ['views/' + tableId + '/query.html'];
                $scope.resource = angular.isDefined(myRes) ? myRes : $resource(URLPrefix + tableId + '/:recId', {recId: '@id'});
                $scope.showEditor = function(idx) {
                    $scope.selectedRec = $scope.recs[idx].rec;
                    $scope.selectedIndex = idx;
                    $scope.lock = true;
                    $scope.rec = angular.element.extend(true, {}, $scope.selectedRec);
                    if (angular.isUndefined($scope.rec.opType))
                        $scope.rec.opType = 0;
                    if (angular.isUndefined($scope.recs[idx].bak))
                        $scope.recs[idx].bak = angular.element.extend(true, {}, $scope.selectedRec);
                    $scope.bak = $scope.recs[idx].bak;
                    $scope.gotoPage('edit');
                };
                $scope.showRefEditor = function(refRecs, idx, refPageId, refTableId) {
                    $scope.ref = {
                        recs: refRecs, lock: true, opType: 0, onChecking: false,
                        selectedRec: refRecs[idx].rec, selectedIndex: idx, pageId: refPageId,
                        rec: angular.element.extend(true, {}, refRecs[idx].rec)
                    };
                    if (angular.isUndefined($scope.ref.recs[idx].bak))
                        $scope.ref.recs[idx].bak = angular.element.extend(true, {opType: 2}, $scope.ref.selectedRec);
                    $scope.ref.bak = $scope.ref.recs[idx].bak;
                    if (angular.isUndefined($scope.ref.rec.opType))
                        $scope.ref.rec.opType = 0;
                    if ($scope.recStatus != -1) { // checking
                        var field = refTableId + refPageId;
                        var refPanelNo = $scope.$root.detailPageIDs[field];
                        if (angular.isUndefined(refPanelNo)) {
                            $scope.$root.detailPanels.push('views/' + refTableId + '/' + refPageId + '.html');
                            $scope.$root.detailPageIDs[field] = refPanelNo = $scope.$root.detailPanels.length;
                        }
                        $scope.crudPanels.activePanel = refPanelNo;
                        $scope.ref.onChecking = true;
                    } else
                        $scope.gotoPage(refPageId);
                };
                var isValidForm = function(sp) {
                    var form = sp[$scope.thePageId + 'Form'];
                    var valid = (angular.isDefined(form) && !form.$valid) ? false : true;
                    if (!valid)
                        form.showError = !valid;
                    return valid;
                };
                $scope.submitRefEdited = function() {
                    if (!isValidForm(this))
                        return;
                    if ($scope.ref.rec.opType == 1 && $scope.ref.opType == 1) { // Insert
                        $scope.ref.recs = $scope.ref.recs || [];
                        $scope.ref.recs.push({rec: $scope.ref.rec});
                        $scope.gotoPage('edit');
                    }
                    else { // Update
                        if ($scope.isEq($scope.ref.rec, $scope.ref.bak)) {
                            $scope.warning = '未做任何修改,提交与放弃无异';
                            $timeout(function() {
                                $scope.warning = '';
                                $scope.gotoPage('edit');
                            }, 1500)
                        } else {
                            angular.copy($scope.ref.rec, $scope.ref.selectedRec);
                            $scope.unlockEditor();
                            $scope.gotoPage('edit');
                        }
                    }
                };
                $scope.submitEdited = function() {
                    if (!isValidForm(this))
                        return;
                    if (angular.isDefined($scope.preCommit))
                        $scope.preCommit($scope.rec);
                    var newRec = new $scope.resource($scope.rec);
                    if (angular.isDefined($scope.refFields)) {
                        angular.element.each($scope.refFields, function(n, ele) {
                            if (angular.isDefined(newRec[ele])) { // 过滤掉那些没有改的
                                var chged = angular.element.map(newRec[ele], function(obj) {
                                    if (angular.isDefined(obj.rec) && (obj.rec.opType == 1 || obj.rec.opType == 2 || obj.rec.opType == 3))
                                        return obj.rec;
                                    else if (obj.opType == 1 || obj.opType == 2 || obj.opType == 3)
                                        return obj;
                                });
                                newRec[ele] = chged;
                            }
                        });
                    }
                    if ($scope.rec.opType == 1 && $scope.opType == 1) { // Insert
                        newRec.$save({sessionId: sessionId}, function(rr) { // TODO: 后台应返回新创建的行,改动较大,暂不实现
                            $scope.rec.bizSeq = 1;
                            $scope.rec.id = rr.id;
                            $scope.recs = $scope.recs || [];
                            $scope.recs.push({rec: $scope.rec});
                            $scope.gotoPage('query');
                        }, fail);
                    }
                    else { // Update
                        newRec.$save({sessionId: sessionId}, function() {
                            $scope.rec.bizSeq = 1;
                            angular.copy($scope.rec, $scope.selectedRec);
                            $scope.gotoPage('query');
                        }, fail);
                    }
                };
                $scope.unlockEditor = function() {
                    if (angular.isDefined($scope.preUpdate))
                        $scope.preUpdate($scope.rec);
                    $scope.lock = false;
                    $scope.opType = 2;
                    if ($scope.rec.opType != 1)
                        $scope.rec.opType = 2;
                };
                $scope.unlockRefEditor = function() {
                    $scope.ref.lock = false;
                    $scope.ref.opType = 2;
                    if ($scope.ref.rec.opType != 1)
                        $scope.ref.rec.opType = 2;
                };
                var getChosenDeleteIdx = function() {
                    var chosenIdx;
                    angular.element.each($scope.recs, function(n, ele) {
                        if (angular.isDefined(ele.rec.chosen) && ele.rec.chosen && ele.rec.opType != 3 && angular.isUndefined(ele.rec.bizSeq)) {
                            chosenIdx = n;
                            return false;
                        }
                    });
                    return chosenIdx;
                };
                var getChosenIdx = function() {
                    var chosenIdx;
                    angular.element.each($scope.recs, function(n, ele) {
                        if (angular.isDefined(ele.rec.chosen) && ele.rec.chosen && angular.isUndefined(ele.rec.bizSeq)) {
                            chosenIdx = n;
                            return false;
                        }
                    });
                    return chosenIdx;
                };
                $scope.unlockRefEditorX = function(refRecs, idx, pageId) {
                    $scope.showRefEditor(refRecs, idx, pageId);
                    $scope.unlockRefEditor();
                };
                $scope.unlockEditorX = function() {
                    var chosenIdx = getChosenIdx();
                    if (angular.isDefined(chosenIdx)) {
                        $scope.showEditor(chosenIdx);
                        $scope.unlockEditor();
                    }
                };
                $scope.deleteRec = function() {
                    $scope.deleteRecInternal($scope.selectedRec, $scope.selectedIndex);
                };
                $scope.deleteRecInternal = function(rec, idx) {
                    if (rec.opType == 1) // 删本地新增的
                        $scope.recs.splice(idx, 1);
                    else {
                        rec.opType = 3; // 标记
                        var newRec = new $scope.resource(rec);
                        newRec.$delete({sessionId: sessionId}, function(rr) {
                            rec.bizSeq = 1;
                            if (angular.isDefined(rec.chosen))
                                rec.chosen = false;
                            $scope.gotoPage('query');
                        }, fail);
                    }
                };
                $scope.deleteRefRec = function() {
                    if ($scope.ref.selectedRec.opType == 1) // 删本地新增的
                        $scope.ref.recs.splice($scope.ref.selectedIndex, 1);
                    else
                        $scope.ref.selectedRec.opType = 3; // 标记
                    $scope.gotoPage('edit');
                };
                $scope.deleteRecX = function() {
                    while (true) {
                        var chosenIdx = getChosenDeleteIdx();
                        $log.info("chosend-index: " + chosenIdx);
                        if (angular.isUndefined(chosenIdx))
                            break;
                        $scope.deleteRecInternal($scope.recs[chosenIdx].rec, chosenIdx);
                    }
                    $scope.allChosen = false;
                };
                $scope.deleteRefRecX = function(refRecs, idx) {
                    refRecs.splice(idx, 1);
                };
                $scope.showHistory = function(chosenIdx) {
                    $scope.rec = angular.isDefined(chosenIdx) ? $scope.recs[chosenIdx].rec : $scope.selectedRec;
                    $scope.gotoPage('history');
                    $scope.histories = $scope.queryBase($scope.historyResource, {tableId: $scope.tableId, recId: $scope.rec.id, pageNo: $scope.hisPageNo.n});
                };
                $scope.showHistoryX = function() {
                    var chosenIdx = getChosenIdx();
                    if (angular.isDefined(chosenIdx))
                        $scope.showHistory(chosenIdx);
                };
                $scope.hisPageQuery = function(n, qry) {
                    var pageNo = parseInt($scope.hisPageNo.n) + parseInt(n);
                    if (pageNo >= 0 && (n <= 0 || (n > 0 && $scope.histories && $scope.histories.length > 0))) {
                        $scope.hisPageNo.n = pageNo;
                        var param = angular.element.extend(true, {tableId: $scope.tableId, recId: $scope.rec.id, pageNo: $scope.hisPageNo.n}, qry);
                        $scope.histories = $scope.queryBase($scope.historyResource, param);
                    }
                };
                $scope.syncHisInput = function() {
                  if (angular.isUndefined($scope.hisQry.dateFROM) && angular.isDefined($scope.hisQry.dateTO))
                      $scope.hisQry.dateFROM = $scope.hisQry.dateTO;
                  if (angular.isDefined($scope.hisQry.dateFROM) && angular.isUndefined($scope.hisQry.dateTO))
                      $scope.hisQry.dateTO = $scope.hisQry.dateFROM;
                };
                $scope.gotoPage = function(pageId) {
                    var panelNo = $scope.pageIDs[pageId];
                    if (angular.isUndefined(panelNo)) {
                        $scope.curdPages.push('views/' + $scope.tableId + '/' + pageId + '.html');
                        panelNo = $scope.curdPages.length - 1;
                        $scope.pageIDs[pageId] = panelNo;
                    }
                    $scope.thePageId = pageId;
                    $scope.crudPanels.activePanel = panelNo;
                };
                $scope.showEditorX = function() {
                    $scope.lock = false;
                    $scope.opType = 1;
                    $scope.rec = {opType: 1};
                    if (angular.isDefined($scope.preInsert))
                        $scope.preInsert($scope.rec);
                    $scope.gotoPage('edit');
                };
                $scope.showRefEditorX = function(refRecs, pageId) {
                    $scope.ref = {recs: refRecs, lock: false, opType: 1, rec: {opType: 1}};
                    if (angular.isDefined($scope.preRefInsert))
                        $scope.preRefInsert($scope.ref.rec);
                    $scope.gotoPage(pageId);
                };
                $scope.toggleChosen = function() {
                    $scope.allChosen = !$scope.allChosen;
                    angular.element.each($scope.recs, function(n, ele) {
                        if (!ele.rec.bizSeq)
                            ele.rec.chosen = $scope.allChosen;
                    });
                };
                var sortBy = function(field, reverse, primer) { // 定义排序方法
                    var key = primer ? function(x) { return primer(x[field]); } : function(x) { return x[field]; };
                    reverse = [-1, 1][+!!reverse];
                    return function (a, b) {
                        return a = key(a), b = key(b), reverse * ((a > b) - (b > a));
                    };
                };
                $scope.sortOn = function(field) {
                    var sortField = 'sortBy' + field;
                    if (angular.isUndefined($scope[sortField]))
                        $scope[sortField] = true;
                    else
                        $scope[sortField] = !$scope[sortField];
                    $scope.recs = $scope.recs.sort(sortBy(field, $scope[sortField], ''));
                };
                this.errorDialog($scope, tableId);
                var ok = function(ret) {
                    if (angular.isUndefined(ret.status)) // normal
                        $scope.recs = ret;
                    else
                        $scope.showModal(ret);
                };
                var okerr = function(ret) {
                    if (angular.isDefined(ret.status)) // error
                        $scope.showModal(ret);
                };
                var fail = function(ret) {
                    $scope.showModal(ret);
                };
                $scope.queryBase = function(t, params, ok1) {
                    var theRes = angular.isString(t) ? $resource(URLPrefix + t + '/:recId', {recId: '@id'}) : t;
                    if (angular.isDefined(params)) {
                        params.sessionId = sessionId;
                        var okf = (angular.isDefined(ok1) ? ok1 : okerr);
                        return theRes.query(params, okf, fail);
                    } else
                        return theRes.query({sessionId: sessionId}, okerr, fail);
                };
                $scope.query = function(params) {
                    $scope.gotoPage('query');
                    if (angular.isDefined(params)) {
                        params.sessionId = sessionId;
                        params.pageNo = $scope.pageNo.n;
                        return $scope.resource.query(params, ok, fail);
                    } else
                        return $scope.resource.query({sessionId: sessionId, pageNo: $scope.pageNo.n}, ok, fail);
                };
                $scope.pageQuery = function(n, qry, e) {
                    var pageNo = angular.isDefined(e) ? parseInt(n) : parseInt($scope.pageNo.n) + parseInt(n);
                    if (pageNo >= 0 && (n <= 0 || (n > 0 && $scope.recs && $scope.recs.length > 0)) && ((!angular.isDefined(e)) || (e.keyCode == 13))) {
                        $scope.pageNo.n = pageNo;
                        $scope.query(qry);
                    }
                };
                $scope.conditionQuery = function(qry) {
                    $scope.pageNo.n = 0;
                    $scope.query(qry);
                };
                $scope.isEq = function(a, b) {
                    return (JSON.stringify(a) == JSON.stringify(b));
                };
                $scope.refChanged = function(refs) {
                    var changed = false;
                    if (angular.isDefined(refs)) {
                        angular.element.each(refs, function(n, ele) {
                            changed = (ele.rec.opType == 1 || ele.rec.opType == 2 || ele.rec.opType == 3);
                            return !changed;
                        });
                    }
                    return changed;
                };
            },
            retrieveMenuTree: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.menuTree = ret;
                    }
                };
                if (angular.isUndefined($scope.$root.menuTree)) {
                    $scope.$root.menuTree = [];
                    $scope.queryBase($resource(URLPrefix + 'MenuTree'), {}, ok1);
                }
            },
            retrieveRoleList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.roleList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.roleList)) {
                    $scope.$root.roleList = [];
                    $scope.queryBase($resource(URLPrefix + 'RoleList'), {}, ok1);
                }
            },
            retrieveClusterList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.clusterList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.clusterList)) {
                    $scope.$root.clusterList = [];
                    $scope.queryBase($resource(URLPrefix + 'ClusterList'), {}, ok1);
                }
            },
            retrieveCompanyList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.companyList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.companyList)) {
                    $scope.$root.companyList = [];
                    $scope.queryBase($resource(URLPrefix + 'CompanyList'), {}, ok1);
                }
            },
            retrieveKeyDefineList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.keyDefineList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.keyName};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.keyDefineList)) {
                    $scope.$root.keyDefineList = [];
                    $scope.queryBase($resource(URLPrefix + 'SystemKeyDefineList'), {}, ok1);
                }
            },
            retrievePartnerList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.partnerList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.partnerName};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.partnerList)) {
                    $scope.$root.partnerList = [];
                    $scope.queryBase($resource(URLPrefix + 'PartnerList'), {}, ok1);
                }
            },
            retrieveBrancheList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.branchList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.branchName};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.branchList)) {
                    $scope.$root.branchList = [];
                    $scope.queryBase($resource(URLPrefix + 'BranchList'), {}, ok1);
                }
            },
            retrieveMachineModelList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.machineModelList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.model};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.machineModelList)) {
                    $scope.$root.machineModelList = [];
                    $scope.queryBase($resource(URLPrefix + 'MachineModelList'), {}, ok1);
                }
            },
            retrieveGroupList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.groupList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                if (angular.isUndefined($scope.$root.groupList)) {
                    $scope.$root.groupList = [];
                    $scope.queryBase($resource(URLPrefix + 'GroupDefineList'), {}, ok1);
                }
            },
            journals: $resource(URLPrefix + 'JournalBiz/:status', {seqNo: '@status'})
        };
    }]);
