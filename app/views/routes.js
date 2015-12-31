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
        }).when('/views/about', {
            templateUrl: 'views/about.html',
            controller: 'myAboutCtrl'
        }).when('/views/check', {
            templateUrl: 'views/Todo/check.html',
            controller: 'todoCheckCtrl'
        }).when('/views/deploy', {
            templateUrl: 'views/deploy.html',
            controller: 'DeployCtrl'
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

    .controller('myDeployCtrl', ['$log', '$scope', function($log, $scope) {
    }])

    .controller('monitor.controller', ['$log', '$scope', '$timeout', 'myServer', function($log, $scope, $timeout, myServer) {
        $scope.activeClusterTab = '';
        myServer.errorDialog($scope, "monitor");
        var promise = myServer.call("monitor", {sessionId: $scope.$root.sessionId}, 'GET'); // 同步调用，获得承诺接口
        promise.then(function(ret) { // 调用承诺API获取数据 .resolve
            if (ret.status == 200 || ret.status == 201) {
                $scope.clusters = ret.data;
                if ($scope.clusters.length > 0) {
                    $scope.activeClusterTab = $scope.clusters[0].name;
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
        function pieLabelFormatter(label, series) {
            return "<div style='font-size:8pt; text-align:center; padding:2px; color:white;'>" + label + "<br/>" + Math.round(series.percent) + "%</div>";
        }
        $scope.optionsPie = {
            series: {
                pie: {
                    show: true,
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
        var displayPoints = 15;
        $scope.lastPoint = 0;
        $scope.transactions = [];
        $scope.inbounds = [];
        $scope.outbounds = [];
        var exchangeQuantity = [];
        var linkQuantity = [];
        function update1(data, newData) {
            if (data.length >= displayPoints)
                data = data.slice(1);
            angular.element.each(newData, function (n, ele) {
                $log.info("ele: " + JSON.stringify(ele));
                $log.info("data.len: " + data.length + ', ' + displayPoints);
                if (data.length < displayPoints) {
                    data.push([ele.seqNo, ele.sum]);
                    $scope.lastPoint = ele.seqNo;
                }
            });
        }
        $scope.updateQuantities = function() {
            var promise2 = myServer.call("statistics/" + displayPoints + "/" + $scope.lastPoint, {sessionId: $scope.$root.sessionId}, 'GET'); // 同步调用，获得承诺接口
            promise2.then(function(ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    update1(exchangeQuantity, ret.data.exchanges);
                    update1(linkQuantity, ret.data.links);
                    $scope.inbounds = ret.data.apps;
                    $scope.outbounds = ret.data.groups;
                    $scope.transactions = [
                        {label: "TPS", data: exchangeQuantity, lines: { show: true }, points: { show: true }, color: '#5bc0de'},
                        {label: "连接数", data: linkQuantity, color: '#8a6d3b', lines: { show: true, steps: true, fill: true }}
                    ];
                    $log.info("data: " + JSON.stringify(exchangeQuantity));
                    $log.info("last: " + $scope.lastPoint);
                }
            }, function(ret) { // 处理错误 .reject
                $scope.showModal(ret)
            });
        };
        $scope.updateQuantity = function() {
            var d31 = $scope.retrieveQuantity(d3, 15);
            var d41 = $scope.retrieveQuantityX(d4, 15);
            $scope.dataset = [
                {label: "TPS", data: d31, lines: { show: true }, points: { show: true }, color: '#5bc0de'},
                {label: "连接数", data: d41, color: '#8a6d3b', lines: { show: true, steps: true, fill: true }}
            ];
            //$timeout($scope.updateQuantity, 5000);
        };
        $scope.$on('$viewContentLoaded', function() {
            $scope.updateQuantities();
        });
        // TODO: 图 - 失败率, 失败分布, 内存/CPU
        // TODO: 文字 - 重连
    }])

    .controller('myAboutCtrl', ['myOptions', '$log', '$scope', function(myOptions, $log, $scope) {
        $scope.user11 = {name: 'guest', last: 'visitor'};
        $scope.formName = 'f1';
        $scope.itemNum = 0;
        $scope.itemName = function() {
            $scope.itemNum += 1;
            return 'item' + $scope.itemNum;
        };
        $scope.isEmpty = function(e) {
            if (angular.isDefined(e)) {
                $log.info("show----" + e);
                return ''+e == '';
            } else
                return true;
        };
    }])

    .controller('table.CRUD.controller', ['$log', '$rootScope', '$scope', '$location', 'myServer', 'myOptions', function($log, $rootScope, $scope, $location, myServer, myOptions) {
        $scope.$on('$viewContentLoaded', function() {
            $log.info("event: view-reloaded");
        });
        $scope.$on('$includeContentLoaded', function(e) {
            $log.info("event: include-reloaded: " + e.targetScope.$parent.$parent.tableId);
        });
        var path = $location.path();
        var tableId = path.substring(7);
        var ctrl = myOptions.findController(tableId);
        var title = angular.isDefined(ctrl) ? ctrl.title : tableId + '管理';
        myServer.crud($scope, tableId, title);
        $scope.query();
        if (angular.isDefined(ctrl)) {
            if (angular.isDefined(ctrl.controller))
                ctrl.controller($log, $rootScope, $scope, myServer);
        }
    }])

    .controller('todoCheckCtrl', ['$log', '$rootScope', '$scope', 'myServer', 'myOptions', function($log, $rootScope, $scope, myServer, myOptions) {
        myServer.crud($scope, "Journal", '待办事项', myServer.journals);
        $scope.qry.status = 0;
        $scope.query($scope.qry);
        myServer.retrieveMenuTree($scope);
        myServer.retrieveRoleList($scope);
        myServer.retrieveGroupList($scope);
        $rootScope.detailPanels = [];
        $rootScope.detailPageIDs = {check: 0};
        $scope.showRowDetails = function(rec, idx) {
            $log.info("show editor ... " + idx + ': ' + rec.table);
            $log.info('journal-page: ' + $scope.crudPanels.activePanel);
            $scope.selectedRec = rec;
            $scope.selectedIndex = idx;
            $scope.lock = true;
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
        $scope.authorize = function(action, status) {
            var uri = "authorize/" + $scope.selectedRec.seq + "/" + action + "?sessionId=" + $rootScope.sessionId;
            var promise = myServer.call(uri, {}); // 同步调用，获得承诺接口
            promise.then(function (ret) {  // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    $scope.selectedRec.status = status;
                    $scope.crudPanels.activePanel = 0;
                }
            }, function (ret) {  // 处理错误 .reject
                $scope.showModal(ret);
            });
        };
        $scope.authorizeX = function(action, status) {
            angular.element.each($scope.recs, function(n, ele) {
                if (angular.isDefined(ele.chosen) && ele.chosen) {
                    $scope.selectedRec = ele;
                    $scope.authorize(action, status);
                }
            });
        };
    }])
    .controller('DeployCtrl', ['$location', '$scope', '$rootScope', 'myServer', '$log', function($location, $scope, $rootScope, myServer, $log) {
        myServer.errorDialog($scope, "initData");
        myServer.confirmDialog($scope,"initData")
        $scope.doDeploy = function(initData) {
            var promise = myServer.call("deploy", initData); // 同步调用，获得承诺接口
            $log.info("initData:"+initData)
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                $log.info("deploy --> ok: " + ret);
                if (ret.status == 200 || ret.status == 201) {
                    $scope.confirmModal(ret)
                    $location.path("views/check").replace();
                }
            }, function(ret) { // 处理错误 .reject
                $log.info("deploy --> fail: " + ret)
                $scope.showModal(ret)
            });
        };
    }]);