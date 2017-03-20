/**
 * 页面（视图）路由定义。有必要时可为路由定义控制器，较为复杂的控制逻辑可以单独出来，页面很多的可以分子目录。
 * Created by Ben on 15/4/3.
 */
'use strict';

angular.module('myApp.views', ['ngRoute'])

    .config(['$routeProvider', function($routeProvider) {
        $routeProvider.when('/views/login', {
            templateUrl: 'views/login.html',
            controller: 'myLoginCtrl'
        }).when('/views/change', {
            templateUrl: 'views/change.html',
            controller: 'myChangePasswordCtrl'
        }).when('/views/about', {
            templateUrl: 'views/about.html',
            controller: 'myAboutCtrl'
        }).when('/views/check', {
            templateUrl: 'views/Todo/check.html',
            controller: 'todoCheckCtrl'
        }).when('/views/deploy', {
            templateUrl: 'views/deploy.html',
            controller: 'myDeployCtrl'
        }).when('/views/monitor', {
            templateUrl: 'views/monitor/dashboard.html',
            controller: 'monitor.controller'
        }).when('/views/:viewId', { // 其他view都是crud
            templateUrl: 'views/crud.html',
            controller: 'table.CRUD.controller'
        }).otherwise({
            redirectTo: '/views/login'
        });
    }])

    .controller('myLoginCtrl', ['$log', '$scope', function($log, $scope) {
        $scope.$on('$viewContentLoaded', function() {
            angular.element('.carousel').carousel();
        });
    }])

    .controller('myChangePasswordCtrl', ['$log', '$scope', function($log, $scope) {
        $scope.$on('$viewContentLoaded', function() {
            angular.element('.carousel').carousel();
        });
    }])

    .controller('monitor.controller', ['$log', '$scope', '$timeout', 'myServer', function($log, $scope, $timeout, myServer) {
        $scope.clusters = []; // 一定要初始化, 否则用代码选择某tab不灵
        myServer.errorDialog($scope, "monitor");
        var promise = myServer.call("monitor?sessionId=" + $scope.$root.sessionId, {}, 'GET'); // 同步调用，获得承诺接口
        promise.then(function(ret) { // 调用承诺API获取数据 .resolve
            if (ret.status == 200 || ret.status == 201) {
                $scope.clusters = ret.data;
                if ($scope.clusters.length > 0) {
                    angular.element.each($scope.clusters, function (n, ele) {
                        ele.displayPoints = 9; // 显示点数
                        ele.tickInterval = 0; // 刷新间隔, 0 - 不刷新
                        ele.displayMax = true; // 不最大化
                        ele.lastPoint = 0; // 最后点位(序号)
                        ele.transactions = []; // 交易量
                        ele.links = []; // 连接数
                        ele.inbounds = []; // 流入饼图
                        ele.outbounds = []; // 流出饼图
                        ele.exchangeQuantity = []; // 交易量数据
                        ele.linkQuantity = []; // 连接数数据
                    });
                    $scope.activeCluster = $scope.clusters[0];
                    $scope.clusters.activeTab = $scope.activeCluster.cluster.name; // 一定要放在里面, 否则用代码选择某tab不灵
                    $scope.updateQuantities($scope.activeCluster.cluster.id);
                    $scope.$watch('clusters.activeTab', function(newValue, oldValue) {
                        // $log.info("old: " + oldValue + ' == ' + "new: " + newValue);
                        if (oldValue != newValue) {
                            angular.element.each($scope.clusters, function (n, ele) {
                                if (ele.cluster.name == newValue) {
                                    $scope.activeCluster = ele;
                                    if (angular.isDefined($scope.theTimer))
                                        $timeout.cancel($scope.theTimer);
                                    $scope.updateQuantities($scope.activeCluster.cluster.id);
                                }
                            });
                        }
                    }, true);
                    if ($scope.activeCluster.hosts.length > 0)
                        $scope.activeCluster.hosts.forEach(function(host){
                            host.occupys = [];
                            host.occupys.cpu = [];
                            host.occupys.memory = [];
                        });
                    if ($scope.activeCluster.groups.length > 0)
                        $scope.activeCluster.groups.forEach(function(group){
                            if (group.machines.length > 0)
                                group.machines.forEach(function(machine){
                                    machine.occupys = [];
                                    machine.occupys.percent = [];
                                });
                        });
                }
            }
        }, function(ret) { // 处理错误 .reject
            $scope.showModal(ret)
        });
        $scope.toggleDetails = function(ele) {
            if (angular.isDefined(ele.displayDetails))
                ele.displayDetails = !ele.displayDetails;
            else
                ele.displayDetails = true;
        };
        $scope.getOccupyAndToggleDetails = function(ele, object, objectId) {
            // toggle details
            if (angular.isDefined(ele.displayOccupy))
                ele.displayOccupy = !ele.displayOccupy;
            else {
                ele.displayOccupy = true;
                $scope.getOccupy(ele.occupys, object, objectId);
            }
        };
        $scope.getOccupy = function(occupys, object, objectId) {
            // get occupy
            var uri = "occupy/" + object + "/" + objectId + "/" + $scope.activeCluster.displayPoints + "/" + $scope.activeCluster.lastPoint;
            var promise3 = myServer.call(uri + "?sessionId=" + $scope.$root.sessionId, {}, 'GET'); // 同步调用，获得承诺接口
            promise3.then(function(ret) {
                if (ret.status == 200 || ret.status == 201) {
                    if (object == "node")
                        occupys.cpu = [{
                            label: "CPU(%)",
                            data: updateOccupy([], ret.data.occupys, object + ".cpu"),
                            lines: {show: true},
                            points: {show: true},
                            color: '#5bc0de'
                        }];
                    occupys.memory = [{
                        label: "系统剩余内存(MB)",
                        data: updateOccupy([], ret.data.occupys, object + ".osmemory"),
                        lines: {show: true},
                        points: {show: true},
                        color: '#5bc0de'
                    },
                        {
                            label: "应用占用内存(MB)",
                            data: updateOccupy([], ret.data.occupys, object + ".appmemory"),
                            lines: {show: true},
                            points: {show: true},
                            color: '#AAAAAA'
                        }];
                    if (object == "machine")
                        occupys.percent = [{
                            label: "CPU(%)",
                            data: updateOccupy([], ret.data.occupys, object + ".cpu"),
                            lines: {show: true},
                            points: {show: true},
                            color: '#5bc0de'
                        },
                            {
                                label: "MEM(%)",
                                data: updateOccupy([], ret.data.occupys, object + ".memory"),
                                lines: {show: true},
                                points: {show: true},
                                color: '#AAAAAA'
                            }];
                }
            });
        };
        function pieLabelFormatter(label, series) {
            return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
        }
        // jquery.flot.pie.js: 536行 ... if (options.series.pie.innerRadius > 0) { ... 需要加上options != null条件
        $scope.optionsPie = {
            series: {
                pie: {
                    show: true,
                    innerRadius: 0,
                    radius: 7/8,
                    label: {
                        show: true,
                        radius: 3/5,
                        formatter: pieLabelFormatter,
                        threshold: 0.1
                    }
                }
            },
            legend: { show: false }
        };
        $scope.options = {
            series: {
                shadowSize: 0
            },
            xaxis: {
                mode: 'categories',
                tickLength: 0
            },
            grid: {
                backgroundColor: { colors: [ "#fff", "#eee" ] },
                borderWidth: {
                    top: 1,
                    right: 1,
                    bottom: 2,
                    left: 2
                }
            }
        };
        $scope.toggleMax = function() {
            $scope.activeCluster.displayMax = !$scope.activeCluster.displayMax;
            var e = angular.element('#tpsDraw');
            var plotArea = angular.element(e.children()[0]);
            var h = $scope.activeCluster.displayMax ? '200px' : '500px';
            plotArea.css({
                height: h
            });
            if ($scope.activeCluster.displayMax) {
                $scope.activeCluster.exchangeQuantity = updateTps($scope.activeCluster.exchangeQuantity, []);
                // $log.info("tps-post: " + JSON.stringify($scope.activeCluster.exchangeQuantity));
            }
        };
        function updateOccupy(data, newData, type) {
            var myPoints = 10;
            switch (type) {
                case "node.cpu" :
                    return analyOccupy(data, newData, "node", "cpuPercent");
                case "node.osmemory" :
                    return analyOccupy(data, newData, "node", "osFreeMemory");
                case "node.appmemory" :
                    return analyOccupy(data, newData, "node", "heapUsed");
                case "machine.cpu" :
                    return analyOccupy(data, newData, "machine", "cpuPercent");
                case "machine.memory" :
                    return analyOccupy(data, newData, "machine", "memoryPercent");
                default :
                    return []
            }
            function analyOccupy(data, newData, entity, value) {
                if (newData.length < myPoints) {
                    data.length = 0; // clear data
                    angular.element.each(newData, function (n, ele) {
                        data.push([ele.gatherDatetime, getValue(ele, entity, value)]);
                    });
                } else {
                    while (data.length >= myPoints)
                        data = data.slice(1);
                    angular.element.each(newData, function (n, ele) {
                        /* if newData have 10 rows data have 5 rows and data only need 2 rows
                         then we should push newData[9] and newData[10]
                         so 'IF' condition is : newData.length - n == myPoints - data.length - 1
                         => n == newData.length - (myPoints - data.length - 1)*/
                        if (n == (newData.length - (myPoints - data.length - 1)))
                            data.push([ele.gatherDatetime, getValue(ele, entity, value)]);
                    });
                }
                return data;
                function getValue (ele, entity, value){
                    if (value in ele)
                        if (value.toUpperCase().indexOf("MEM") >= 0 || value == "heapUsed")
                            return ele[value]/1024;
                        else
                            return ele[value];
                    else
                        if (value == "memoryPercent" && entity == "machine")
                            return (ele["usedMemory"]*100/(ele["usedMemory"]+ele["freeMemory"])).toFixed(2);
                        else
                            return "";
                }
            }
        }
        function updateTps(data, newData) {
            var myPoints = $scope.activeCluster.displayMax ? $scope.activeCluster.displayPoints : $scope.activeCluster.displayPoints * 3;
            while (data.length >= myPoints)
                data = data.slice(1);
            angular.element.each(newData, function (n, ele) {
                if (data.length < myPoints) {
                    data.push([ele.datetime, ele.sum]);
                    if ($scope.activeCluster.lastPoint < ele.seqNo)
                        $scope.activeCluster.lastPoint = ele.seqNo;
                }
            });
            return data;
        }
        function updateLnks(data, newData) {
            var dataX = updateTps(data, newData);
            var myPoints = $scope.activeCluster.displayPoints / 3 * 2;
            while (dataX.length > myPoints)
                dataX = dataX.slice(1);
            return dataX;
        }
        function updateNodes(nodes, newData) {
            angular.element.each(newData, function (n, ele) {
                angular.element.each(nodes, function (n2, ele2) {
                    if (ele.hostId == ele2.id) {
                        ele2.osFreeMemory = ele.osFreeMemory;
                        ele2.cpuPercent = ele.cpuPercent;
                        ele2.heapUsed = ele.heapUsed;
                        ele2.alarmLevel = ele.alarmLevel;
                    }
                });
            });
            return nodes;
        }
        function updateMachines(groups, newData) {
            angular.element.each(newData, function (n, ele) {
                angular.element.each(groups, function (n2, ele2) {
                    if (ele.groupId == ele2.group.id) {
                        angular.element.each(ele2.machines, function (n3, ele3) {
                            if (ele.machineId == ele3.ready.id) {
                                ele3.osFreeMemory = ele.freeMemory;
                                ele3.cpuPercent = ele.cpuPercent;
                                ele3.heapUsed = ele.usedMemory;
                                ele3.alarmLevel = ele.alarmLevel;
                            }
                        });
                    }
                });
            });
            return groups;
        }
        $scope.updateQuantities = function(clusterId, i) {
            if (angular.isDefined(i))
                $scope.activeCluster.tickInterval = i;
            var uri = "statistics/" + $scope.activeCluster.cluster.id + "/" + $scope.activeCluster.displayPoints + "/" + $scope.activeCluster.lastPoint;
            var promise2 = myServer.call(uri + "?sessionId=" + $scope.$root.sessionId, {}, 'GET'); // 同步调用，获得承诺接口
            promise2.then(function(ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    $scope.activeCluster.exchangeQuantity = updateTps($scope.activeCluster.exchangeQuantity, ret.data.exchanges);
                    $scope.activeCluster.linkQuantity = updateLnks($scope.activeCluster.linkQuantity, ret.data.links);
                    $scope.activeCluster.hosts = updateNodes($scope.activeCluster.hosts, ret.data.nodes);
                    $scope.activeCluster.groups = updateMachines($scope.activeCluster.groups, ret.data.machines);
                    $scope.activeCluster.connections = ret.data.connections;
                    $scope.activeCluster.inbounds = ret.data.apps;
                    $scope.activeCluster.outbounds = ret.data.groups;
                    $scope.activeCluster.transactions = [ {label: "TPS", data: $scope.activeCluster.exchangeQuantity, lines: { show: true }, points: { show: true }, color: '#5bc0de'} ];
                    $scope.activeCluster.links = [ {label: "连接数", data: $scope.activeCluster.linkQuantity, color: '#8a6d3b', lines: { show: true, steps: true, fill: true }} ];

                    $scope.activeCluster.hosts.forEach(function(node){
                        if (node.displayOccupy) {
                            $scope.getOccupy(node.occupys, 'node', node.id);
                        }
                    });
                    $scope.activeCluster.groups.forEach(function(group){
                        group.machines.forEach(function(machine){
                            if (machine.displayOccupy) {
                                $scope.getOccupy(machine.occupys, 'machine', machine.ready.id);
                            }
                        });
                    });
                    if ($scope.activeCluster.tickInterval > 0) {
                        if (angular.isDefined($scope.theTimer))
                            $timeout.cancel($scope.theTimer);
                        $scope.theTimer = $timeout($scope.updateQuantities, $scope.activeCluster.tickInterval * 1000);
                    }
                }
            }, function(ret) { // 处理错误 .reject
                $scope.showModal(ret)
            });
        };
        // jquery.flot.pie.js里536行: if (options.series.pie.innerRadius > 0) {
        // 改为: if (options && options.series.pie.innerRadius > 0) { 免得老提示错(虽然无影响) -- 新版本已修复该问题, 勿需修改了.
        // TODO: 图 - 失败率, 失败分布, 内存/CPU(已取数)
    }])

    .controller('myAboutCtrl', ['myOptions', '$log', '$scope', function(myOptions, $log, $scope) {
    }])

    .controller('table.CRUD.controller', ['$log', '$rootScope', '$scope', '$location', 'myServer', 'myOptions', function($log, $rootScope, $scope, $location, myServer, myOptions) {
        var path = $location.path();
        var tableId = path.substring(7);
        var pos = tableId.indexOf('.');
        if (pos > 0)
            tableId = tableId.substring(0, pos);
        var ctrl = myOptions.findController(tableId);
        var title = tableId + '管理';
        var params = {};
        if (angular.isDefined(ctrl)) {
            title = ctrl.title;
            if (angular.isDefined(ctrl.setParams) && pos > 0)
                ctrl.setParams($log, $rootScope, $scope, params);
        }
        myServer.crud($scope, tableId, title);
        $scope.query(params);
        if (angular.isDefined(ctrl)) {
            if (angular.isDefined(ctrl.controller))
                ctrl.controller($log, $rootScope, $scope, myServer);
        }
    }])

    .controller('todoCheckCtrl', ['$log', '$rootScope', '$scope', 'myServer', 'myOptions', function($log, $rootScope, $scope, myServer, myOptions) {
        myServer.crud($scope, "JournalBiz", '待办事项', myServer.journals);
        $scope.qry.status = 0;
        $scope.query($scope.qry);
        myServer.retrieveMenuTree($scope);
        myServer.retrieveRoleList($scope);
        myServer.retrieveGroupList($scope);
        $rootScope.detailPanels = [];
        $rootScope.detailPageIDs = {check: 0};
        $scope.showRowDetails = function(rec, idx) {
            $scope.selectedRec = rec;
            $scope.selectedIndex = idx;
            $scope.lock = true;
            $scope.lockKeyAbout = true;
            $scope.ref = [];
            $scope.opType = rec.opType;
            $scope.rec = rec.rec;
            $scope.recStatus = rec.status;
            $scope.bak = rec.bak;
            var chosenPanel = $rootScope.detailPageIDs[rec.table];
            if (angular.isUndefined(chosenPanel)) {
                var page = 'views/' + rec.table + '/edit.html';
                $rootScope.detailPanels.push('views/' + rec.table + '/edit.html');
                $rootScope.detailPageIDs[rec.table] = chosenPanel = $rootScope.detailPanels.length;
            }
            $scope.crudPanels.activePanel = chosenPanel;
        };
        $scope.authorize = function(ele, action, status) {
            var uri = "authorize/" + $scope.selectedRec.seq + "/" + action + "?sessionId=" + $rootScope.sessionId;
            var promise = myServer.call(uri, {}); // 同步调用，获得承诺接口
            promise.then(function (ret) {  // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    ele.status = status;
                    $scope.crudPanels.activePanel = 0;
                    var ctrl = myOptions.findController($scope.selectedRec.table);
                    if (angular.isDefined(ctrl) && angular.isDefined(ctrl.postChecked)) {
                        ctrl.postChecked($log, $rootScope, $scope, myServer);
                    }
                }
            }, function (ret) {  // 处理错误 .reject
                $scope.authorizeState = false;
                $scope.showModal(ret);
            });
        };
        $scope.authorizeX = function(action, status) {
            $scope.authorizeState = true;
            angular.element.each($scope.recs, function(n, ele) {
                if (angular.isDefined(ele.chosen) && ele.chosen) {
                    $scope.selectedRec = ele;
                    $scope.authorize(ele, action, status);
                    if ($scope.authorizeState) { $scope.showTips('复核操作成功') }
                }
            });
        };
    }])
    .controller('myDeployCtrl', ['$location', '$scope', '$rootScope', 'myServer', '$log', function($location, $scope, $rootScope, myServer, $log) {
        myServer.crud($scope, "Deploy", '部署');
        $scope.rec = {"confCreated": false};
        myServer.errorDialog($scope, "deploy");
        myServer.retrieveClusterList($scope);
        $scope.doDeploy = function(rqData) {
            var promise = myServer.call("deploy", rqData); // 同步调用，获得承诺接口
            $log.info("initData:" + JSON.stringify(rqData));
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                $log.info("deploy --> ok: " + ret);
                if (ret.status == 200 || ret.status == 201) {
                    $scope.rec.confCreated = true;
                    $scope.rec.hxConf = "hxHSM-" + $scope.rec.clusterId + ".conf";
                    $scope.rec.bdbConf = "hxHSM-bdb-" + $scope.rec.clusterId + ".conf";
                    $scope.rec.bdbTar = "hxHSM-bdb-" + $scope.rec.clusterId + ".tar.gz";
                }
            }, function(ret) { // 处理错误 .reject
                $log.info("deploy --> fail: " + ret);
                $scope.showModal(ret)
            });
        };
    }]);