/**
 * 与后台的通讯封装。
 * Created by Ben on 15/4/3.
 */
'use strict';

angular.module('myApp.services', ['ngResource'])
    // .run(function ($rootScope, $interval) {
    //     var timer = $interval(function () {
    //         $http({
    //             method: 'GET',
    //             url: 'http://www.runoob.com/try/angularjs/data/sites.php'
    //         }).then(function successCallback(response) {
    //             $scope.names = response.data.sites;
    //         }, function errorCallback(response) {
    //             // 请求失败执行代码
    //         });
    //     }, 2000)
    // })
    .factory('myServer', ['$http', '$log', '$q', '$resource', '$modal', '$timeout', function($http, $log, $q, $resource, $modal, $timeout) {
        // var URLPrefix = "http://192.168.0.64:8080/service/";
        var URLPrefix = "http://localhost:8100/service/";
        // var URLPrefix = "service/";
        return {
            URLPrefix: URLPrefix,
            call: function(uri, data, m) {
                var method = angular.isDefined(m) ? m : 'POST';
                var deferred = $q.defer(); // 声明延后执行，表示要去监控后面的执行
                var conf = {
                    url: URLPrefix + uri,
                    method: method,
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
            errorDialog: function($scope, who, jumpTo) {
                var errorModal = $modal({scope: $scope, templateUrl: 'views/dialog/error.html', show: false});
                var powerModal = $modal({scope: $scope, templateUrl: 'views/dialog/power.html', show: false});

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
                $scope.showModalPower = function (msg) {
                    $scope.title = '提示';
                    $scope.errorCode = '通知';
                    $scope.errorMsg = msg;
                    errorModal.$promise.then(errorModal.show);
                }
                $scope.showTips = function(msg) {
                    $scope.title = '提示';
                    $scope.errorCode = 'Success';
                    $scope.errorMsg = msg;
                    errorModal.$promise.then(errorModal.show);
                };
                $scope.confirm = function() {
                    errorModal.$promise.then(errorModal.hide);
                    if (angular.isDefined(jumpTo))
                        jumpTo($scope);
                };
            },
            roleMenuDialog: function($scope, who) {
                var arrayDup = function(a) { // 数组复制
                    return angular.element.map(a, function(obj){
                        return angular.element.extend(true, {}, obj);
                    });
                };
                var menuModal = $modal({scope: $scope, templateUrl: 'views/dialog/rolemenus.html', show: false});
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
                        if (angular.isDefined($scope.rec.menus)) {
                            angular.element.each($scope.rec.menus, function(n, ele) {
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
                            if (angular.isDefined(ele['rmId']) && ele['rmId'] >= 0 && (rm.opType == 3 || rm.opType == 2))
                                rm.id = ele['rmId'];
                            chosens.push(rm);
                        }
                        findChosenMenus(ele.items, chosens);
                    });
                };
                $scope.confirmMenu = function(rec) {
                    rec.menus = [];
                    findChosenMenus($scope.$root.menuTree, rec.menus);
                    menuModal.$promise.then(menuModal.hide);
                };
            },
            crud: function($scope, tableId, title, myRes) {
                $scope.batchUpdateKey = {};
                $scope.selectMod = true;
                $scope.lock = true;
                $scope.lockKeyAbout = false;
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
                    $scope.opType = 0;
                    $scope.selectedRec = $scope.recs[idx].rec;
                    if ($scope.tableId == 'Application' ) {
                        $scope.fcs = $scope.selectedRec.ipList || ''.split(",");
                    }
                    $scope.selectedIndex = idx;
                    $scope.lock = true;
                    $scope.lockKeyAbout = true;
                    $scope.rec = angular.element.extend(true, {}, $scope.selectedRec);
                    if (angular.isUndefined($scope.rec.opType))
                        $scope.rec.opType = 0;
                    if (angular.isUndefined($scope.recs[idx].bak))
                        $scope.recs[idx].bak = angular.element.extend(false, {}, $scope.selectedRec);
                    $scope.bak = $scope.recs[idx].bak;
                    $scope.gotoPage('edit');
                };
                $scope.showRefEditor = function(refRecs, idx, refPageId, refTableId) {
                    $scope.ref = {
                        recs: refRecs, lock: true, opType: 0, onChecking: false,
                        selectedRec: refRecs[idx].rec, selectedIndex: idx, pageId: refPageId,
                        rec: angular.element.extend(true, {}, refRecs[idx].rec)
                    };
                    if (refTableId == "System") {
                        $scope.isIndexExist = true;
                    }

                    if (angular.isUndefined($scope.ref.recs[idx].bak))
                        $scope.ref.recs[idx].bak = angular.element.extend(true, {opType: 2}, $scope.ref.selectedRec);
                    $scope.ref.bak = $scope.ref.recs[idx].bak;
                    if (angular.isUndefined($scope.ref.rec.opType))
                        $scope.ref.rec.opType = 0;
                    if ($scope.recStatus != -1) { // checking
                        // if(angular.isUndefined(refTableId))
                        //     refTableId = 'SecretKey'
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
                $scope.addRefRow = function(refRecs, recs, id) {
                var flag = 0;
                    if (!angular.isDefined(refRecs)) refRecs = [];
                    refRecs.forEach(function(ref){
                        if (ref.rec.id == id && ref.rec.opType!=3 ) {    //
                            $scope.showTips('该内容已存在，未重复添加');
                            flag=1
                            return;
                        }else if(ref.rec.id == id){
                            ref.rec.opType=1;
                            flag=1;
                            return;
                        }
                    })
                    if(flag==0){
                        recs.forEach(function(rec){
                            if (rec.id == id && rec.opType!=3) {
                                rec.permission=0;
                                var recbuf = rec;
                                recbuf.opType = 1;
                                refRecs.push({rec: recbuf});
                            }
                        })
                    }
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
                $scope.cancelEditing = function() {
                    if($scope.tableId=='Application')
                        $("#tab").hide();
                    $scope.opType = 0;
                    $scope.isClusterExist = true;
                    $scope.isIndexExist = true;
                    $scope.isNameExist = true;
                    $scope.isCreateKey = true;
                    $scope.returnQuery('query');

                };
                $scope.isNotInsertUp = function() {
                    if ($scope.opType == 1)
                        return false;
                    else if (angular.isDefined($scope.ref)) {
                        return ($scope.ref.rec.opType == 2);
                    }
                    else
                        return ($scope.opType == 2 || $scope.rec.opType == 2);
                };
                $scope.submitEditedBatch = function(){
                    while (true) {
                        var chosenIdx = getChosenIdx();
                        if (angular.isUndefined(chosenIdx))
                            break;
                        $scope.selectedRec = $scope.recs[chosenIdx].rec;
                        $scope.rec = angular.element.extend(true, {}, $scope.selectedRec);
                        if (angular.isUndefined($scope.rec.opType))
                            $scope.rec.opType = 0;
                        $scope.opType = 2;
                        if ($scope.rec.opType != 1)
                            $scope.rec.opType = 2;
                        $scope.rec.createKey = true;
                        $scope.rec.keys[0].chosen = true;
                        $scope.rec.keys[0].keyValue = $scope.batchUpdateKey.keyValue;
                        $scope.rec.keys[0].checkValue = $scope.batchUpdateKey.checkValue;
                        $scope.submitEdited();
                        $scope.selectedRec.chosen = false;
                    }
                };
                $scope.submitEdited = function() {
                    if($scope.tableId== 'Application')
                        $("#tab").hide();
                    if ($scope.tableId == 'Host') {
                        if ($scope.rec.opType == 1) {
                            $scope.rec.os = '-';
                            $scope.rec.osUser = '-';
                            $scope.rec.program = '-';
                            $scope.rec.programMemory = '-';
                        }
                    }
                    if ($scope.tableId != 'SecretCert'){ //看不懂valid，更新上传文件时跳出方法，暂时先把SecretCert排除
                        if (!isValidForm(this))
                            return;
                    }
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
                                newRec[ele] = chged;  //控制第二层的数据变动
                            }
                        });
                    }
                    if (($scope.rec.opType == 1 && $scope.opType == 1) || ($scope.rec.keyType == 3)) { // Insert
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
                    if ($scope.opType != 1)
                        $scope.opType = 2;
                    if ($scope.rec.opType != 1)
                        $scope.rec.opType = 2;
                    if (angular.isUndefined($scope.rec.serviceIndex))
                        $scope.isIndexExist = false;
                    else
                        $scope.isIndexExist = true;
                    if (angular.isUndefined($scope.rec.nodeName))
                        $scope.isNameExist = false;
                    else
                        $scope.isNameExist = true;
                    $scope.isCreateKey = false;
                };
                $scope.preCreateKey = function() {
                    $scope.lockKeyAbout = false;
                    $scope.rec.createKey = true;
                    $scope.selectMod = false;
                    $scope.opType = 2;
                    $scope.rec.keyType = 3;
                    if ($scope.rec.opType != 1) {
                        $scope.rec.opType = 2;
                        angular.element.each($scope.rec.keys, function(n, ele) {
                            if (angular.isUndefined(ele.partnerId))
                                ele.partnerId = 4;
                            ele.chosen = (ele.partnerId == 4);
                        });
                    }
                };
                $scope.showBatchUpdateX = function(){
                    var chosenIdx = getChosenIdx();
                    if (angular.isDefined(chosenIdx)) {
                        $scope.lockKeyAbout = false;
                        $scope.opType = 2;
                        $scope.gotoPage('batch');
                    }
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
                        if ($scope.tableId == 'SecretKey') {
                            if (angular.isUndefined($scope.rec.serviceIndex))
                                $scope.isIndexExist = false;
                            else
                                $scope.isIndexExist = true;
                            if (angular.isUndefined($scope.rec.clusterId))
                                $scope.isClusterExist = false;
                            else
                                $scope.isClusterExist = true;
                        }

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
                    refRecs[idx].rec.opType = 3;
                    //     refRecs[idx].rec = null;
                    //     refRecs.splice(idx, 1);
                };
                $scope.ch = function(refRecs, idx) {
                    refRecs[idx].rec.opType = 2;
                    //     refRecs[idx].rec = null;
                    //     refRecs.splice(idx, 1);
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
                $scope.returnQuery = function(pageId) {
                    $scope.selectMod = true;
                    $scope.gotoPage(pageId);
                };
                $scope.gotoPage = function(pageId) {
                    if ($scope.tableId == 'JournalBiz') {
                        var panelNo = 0;
                        if (pageId == 'edit') {
                            var panelNoX = $scope.$parent.detailPageIDs[$scope.selectedRec.table];
                            if (angular.isDefined(panelNoX))
                                panelNo = panelNoX;
                        }
                        $scope.crudPanels.activePanel = panelNo;
                    } else {
                        var panelNo = $scope.pageIDs[pageId];
                        if (angular.isUndefined(panelNo)) {
                            $scope.curdPages.push('views/' + $scope.tableId + '/' + pageId + '.html');
                            panelNo = $scope.curdPages.length - 1;
                            $scope.pageIDs[pageId] = panelNo;
                        }
                        $scope.thePageId = pageId;
                        $scope.crudPanels.activePanel = panelNo;
                    }
                };
                $scope.showEditorX = function() {
                    $scope.lock = false;
                    $scope.opType = 1;
                    $scope.rec = {opType: 1};
                    if ($scope.tableId == 'Host') {
                        $scope.isNameExist = false;
                    }if($scope.tableId == 'Application'){
                        $scope.fcs = "";
                    }if($scope.tableId == 'System'){
                        $scope.isCreateKey = false;
                        $scope.isIndexExist = false;
                        $scope.isClusterExist = false;
                        $scope.rec.applications = [];

                    }if ($scope.tableId == 'SecretKey') {
                        $scope.isCreateKey = false;
                        $scope.isIndexExist = false;
                        $scope.isClusterExist = false;
                        $scope.rec.systems = [];
                    }if($scope.tableId == 'Machine'||$scope.tableId =='RsaKey'||$scope.tableId =='MachineReady'||$scope.tableId =='RsaKeyBatch'||$scope.tableId =='SecretCert'||$scope.tableId =='SecretKey'){
                        //新加数据且缩小作用域
                        $scope.rec.supplyDate="";
                        $scope.rec.produceDate="";
                        $scope.rec.createDatetime="";
                        $scope.rec.issueDate="";
                        $scope.rec.readyDate="";
                        $scope.rec.startDatetime="";
                        $scope.rec.invalidDate="";
                        $scope.rec.driverClass="";
                    }
                    if (angular.isDefined($scope.preInsert))
                        $scope.preInsert($scope.rec);
                    $scope.unlockEditor();
                    $scope.gotoPage('edit');
                };
                $scope.copyEditor = function() {
                    $scope.lock = false;
                    $scope.opType = 1;
                    $scope.rec = angular.element.extend(true, {}, $scope.selectedRec);
                    delete $scope.rec.id;
                    delete $scope.rec.chosen;
                    $scope.rec.opType = 1;
                    if (angular.isDefined($scope.preUpdate))
                        $scope.preUpdate($scope.rec);

                    if ($scope.tableId == "Machine"||$scope.tableId =="GroupDefine") {
                        // $scope.rec.readies.forEach(function(ready){
                        //     delete ready.rec.id;
                        // });
                        delete $scope.rec.readies;
                    }
                    if($scope.tableId == "SecretCert"){
                        delete $scope.rec.certStatus;
                        delete $scope.rec.rsaKey;
                        delete $scope.rec.rsaKeyId;
                        delete $scope.rec.requestFile;
                        delete $scope.rec.certFile;
                        delete $scope.rec.rsaKeyId;
                        delete $scope.rec.rsaKeyBatchList;
                        delete $scope.rec.rootCertList;
                        delete $scope.rec.rootCertId;
                        delete $scope.rec.rootPrivateIndex;
                        delete $scope.rec.issuingNumber;
                        delete $scope.rec.publicKeySurplus;
                        delete $scope.rec.publicKeyExponential;
                        delete $scope.rec.publicKeyCert;
                    }
                    if($scope.tableId=="SecretKey"){
                        delete $scope.rec.systems;
                        delete $scope.rec.applications;
                    }
                    if ($scope.tableId == "RsaKeyBatch") {
                        $scope.rec.completeQuantity = 0;
                        delete $scope.rec.endDatetime;
                        $scope.rec.batchStatus = 0;
                        $scope.rec.info = 0;
                    }
                    $scope.gotoPage('edit');
                };

                $scope.copyEditorX = function() {
                    var chosenIdx = getChosenIdx();
                    if (angular.isDefined(chosenIdx)) {
                        $scope.showEditor(chosenIdx);
                        $scope.copyEditor();
                    }
                };
                $scope.showRefEditorX = function(refRecs, pageId, id) {
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
                $scope.toggleTodoChosen = function() {
                    $scope.allChosen = !$scope.allChosen;
                    angular.element.each($scope.recs, function(n, ele) {
                        ele.chosen = $scope.allChosen;
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
                        $scope.qry = params;
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
                $scope.isKeySet = function(v) {
                    if (angular.isArray(v))
                        return (v.length > 0);
                    else if (angular.isDefined(v))
                        return v != -1;
                    else
                        return false;
                };
                $scope.objChanged = function(a, b) {
                    return JSON.stringify(a) != JSON.stringify(b);
                };
                $scope.valueChanged = function(keyId, valueId, rec, baks) {
                    var chged = true;
                    angular.element.each(baks, function(n, ele) {
                        if (ele[keyId] == rec[keyId]) {
                            chged = (ele[valueId] != rec[valueId]);
                        }
                    });
                    return chged;
                };
                $scope.changedValue = function(keyId, valueId, rec, baks) {
                    var chged = '';
                    angular.element.each(baks, function(n, ele) {
                        if (ele[keyId] == rec[keyId]) {
                            chged = '' + ele[valueId];
                        }
                    });
                    return chged;
                };
                $scope.changeInputKey = function() {
                    $scope.selectMod = !$scope.selectMod;
                    if (angular.isUndefined($scope.rec.keys)) {
                        $scope.rec.keys = [];
                    }
                };
            },
            retrieveMenuTree: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.menuTree = ret;
                    }
                };
                $scope.$root.menuTree = [];
                $scope.queryBase($resource(URLPrefix + 'MenuTree'), {}, ok1);
            },
            retrieveApplicationList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.applicationList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                        $scope.$root.applicationRows = angular.element.map(ret, function(obj) {
                            return obj;
                        });
                    }
                };
                $scope.$root.applicationList = [];
                $scope.$root.applicationRows = [];
                $scope.queryBase($resource(URLPrefix + 'ApplicationList'), {}, ok1);
            },
            retrieveRoleList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.roleList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                $scope.$root.roleList = [];
                $scope.queryBase($resource(URLPrefix + 'RoleList'), {}, ok1);
            },
            retrieveClusterList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.clusterList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                $scope.$root.clusterList = [];
                $scope.queryBase($resource(URLPrefix + 'ClustersList'), {}, ok1);
            },
            retrieveCompanyList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.companyList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                $scope.$root.companyList = [];
                $scope.queryBase($resource(URLPrefix + 'CompanyList'), {}, ok1);
            },
            retrieveHostList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.hostList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.nodeName};
                        });
                    }
                };
                $scope.$root.hostList = [];
                $scope.queryBase($resource(URLPrefix + 'HostList'), {}, ok1);
            },
            retrieveSystemList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.systemList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                        $scope.$root.systemRows = angular.element.map(ret, function(obj) {
                            return obj;
                        });
                    }
                };
                $scope.$root.systemList = [];
                $scope.$root.systemRows = [];
                $scope.queryBase($resource(URLPrefix + 'SystemList'), {}, ok1);
            },
            retrieveKeyDefineList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.keyDefineNameList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.keyName};
                        });
                        $scope.$root.keyDefineTypeList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.keyType};
                        });
                        $scope.$root.keyDefineSchemaList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.keySchema};
                        });
                    }
                };
                $scope.$root.keyDefineNameList = [];
                $scope.$root.keyDefineTypeList = [];
                $scope.$root.keyDefineSchemaList = [];
                $scope.queryBase($resource(URLPrefix + 'KeyDefineList'), {}, ok1);
            },
            retrievePartnerList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.partnerList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.partnerName};
                        });
                    }
                };
                $scope.$root.partnerList = [];
                $scope.queryBase($resource(URLPrefix + 'PartnerList'), {}, ok1);
            },
            retrieveMachineModelList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.machineModelList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.model};
                        });
                    }
                };
                $scope.$root.machineModelList = [];
                $scope.queryBase($resource(URLPrefix + 'MachineModelList'), {}, ok1);
            },
            retrieveGroupList: function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.groupList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.name};
                        });
                    }
                };
                $scope.$root.groupList = [];
                $scope.queryBase($resource(URLPrefix + 'GroupDefineList'), {}, ok1);
            },
            retrieveMachineList :  function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 || ret.status == 201) {
                        $scope.$root.machineList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.deviceNumber};
                        });
                    }
                };
                $scope.$root.machineList = [];
                $scope.queryBase($resource(URLPrefix + 'MachineList'), {}, ok1);
            },
            retrieveRsaKeyBatchList :  function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 | ret.status == 201) {
                        $scope.$root.rsaKeyBatchList = angular.element.map(ret, function(obj) {
                           return {value: obj.id, name: obj.info};
                        });
                    }
                };
                $scope.$root.rsaKeyBatchList = [];
                $scope.queryBase($resource(URLPrefix + 'RsaKeyBatchList/0'), {}, ok1);
            },
            retrieveRsaKeyBatchListName :  function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 | ret.status == 201) {
                        $scope.$root.rsaKeyBatchListName = angular.element.map(ret, function(obj) {
                           return {value: obj.id, name: obj.summary};
                        });
                    }
                };
                $scope.$root.rsaKeyBatchListName = [];
                $scope.queryBase($resource(URLPrefix + 'RsaKeyBatchList/1'), {}, ok1);
            },
            retrieveSecretCertListByStatus :  function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 | ret.status == 201) {
                        $scope.$root.secretCertListByStatus = angular.element.map(ret, function(obj) {
                           return {value: obj.id, name: obj.cardBin};
                        });
                    }
                };
                $scope.$root.secretCertListByStatus = [];
                $scope.queryBase($resource(URLPrefix + 'SecretCertList/1'), {}, ok1);
            },
            retrieveRootCertList :  function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 | ret.status == 201) {
                        $scope.$root.rootCertList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.summary};
                        });
                        $scope.$root.rootCertRidList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.rid};
                        });
                    }
                };
                $scope.$root.rootCertList = [];
                $scope.queryBase($resource(URLPrefix + 'RootCertList'), {}, ok1);
            },
            retrieveSecretCertList :  function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 | ret.status == 201) {
                        $scope.$root.secretCertList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.serialNo};
                        });
                    }
                };
                $scope.$root.secretCertList = [];
                $scope.queryBase($resource(URLPrefix + 'SecretCertList'), {}, ok1);
            },
            retrieveUsersList :  function($scope) {
                var ok1 = function(ret) {
                    if (angular.isUndefined(ret.status) || ret.status == 200 | ret.status == 201) {
                        $scope.$root.userList = angular.element.map(ret, function(obj) {
                            return {value: obj.id, name: obj.mobile};
                        });
                    }
                };
                $scope.$root.userList = [];
                $scope.queryBase($resource(URLPrefix + 'UsersList'), {}, ok1);
            },
            setKeyAbout: function($scope) {
                $scope.preCommit = function(rec) {
                    if (angular.isDefined(rec.createKey) && rec.createKey) {
                        rec.keyBizSeq = -1; // 0会判为false
                        if (angular.isDefined(rec.keys)) {
                            angular.element.each(rec.keys, function(n, ele) {
                                if (ele.chosen) {
                                    ele.opType = (ele.id != 0) ? 2 : 1;
                                }
                            });
                        }
                    }
                };
                $scope.refFields = ['keys'];
                $scope.keyAbout = true;
            },
            journals: $resource(URLPrefix + 'JournalBiz/:status', {seqNo: '@status'}),
            statistics: $resource(URLPrefix + 'statistics/:tableId/:appId', {tableId:'@tableId', appId: '@appId'})
        };
    }])



