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
            {option: 'status', names: [{value: 0, name: '待复核'}, {value: 3, name: '拒绝'}, {value: 2, name: '已复核'},{value: 4, name: '确认完毕'}]},
            {option: 'sex', names: [{value: 0, name: '女'}, {value: 1, name: '男'}]},
            {option: 'companyType', names: [{value: 0, name: '生产商'}, {value: 1, name: '供应商'}, {value:2, name: '运维商'}]},
            {option: 'YesNo', names: [{value: 0, name: '否'}, {value: 1, name: '是'}]},
            {option: 'action', names: [{value: 'input', name: '录入'}, {value: 'check', name: '复核'}, {value: 'reject', name: '拒绝'},{value: 'repeated', name: '重申'}]},
            {option: 'equipmentType', names: [{value: 0, name: '自助设备'}, {value: 1, name: 'POS机'}, {value: 2, name: '网银U盾'}, {value: 3, name: '密码键盘'}]},
            {option: 'env', names: [{value: 0, name: '开发'}, {value: 1, name: '测试'}, {value: 2, name: '集成'}, {value: 3, name: '验收'}, {value: 4, name: '演练'}, {value: 5, name: '灾备'}, {value: 6, name: '生产'}]},
            {option: 'acceptRejectPolicy', names: [{value: 0, name: '只允许集合内的'}, {value: 1, name: '除了集合内的'}]},
            {option: 'keyExponential', names: [{value: '3', name: '3 - 03'}, {value: '65537', name: '65537 - 010001'}]},
            {option: 'keyType', names: [{value: '000', name: '000(ZMK/BMK)'}, {value: '001', name: '001(ZPK)'}, {value: '002', name: '002(PVK/TPK/TMK/CVK)'}, {value: '402', name: '402(CVK)'}, {value: '003', name: '003(TAK)'}, {value: '008', name: '008(ZAK)'}, {value: '109', name: '109(MDK-AC/MDK-ENC/MDK-MAC/KMC)'}, {value: '209', name: '209(MDK-AC/MDK-ENC/MDK-MAC/KMC)'}, {value: '309', name: '309(MDK-AC/MDK-ENC/MDK-MAC/KMC)'}, {value: '409', name: '409(MDK-AC/MDK-ENC/MDK-MAC/KMC)'}, {value: '00A', name: '00A(ZEK/SEK/LK/LK2/TK)'}, {value: '00B', name: '00B(TEK)'}, {value: '00C', name: '00C(RSA-SK)'},{value:'509',name:'509(MK-DN)'}]},
            {option: 'keySchema', names: [{value: 'Y', name: '3DES-192 Bits'}, {value: 'X', name: '3DES-128 Bits'}, {value: 'Z', name: 'DES-64 Bits'}, {value: 'S', name: 'SM4-128 Bits'}]},
            {option: 'keyMode', names: [{value: 'RSA-1024', name: 'RSA 1024 Bits'}, {value: 'RSA-1152', name: 'RSA 1152 Bits'}, {value: 'RSA-1408', name: 'RSA 1408 Bits'}, {value: 'SM2-256', name: 'SM2 256 Bits'},{value: 'RSA-2048', name: 'RSA 2048 Bits'}]},
            {option: 'keyUse', names: [{value: 0, name: '应用模块'}, {value: 1, name: '设备'}, {value: 2, name: '合作伙伴'}]},
            {option: 'keyUseFor', names: [{value: 0, name: '发卡行密钥'}, {value: 1, name: 'IC卡密钥'}]},
            {option: 'keyUseType', names: [{value: 0, name: '不适用'}, {value: 1, name: '全行统一'}, {value: 2, name: '分行统一'}, {value: 3, name: '网点统一'}, {value: 4, name: '一机一密'}]},
            {option: 'keyUseType4Partner', names: [{value: 0, name: '不适用'}, {value: 1, name: '总对总'}, {value: 2, name: '分对分'}]},
            {option: 'keyUseALL', names: [{value: '0', name: '-'}, {value: '11', name: '全行统一'}, {value: '12', name: '分行统一'}, {value: '13', name: '网点统一'}, {value: '14', name: '一机一密'}, {value: '21', name: '总对总'}, {value: '22', name: '分对分'}]},
            {option: 'keyUseStatus', names: [{value: 0, name: '正常'}, {value: 1, name: '弃用'}, {value: 2, name: '过期'}]},
            {option: 'machineStatus', names: [{value: 4, name: '未上架'}, {value: 0, name: '在线'}, {value: 1, name: '离线'}, {value: 2, name: '故障'}, {value:3, name: '预备'}]},
            {option: 'PartnerType', names: [{value: 0, name: '政府机构'}, {value: 1, name: '商业企业'}]},
            {option: 'algorithmSign', names: [{value: 'RSA', name: 'RSA'}, {value: 'SM2', name: 'SM2'}]},
            {option: 'appEncode', names: [{value: 'UTF-8', name: 'UTF8'}, {value: 'GBK', name: 'GBK'}, {value: 'IBM935', name: 'IBM935'}, {value: 'Binary', name: 'Binary'}, {value: 'ISO-8859-1', name: 'ISO-8859-1'}]},
            {option: 'serviceSign', names: [{value: 0, name: '01010000 - 借、贷记'}, {value: 1, name: '01010100 - 借记'}, {value: 2, name: '01010200 - 贷记'}, {value: 3, name: '01010300 - 准贷记'}]},
            {option: 'taskType', names: [{value: 0, name: '对称密钥'}, {value: 1, name: '非对称密钥'}, {value: 2, name: '密码机组'}, {value: 3, name: '接入渠道'}, {value: 4, name: '安全服务节点'}, {value: 5, name: '安全服务集群'}]},
            {option: 'addReason', names: [{value: 0, name: '被动同步失败'}, {value: 1, name: '主动同步失败'}]},
            {option: 'taskStatus', names: [{value: 0, name: '未完成'}, {value: 1, name: '已完成'}]},
            {option: 'rootCertStatus', names: [{value: 0, name: '已导入'}, {value: 1, name: '证书格式错误'}, {value: 2, name: '已过期'}]},
            {option: 'certStatus', names: [{value: 0, name: '申请证书中'}, {value: 1, name: '证书已导入'}, {value: 2, name: '证书已过期'}, {value: 3, name: '请求文件生成错误'}]},
            {option: 'batchStatus', names: [{value: 0, name: '预备'}, {value: 1, name: '进行中 ...'}, {value: 2, name: '失败结束'}, {value: 3, name: '成功完成'}]},
            {option: 'pubKeyLength', names: [{value: 0, name: '1024 Bits'}, {value: 1, name: '1152 Bits'}, {value: 2, name: '1408 Bits'}, {value: 3, name: '1984 Bits'}]},
            {option: 'RSAStatus' , names: [{value: 0, name: '未用'}, {value: 1, name: '已用'}, {value: 2, name: '过期'}]},
            {option: 'packType' , names: [{value: 0, name: 'HSM'}, {value: 1, name: 'HxHSM'}, {value: 2, name: 'HxJSON'}, {value: 3, name: 'HxHSM+HxJSON'},{value: 4, name: 'HxHSM+HxJSON+INTER'}]},
            {option: 'shortConnection', names: [{value: 0, name: '长连接'}, {value: 1, name: '短连接'}]},
            {option: 'syncRqRs', names: [{value: 0, name: '异步'}, {value: 1, name: '同步'}]},
            {option: 'hsmEncode', names: [{value: 0, name: 'ASCII'}, {value: 1, name: 'EBCDIC'}, {value: 2, name: 'BINARY'}]},
            {option: 'journalStatus', names: [{value: 0, name: '成功'}, {value: 1, name: '失败'}, {value: 2, name: '进行中'}]},
            {option: 'hsmDriver', names: [{value: 'com.hxtc.hsm.socket.HSMSocket', name: 'SJJ1309'}, {value: 'com.hxtc.hsm.socket.SJL06TSocket', name: 'SJL06T'}]},
            {option: 'permission', names: [{value: 0, name: '读'}, {value: 1, name: '写'}, {value: 2, name: '其它'}]},
            {option: 'keySort', names: [{value: 0, name: '对称密钥'}, {value: 1, name: '非对称密钥'}]},
            {option: 'funt', names: [{value: 0, name: '签名'}, {value: 1, name: '验签'},{value:3,name:'签名验签'}]},
            {option: 'otpStart', names: [{value: 0, name: '未验证'}, {value: 1, name: '已验证'}]}

        ];


        var tableControllers = [
            {tableId: 'Application', title: '渠道接入管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.drop = false;
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveClusterList($scope);
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
                    $scope.refFields = ['keys'];
                }
            },
            {tableId: 'Clusters', title: '安全服务集群管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                }
            },
            {tableId: 'Company', title: '密码机厂商信息维护', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                }
            },
            {tableId: 'Equipment', title: '设备管理', keyInfo: 'equipmentNo',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.setKeyAbout($scope);
                }
            },
            {tableId: 'GroupDefine', title: '密码机设备分组管理', keyInfo: 'name',
                controller: function($log,$rootScope,$scope,myServer) {
                    $scope.rdydrop = false;
                    myServer.retrieveGroupList($scope);
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveClusterList($scope)
                }
            },
            {tableId: 'Host', title: '安全服务节点管理', keyInfo: 'nodeName',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveClusterList($scope);
                    $scope.isNameExist = true;
                }
            },
            {tableId: 'Journal', title: '操作历史查询',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    $scope.readOnly = true;
                    $scope.browseOnly = true;
                },
                setParams: function($log, $rootScope, $scope, params) {
                    params.userId = $rootScope.user.id;
                }
            },
            {tableId: 'Machine', title: '密码机设备信息维护', keyInfo: 'deviceNumber',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveGroupList($scope);
                    myServer.retrieveCompanyList($scope);
                    myServer.retrieveMachineModelList($scope);
                    $scope.preInsert = function(rec) {
                        rec.readies = [];
                    };
                    $scope.preUpdate = function(rec) {
                        rec.readies = rec.readies || [];
                    };
                    $scope.refFields = ['readies']; // 只有1类Entity-Relation需要
                }
            },
            {tableId: 'MachineModel', title: '密码机设备型号维护', keyInfo: 'model',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveCompanyList($scope);
                }
            },
            {tableId: 'MachineReady', title: '密码机设备上架管理', keyInfo: 'ip',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveGroupList($scope);
                    myServer.retrieveMachineList($scope);
                }
            },
            {tableId: 'Partner', title: '合作伙伴管理', keyInfo: 'partnerName'},

            {tableId: 'Role', title: '角色管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.roleMenuDialog($scope, "Role");
                    myServer.retrieveMenuTree($scope);
                }
            },
            {tableId: 'RootCert', title: '根CA证书管理', keyInfo: 'summary',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    var myVaults = [];
                    $scope.showUploadX = function(rec, fieldId, boxId) {
                        angular.element("#"+boxId).show();
                        var dhxConf = {
                            "parent": boxId,
                            "uploadUrl": myServer.URLPrefix + "upload",
                            "swfUrl": myServer.URLPrefix + "upload",
                            "slUrl": myServer.URLPrefix + "upload",
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
                        rec.certStatus = 1;
                    };
                }
            },
            {tableId: 'RsaKey', title:'非对称密钥管理', keyInfo: 'serviceIndex',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveSystemList($scope);
                    myServer.retrieveApplicationList($scope);
                    myServer.retrieveRsaKeyBatchList($scope);
                    myServer.retrieveRsaKeyBatchListName($scope);
                    myServer.retrieveKeyDefineList($scope);

                    $scope.isIndexExist = true;
                }
            },
            {tableId: 'RsaKeyBatch', title:'非对称密钥批次管理', keyInfo: 'summary',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveSystemList($scope);
                    myServer.retrieveSecretCertList($scope);
                    myServer.retrieveKeyDefineList($scope);
                    $scope.preInsert = function(rec) {
                        rec.batchStatus = 0;
                        rec.completeQuantity = 0;
                    };
                }
            },
            {tableId: 'SecretCert', title:'发卡行证书管理', keyInfo: 'serialNo',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveRsaKeyBatchList($scope);
                    myServer.retrieveRootCertList($scope);
                    var myVaults = [];
                    $scope.showUploadX = function(rec, fieldId, boxId) {
                        angular.element("#"+boxId).show();
                        var dhxConf = {
                            "parent": boxId,
                            "uploadUrl": myServer.URLPrefix + "upload",
                            "swfUrl": myServer.URLPrefix + "upload",
                            "slUrl": myServer.URLPrefix + "upload",
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
            {tableId: 'SecretCertBand', title: '发卡行证书绑定', keyInfo: 'secretCertId',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveSecretCertListByStatus($scope);
                    myServer.retrieveSecretCertList($scope);
                }
            },
            {tableId: 'SecretKey', title: '对称密钥管理', keyInfo: 'serviceIndex',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.sysdrop = false;
                    $scope.appdrop = false;
                    myServer.retrieveGroupList($scope);
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveSystemList($scope);
                    myServer.retrieveKeyDefineList($scope);
                    $scope.isCreateKey = true;
                    $scope.isIndexExist = true;
                    $scope.refFields = ['applications', 'systems'];
                }
            },
            {tableId: 'System', title: '行内系统信息维护', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    $scope.symdrop = false;
                    $scope.asymdrop = false;
                    myServer.retrieveKeyDefineList($scope);
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveClusterList($scope);
                    myServer.retrieveApplicationList($scope);
                    //myServer.retrievePartnerList($scope);
                    $scope.refFields = ['applications'];
                }
            },
            {tableId: 'KeyDefine', title: '密钥方案管理', keyInfo: 'keyName',
                controller:function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.setKeyAbout($scope);
                    myServer.retrieveSystemList($scope);
                    //myServer.retrievePartnerList($scope);
                }
            },
            {tableId: 'Task', title: '变更状态查询',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveClusterList($scope);
                    myServer.retrieveHostList($scope);
                    $scope.readOnly = true;
                }
            },
            {tableId: 'Users', title: '用户管理', keyInfo: 'name',
                controller: function($log, $rootScope, $scope, myServer) {
                    myServer.retrieveUsersList($scope);
                    myServer.retrieveRoleList($scope);
                    $scope.preInsert = function(rec) {
                        rec.password = '-';
                        rec.otpStart = 0;
                        rec.roles = [{}];
                    };
                    $scope.preUpdate = function(rec) {
                        if (angular.isUndefined(rec.roles) || rec.roles.length == 0)
                            rec.roles = [{}];
                    };
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
