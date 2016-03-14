/**
 * Created by MyMac on 15/9/9.
 */
/**
 * 与后台的通讯封装。
 * Created by Ben on 15/4/3.
 */
'use strict';

angular.module('myApp.options', ['ngResource'])

    .factory('myOptions', function() {
        var optionNames = [
            {option: 'opType', names: [{value: 0, name: '详情'}, {value: 1, name: '增加'}, {value: 2, name: '修改'}, {value: 3, name: '删除'}]},
            {option: 'opTypeIcon', names: [{value: 0, name: 'flag'}, {value: 1, name: 'plus'}, {value: 2, name: 'edit'}, {value: 3, name: 'trash-o'}]},
            {option: 'status', names: [{value: 0, name: '待复核'}, {value: 1, name: '拒绝'}, {value: 2, name: '已复核'}]},
            {option: 'sex', names: [{value: 0, name: '女'}, {value: 1, name: '男'}]},
            {option: 'companyType', names: [{value: 0, name: '生产商'}, {value: 1, name: '供应商'}, {value:2, name: '运维商'}]},
            {option: 'YesNo', names: [{value: 0, name: '否'}, {value: 1, name: '是'}]},
            {option: 'action', names: [{value: 'input', name: '录入'}, {value: 'check', name: '复核'}, {value: 'reject', name: '拒绝'}]},
            {option: 'equipmentType', names: [{value: 0, name: '自助设备'}, {value: 1, name: 'POS机'}, {value: 2, name: '网银U盾'}, {value: 3, name: '密码键盘'}]},
            {option: 'env', names: [{value: 0, name: '开发'}, {value: 1, name: '测试'}, {value: 2, name: '集成'}, {value: 3, name: '验收'}, {value: 4, name: '演练'}, {value: 5, name: '灾备'}, {value: 6, name: '生产'}]},
            {option: 'acceptRejectPolicy', names: [{value: 0, name: '只允许集合内的'}, {value: 1, name: '除了集合内的'}]},
            {option: 'keyType', names:[{value: '000', name: 'ZMK'}, {value: '001', name: 'ZPK'}]},
            {option: 'keySchema', names: [{value: 'Y', name: '16 Bits'}, {value: 'X', name: '32 Bits'}, {value: 'Z', name: '48 Bits'}]},
            {option: 'keyUse', names: [{value: 0, name: '应用模块'}, {value: 1, name: '设备'}, {value: 2, name: '合作伙伴'}]},
            {option: 'keyUseType', names: [{value: 0, name: '不适用'}, {value: 1, name: '全行统一'}, {value: 2, name: '分行统一'}, {value: 3, name: '网点统一'}, {value: 4, name: '一机一密'}]},
            {option: 'keyUseType4Partner', names: [{value: 0, name: '不适用'}, {value: 1, name: '总对总'}, {value: 2, name: '分对分'}]},
            {option: 'keyUseALL', names: [{value: '0', name: '-'}, {value: '11', name: '全行统一'}, {value: '12', name: '分行统一'}, {value: '13', name: '网点统一'}, {value: '14', name: '一机一密'}, {value: '21', name: '总对总'}, {value: '22', name: '分对分'}]},
            {option: 'machineStatus', names: [{value: 0, name: '在线'}, {value: 1, name: '离线'}, {value: 2, name: '故障'}, {value:3, name: '预备'}]},
            {option: 'PartnerType', names:[{value: 0, name: '政府机构'}, {value: 1, name: '商业企业'}]},
            {option: 'certStatus', names:[{value: 0, name: '密钥已生成'}, {value: 1, name: '申请中 ...'}, {value: 2, name: '已导入'}, {value: 3, name: '过期作废'}]},
            {option: 'batchStatus', names:[{value: 0, name: '预备'}, {value: 1, name: '进行中 ...'}, {value: 2, name: '失败结束'}, {value: 3, name: '成功完成'}]},
            {option: 'pubKeyLength', names:[{value: 0, name: '1024 Bits'}, {value: 1, name: '1152 Bits'}, {value: 2, name: '1408 Bits'}, {value: 3, name: '1984 Bits'}]},
            {option: 'RSAStatus' , names:[{value: 0, name: '未用'}, {value: 1, name: '已用'}, {value: 2, name: '过期'}]},
            {option: 'packType' , names:[{value: 0, name: 'HSM'}, {value: 1, name: 'HxHSM'}, {value: 2, name: 'HxJSON'}, {value: 3, name: 'HxHSM+HxJSON'}]}
        ];
        var tableControllers = [
            {tableId: 'Application', title: '应用管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveGroupList($scope);
                    $scope.displayChart = function(appId) {
                        $scope.gotoPage('chart');
                        $scope.dataset = [];//[['January', 10], ['February', 8], ['March', 4], ['April', 13], ['May', 12], ['June', 9]]];
                        $scope.options = {
                            series: {
                                bars: {
                                    show: true,
                                    align: 'center'
                                }
                            },
                            xaxis: {
                                mode: 'categories',
                                tickLength: 0
                            }
                        };
                        var formatTime = function (x1) {
                            var x = x1.substring(8);
                            return x.substr(0, 2) + ':' + x.substr(2, 2) + ':' + x.substr(4);
                        };
                        var ok = function(ret) {
                            if (angular.isUndefined(ret.status)) { // normal
                                $scope.dataset.push( angular.element.map(ret, function(obj) {
                                    return [[formatTime(obj.gatherDatetime), obj.failRate]];
                                }));
                                $log.info(JSON.stringify($scope.dataset));
                            }
                            else
                                $scope.showModal(ret);
                        };
                        $scope.queryBase(myServer.statistics, {tableId: 'Application', appId: appId}, ok);
                    };
                }
            },
            {tableId: 'Branch', title: '分支行机构管理', keyInfo: 'branchName',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveBranchList($scope);
                    myServer.setKeyAbout($scope);
                    $scope.preInsert = function(rec) {
                        rec.isLeaf = 1;
                    };
                },
                postChecked: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveBranchList($scope, true); // 刷新列表
                }
            },
            {tableId: 'CardDataApply', title: '制卡数据申请',
                controller:function($log,$rootScope,$scope,myServer) {
                    myServer.retrieveBranchList($scope);
                }
            },
            {tableId: 'Cluster', title: '集群管理'},
            {tableId: 'Company', title: '厂商管理', keyInfo: 'name'},
            {tableId: 'Equipment', title: '设备管理', keyInfo: 'equipmentNo',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveBranchList($scope);
                    myServer.setKeyAbout($scope);
                }
            },
            {tableId: 'Global', title: '全局配置'},
            {tableId: 'GroupDefine', title: '分组管理', keyInfo: 'name',
                controller: function($log,$rootScope,$scope,myServer) {
                    myServer.retrieveClusterList($scope)
                }
            },
            {tableId: 'Host', title: '主机管理', keyInfo: 'hardware',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveClusterList($scope);
                }
            },
            {tableId: 'Journal', title: '操作历史',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.readOnly = true;
                    $scope.browseOnly = true;
                },
                setParams: function($log, $rootScope, $scope, params) {
                    params.userId = $rootScope.user.id;
                }
            },
            {tableId: 'Machine', title: '密码机信息管理', keyInfo: 'number',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveGroupList($scope);
                    $scope.preInsert = function(rec) {
                        rec.readies = [];
                    };
                    $scope.preUpdate = function(rec) {
                        rec.readies = rec.readies || [];
                    };
                    $scope.refFields = ['readies']; // 只有1类Entity-Relation需要
                    myServer.retrieveCompanyList($scope);
                    myServer.retrieveMachineModelList($scope);
                }
            },
            {tableId: 'MachineModel', title: '密码机型号管理', keyInfo: 'model',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveCompanyList($scope);
                }
            },
            {tableId: 'MachineReady', title: '密码机上架管理',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveGroupList($scope);
                    myServer.retrieveMachineList($scope);
                }
            },
            {tableId: 'Menu', title: '菜单管理',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.readOnly = true;
                }
            },
            {tableId: 'Partner', title: '合作伙伴管理', keyInfo: 'partnerName'},
            {tableId: 'PartnerBranch', title: '合作伙伴分支机构管理', keyInfo: 'branchName',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrievePartnerList($scope);
                    myServer.setKeyAbout($scope);
                }
            },
            {tableId: 'Role', title: '角色管理',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.roleMenuDialog($scope, "Role");
                    myServer.retrieveMenuTree($scope);
                }
            },
            {tableId: 'RsaKey', title:'制卡数据',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveRsaKeyBatchList($scope);
                    $scope.readOnly = true;
                }
            },
            {tableId: 'RsaKeyBatch', title:'制卡数据生成批次',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveBranchList($scope);
                    $scope.preInsert = function(rec) {
                        rec.batchStatus = 0;
                        rec.completeQuantity = 0;
                    };
                }
            },
            {tableId: 'SecretCert', title:'证书',
                controller:function($log, $rootScope, $scope, myServer) {
                    var myVaults = [];
                    $scope.showUploadX = function(rec, fieldId, boxId) {
                        angular.element("#"+boxId).show();
                        var dhxConf = {
                            "parent": boxId,
                            "uploadUrl": "http://localhost:8080/service/upload",
                            "swfUrl": "http://localhost:8080/service/upload",
                            "slUrl": "http://localhost:8080/service/upload",
                            "swfPath": "dhxvault.swf",
                            "slXap": "dhxvault.xap",
                            "filesLimit": 1
                        };
                        if (angular.isUndefined(myVaults[boxId])) {
                            myVaults[boxId] = new dhtmlXVaultObject(dhxConf);
                            myVaults[boxId].attachEvent("onFileAdd", function(file) {
                                $scope.$apply(function () {
                                    rec[fieldId] = file.name; // TODO: UI不能立即刷新, 需解决(加上$apply就OK了)
                                    if (rec.rootPublicKeyFile && rec.certFileName)
                                        rec.certStatus = 2;
                                });
                            });
                        }
                        myVaults[boxId].f.click();
                    };
                    $scope.downloaded = function(rec) {
                        rec.downloadTimes = rec.downloadTimes + 1;
                        rec.certStatus = 1;
                    };
                }
            },
            {tableId: 'SecretKey', title: '密钥管理',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.readOnly = true;
                }
            },
            {tableId: 'System', title: '系统管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.preInsert = function(rec) {
                        rec.keyDefines = [];
                    };
                    $scope.preUpdate = function(rec) {
                        rec.keyDefines = rec.keyDefines || [];
                    };
                    $scope.refFields = ['keyDefines'];
                    myServer.retrievePartnerList($scope);
                }
            },
            {tableId: 'SystemKeyDefine', title: '系统密钥定义', keyInfo: 'keyName',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveSystemList($scope);
                    myServer.setKeyAbout($scope);
                    myServer.retrievePartnerList($scope);
                }
            },
            {tableId: 'User', title: '用户管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.preInsert = function(rec) {
                        rec.password = '-';
                        rec.roles = [{}];
                    };
                    $scope.preUpdate = function(rec) {
                        if (angular.isUndefined(rec.roles) || rec.roles.length == 0)
                            rec.roles = [{}];
                    };
                    myServer.retrieveRoleList($scope);
                }
            }
        ];
        var tableNames = angular.element.map(tableControllers, function(obj) {
            return {value: obj.tableId, name: obj.title};
        });
        return {
            findOption: function(o) {
                var found = [];
                angular.element.each(optionNames, function(n, ele) {
                    if (ele.option == o) {
                        found = ele.names;
                        return false;
                    }
                });
                return found;
            },
            findController: function(t) {
                var found;
                angular.element.each(tableControllers, function(n, ele) {
                    if (ele.tableId == t) {
                        found = ele;
                        return false;
                    }
                });
                return found;
            },
            getTableControllers: function() {
                return tableControllers;
            },
            getTableNames: function() {
                return tableNames;
            }
        };
    });
