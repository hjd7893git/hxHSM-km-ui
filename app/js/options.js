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
            {option: 'companyType', names: [{value: 0, name: '生产商'}, {value: 1, name: '供应商'}, {value:2,name: '运维商'}]},
            {option: 'YesNo', names: [{value: 0, name: '否'}, {value: 1, name: '是'}]},
            {option: 'action', names: [{value: 'input', name: '录入'}, {value: 'check', name: '复核'}, {value: 'reject', name: '拒绝'}]},
            {option: 'equipmentType', names: [{value: 1, name: '自助设备'}, {value: 2, name: 'POS机'}, {value: 3, name: '网银Key'}, {value: 4, name: '密码键盘'}]},
            {option: 'env', names: [{value: 0, name: '开发'}, {value: 1, name: '测试'}, {value: 2, name: '集成'}, {value: 3, name: '验收'}, {value: 4, name: '演练'}, {value: 5, name: '灾备'}, {value: 6, name: '生产'}]},
            {option: 'machineStatus', names: [{value: 0, name: '在线'}, {value: 1, name: '离线'}, {value: 2, name: '故障'}]},
            {option: 'acceptRejectPolicy', names: [{value: 0, name: '只允许集合内的'}, {value: 1, name: '除了集合内的'}]},
            {option: 'keyType',names:[{value:'000',name:'ZMK'},{value:'001',name:'ZPK'}]},
            {option: 'keySchema', names: [{value: 'Y', name: '16 Bits'}, {value: 'X', name: '32 Bits'}, {value: 'Z', name: '48 Bits'}]},
            {option: 'keyUse', names: [{value: 0, name: '应用模块'}, {value: 1, name: '设备'}, {value: 2, name: '合作伙伴'}]},
            {option: 'keyUseType', names: [{value: 0, name: '不适用'}, {value: 1, name: '全行统一'}, {value: 2, name: '分行统一'},{value:3,name:'网店统一'},{value:4,name:'一机一密'}]},
            {option: 'machineStatus', names: [{value: 0, name: '在线'}, {value: 1, name: '离线'}, {value: 2, name: '故障'}]}

        ];
        var tableControllers = [
            {tableId: 'Application', title: '应用管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveGroups($scope);
                    $scope.dataset = [{ data: [], yaxis: 1, label: 'sin' }];
                    $scope.options = {
                        legend: {
                            container: '#legend',
                            show: true
                        }
                    };
                    for (var i = 0; i < 14; i += 0.5) {
                        $scope.dataset[0].data.push([i, Math.sin(i)])
                    }
                }
            },
            {tableId: 'Cert', title: '证书管理'},
            {tableId: 'Cluster', title: '集群管理'},
            {tableId: 'Company', title: '厂商管理', keyInfo: 'name'},
            {tableId: 'Equipment', title: '设备管理',keyInfo:'equipmentNo'},
            {tableId: 'Global', title: '全局配置'},
            {tableId: 'GroupDefine', title: '分组管理'},
            {tableId: 'SystemKeyDefine', title: '系统密钥生成', keyInfo: 'keyName'},
            {tableId: 'Machine', title: '密码机信息管理', keyInfo: 'number',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveGroups($scope);
                    $scope.preInsert = function(rec) {
                        rec.readies = [];
                    };
                    $scope.preUpdate = function(rec) {
                        rec.readies = rec.readies || [];
                    };
                    $scope.refFields = ['readies']; // 只有1类Entity-Relation需要
                    myServer.retrieveMachineModels($scope);
                }
            },
            {tableId: 'MachineReady', title: '密码机上架管理',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveGroups($scope);
                }
            },
            {tableId: 'Menu', title: '菜单管理'},
            {tableId: 'Role', title: '角色管理',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.roleMenuDialog($scope, "Role");
                    myServer.retrieveMenuTree($scope);
                }
            },
            {tableId: 'System', title: '系统管理',keyInfo:'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.preInsert = function(rec) {
                        rec.keyDefines = [];
                    };
                    $scope.preUpdate = function(rec) {
                        rec.keyDefines = rec.keyDefines || [];
                    };
                    $scope.refFields = ['keyDefines'];
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
                    myServer.retrieveRoles($scope);
                }
            },
            {tableId: 'Host', title: '主机管理', keyInfo: 'hardware',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveClusters($scope);
                }
            },
            {tableId: 'MachineModel', title: '密码机型号管理', keyInfo: 'model',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveCompanies($scope);
                }
            },
            {tableId: 'SystemKeyDefine', title: '系统密钥定义',keyInfo:'keyName',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveSecretKeies($scope);
                }
            },
            {tableId: 'SecretKey', title: '密钥管理',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveSystemKeyDefines($scope);
                }
            },

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
