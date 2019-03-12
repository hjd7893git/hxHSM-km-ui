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
        }).when('/views/notic', {
            templateUrl: 'views/Todo/notic.html',
            controller: 'todoNoticCtrl'
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


    .controller('monitor.controller', ['$log', '$scope', '$timeout', 'myServer', function ($log, $scope, $timeout, myServer) {
        $scope.clusters = []; // 一定要初始化, 否则用代码选择某tab不灵
        myServer.errorDialog($scope, "monitor");
        var promise = myServer.call("monitor?sessionId=" + $scope.$root.sessionId, {}, 'GET'); // 同步调用，获得承诺接口
        promise.then(function (ret) { // 调用承诺API获取数据 .resolve
            if (ret.status == 200 || ret.status == 201) {
                $scope.clusters = ret.data;
                if ($scope.clusters.length > 0) {
                    angular.element.each($scope.clusters, function (n, ele) {
                        ele.displayPoints = 7; // 显示点数
                        ele.tickInterval = 0; // 刷新间隔, 0 - 不刷新
                        ele.displayMax = true; // 不最大化
                        ele.lastPoint = 0; // 最后点位(序号)
                        ele.transactions = []; // 交易量
                        ele.links = []; // 连接数
                        ele.inbounds = []; // 流入饼图
                        ele.outbounds = []; // 流出饼图
                        ele.exchangeQuantity = []; // 交易量数据
                        ele.linkQuantity = []; // 连接数数据
                        ele.history = 0;
                        ele.dataTime = [];
                        ele.tps = [];
                        ele.linkH = [];
                        ele.hti = 0;
                        ele.startTime = 0;
                        ele.endTime = 0;
                        ele.historyDate = '';
                        ele.pagex = 0;
                        // ele.endDate = 0;
                    });
                    $scope.activeCluster = $scope.clusters[0];
                    $scope.clusters.activeTab = $scope.activeCluster.cluster.name; // 一定要放在里面, 否则用代码选择某tab不灵
                    $scope.updateQuantities($scope.activeCluster.cluster.id);
                    $scope.$watch('clusters.activeTab', function (newValue, oldValue) {
                        // $log.info("old: " + oldValue + ' == ' + "new: " + newValue);
                        var tc = 0
                        if (oldValue != newValue) {
                            angular.element.each($scope.clusters, function (n, ele) {
                                if (ele.cluster.name == oldValue) {
                                    if (ele.history == 1) tc = 1;
                                    if (ele.history == 0) tc = 2;

                                }
                            })
                            angular.element.each($scope.clusters, function (n, ele) {
                                if (ele.cluster.name == newValue) {
                                    if (angular.isDefined($scope.theTimer))
                                        $timeout.cancel($scope.theTimer);
                                    $scope.activeCluster = ele;
                                    if (tc == 1) {
                                        $scope.activeCluster.hti = 1;
                                        $scope.activeCluster.history = 1;
                                        $scope.option2.series[0].markPoint.data = [];
                                        $scope.activeCluster.startTime = 0;
                                        $scope.activeCluster.endTime = 0;
                                        $scope.activeCluster.lastPoint = 0;
                                        document.getElementById("hd").value = '';
                                    }
                                    if (tc == 2) {
                                        $scope.activeCluster.hti = 0;
                                        $scope.activeCluster.history = 0;
                                    }
                                    $scope.updateQuantities($scope.activeCluster.cluster.id);
                                }

                            });
                        }
                    }, true);
                    if ($scope.activeCluster.hosts.length > 0)
                        $scope.activeCluster.hosts.forEach(function (host) {
                            host.occupys = [];
                            host.occupys.cpu = [];
                            host.occupys.memory = [];
                        });
                    if ($scope.activeCluster.groups.length > 0)
                        $scope.activeCluster.groups.forEach(function (group) {
                            if (group.machines.length > 0)
                                group.machines.forEach(function (machine) {
                                    machine.occupys = [];
                                    machine.occupys.percent = [];
                                });
                        });
                }
            }
        }, function (ret) { // 处理错误 .reject
            $scope.showModal(ret)
        });
        $scope.toggleDetails = function (ele) {
            if (angular.isDefined(ele.displayDetails))
                ele.displayDetails = !ele.displayDetails;
            else
                ele.displayDetails = true;
        };
        $scope.getOccupyAndToggleDetails = function (ele, object, objectId) {
            // toggle details
            if (angular.isDefined(ele.displayOccupy)) {
                ele.displayOccupy = !ele.displayOccupy;
                if (ele.displayOccupy)
                    $scope.getOccupy(ele.occupys, object, objectId);
            }
            else {
                ele.displayOccupy = true;
                $scope.getOccupy(ele.occupys, object, objectId);
            }
        };
        $scope.getOccupy = function (occupys, object, objectId) {
            // get occupy
            var uri = "occupy/" + object + "/" + objectId + "/" + $scope.activeCluster.displayPoints + "/" + $scope.activeCluster.lastPoint + "/" + $scope.activeCluster.history;
            var promise3 = myServer.call(uri + "?sessionId=" + $scope.$root.sessionId, {}, 'GET'); // 同步调用，获得承诺接口
            promise3.then(function (ret) {
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
                    radius: 7 / 8,
                    label: {
                        show: true,
                        radius: 3 / 5,
                        formatter: pieLabelFormatter,
                        threshold: 0.1
                    }
                }
            },
            legend: {show: false}
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
                backgroundColor: {colors: ["#fff", "#eee"]},
                borderWidth: {
                    top: 1,
                    right: 1,
                    bottom: 2,
                    left: 2
                }
            }
        };
        $scope.toggleMax = function () {
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
                function getValue(ele, entity, value) {
                    if (value in ele)
                        if (value.toUpperCase().indexOf("MEM") >= 0 || value == "heapUsed")
                            return ele[value] / 1024;
                        else
                            return ele[value];
                    else if (value == "memoryPercent" && entity == "machine")
                        return (ele["usedMemory"] * 100 / (ele["usedMemory"] + ele["freeMemory"])).toFixed(2);
                    else
                        return "";
                }
            }
        }

        function updateTps(data, newData) { //限制
            var myPoints = $scope.activeCluster.displayMax ? $scope.activeCluster.displayPoints : $scope.activeCluster.displayPoints * 3;
            if ($scope.activeCluster.pr) {
                data = [];
            }
            while (data.length >= myPoints)
                data = data.slice(1); //数据图形往后挪动，空出一个新位置
            angular.element.each(newData, function (n, ele) {
                if (data.length < myPoints) {
                    data.push([ele.datetime, ele.sum]);//更新新数据，添加新的数据
                    if ($scope.activeCluster.lastPoint < ele.seqNo) {
                        $scope.activeCluster.lastPoint = ele.seqNo;
                    }
                }
            });
            console.log(data.toString())
            return data;
        }

        function updateLnks(datax, newDatax) {
            var dataX = updateTps(datax, newDatax);
            var myPoints = $scope.activeCluster.displayPoints / 2 * 2;
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
                        ele2.status = ele.status;
                    }
                });
            });
            var ci = $scope.unsHid(nodes, newData)
            angular.element.each(ci, function (n, ele3) {
                ele3.status = 2;
                ele3.alarmLevel = 2;
                ele3.osFreeMemory = "";
                ele3.cpuPercent = "";
                ele3.heapUsed = "";
            })


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
                                ele3.ready.status = ele.status;
                            }
                        });
                    }
                });
            });
            var ci = $scope.unsMid(groups, newData)
            angular.element.each(ci, function (n, elec) {
                angular.element.each(elec.machines, function (n4, ele4) {
                    ele4.osFreeMemory = "";
                    ele4.cpuPercent = "";
                    ele4.heapUsed = "";
                    ele4.alarmLevel = 2;
                    ele4.ready.status = 2;
                })
            })
            return groups;
        }

        $scope.unsMid = function (v1, v2) {
            var v3 = [];
            for (var i = 0; i < v1.length; i++) {
                var flag = true;
                for (var j = 0; j < v2.length; j++) {
                    if (v1[i].group.id == v2[j].groupId)
                        flag = false;
                }
                if (flag)
                    v3.push(v1[i]);
            }
            return v3;
        }
        $scope.unsHid = function (v1, v2) {
            var v3 = [];
            for (var i = 0; i < v1.length; i++) {
                var flag = true;
                for (var j = 0; j < v2.length; j++) {
                    if (v1[i].id == v2[j].hostId)
                        flag = false;
                }
                if (flag)
                    v3.push(v1[i]);
            }
            return v3;
        }
        $scope.updateSwitch = function (clusterId) {
            var uri = "switch"
            var promiseSwitch = myServer.call(uri + "?sessionId=" + $scope.$root.sessionId, {}, 'POST'); // 同步调用，获得承诺接口
            promiseSwitch.then(function (ret) {
                if (ret.status == 200 || ret.status == 201) {
                    $scope.switche = ret.data;
                }
            })
        }
        $scope.historyTag = function (clusters) {
            if (angular.isDefined(clusters.fm)) {
                clusters.fm = !clusters.fm;
                if (clusters.fm) { //开启
                    $scope.activeCluster.hti = 1;
                    $scope.activeCluster.history = 1;
                    $scope.activeCluster.lastPoint = 0;
                    $scope.activeCluster.tickInterval = 0
                    $scope.updateQuantities(clusters.id);
                } else { //关闭
                    $scope.activeCluster.history = 0;
                    $scope.activeCluster.hti = 2;
                    $scope.activeCluster.tickInterval = 0
                    $scope.activeCluster.lastPoint = 0;
                    $scope.activeCluster.startTime = 0;
                    $scope.activeCluster.endTime = 0;
                    document.getElementById("hd").value = '';
                    $scope.option4.series.forEach(function (e) {
                        e.data = [];
                    })
                    $scope.updateQuantities(clusters.id);
                }
            }
            else { //开启
                clusters.fm = true;
                $scope.activeCluster.hti = 1;
                $scope.activeCluster.history = 1;
                $scope.activeCluster.lastPoint = 0;
                $scope.activeCluster.tickInterval = 0
                $scope.updateQuantities(clusters.id);
            }
        }

        $scope.updateHistoryDate = function (clusters, page) {
            var ist = document.getElementById("hd").value;
            if (ist != '' && ist != ' ') {
                $scope.activeCluster.pagex = 0;
                if (angular.isDefined(page)) {
                    if (page == "←") $scope.activeCluster.pagex = 2;
                    if (page == "→") $scope.activeCluster.pagex = 1;
                }
                clusters.fm = true;
                $scope.activeCluster.hti = 1;
                $scope.activeCluster.history = 1;
                $scope.activeCluster.lastPoint = 0;
                $scope.option2.series[0].markPoint.data = [];
                $scope.activeCluster.startTime = ist.replace(new RegExp(/(:|\/| )/g), '');
                $scope.activeCluster.endTime = $scope.activeCluster.startTime;
                $scope.shuju.clear();
                $scope.updateQuantities(clusters.id)
            }
        }


        $scope.updateQuantities = function (clusterId, i) {
            if (angular.isDefined(i))
                $scope.activeCluster.tickInterval = i;
            var m = $scope.activeCluster.historyDate
            var uri = "statistics/" + $scope.activeCluster.cluster.id + "/" + $scope.activeCluster.displayPoints + "/" + $scope.activeCluster.lastPoint + "/" + $scope.activeCluster.tickInterval + "/"
                + $scope.activeCluster.history + "/" + $scope.activeCluster.hti + "/" + $scope.activeCluster.startTime + "/" + $scope.activeCluster.endTime + "/" + $scope.activeCluster.pagex;
            var promise2 = myServer.call(uri + "?sessionId=" + $scope.$root.sessionId, {}, 'GET'); // 同步调用，获得承诺接口
            promise2.then(function (ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    $scope.activeCluster.pr = ret.data.pr;
                    if ($scope.activeCluster.hti == 1) {
                        var td = '';
                        var tr = false
                        $scope.activeCluster.dataTime = [];
                        $scope.activeCluster.tps = [];
                        ret.data.exchanges.forEach(function (e) {
                            if (angular.isDefined(e.allDatetime)) {
                                if (td.indexOf("->") != -1 && tr) {
                                    tr = false;
                                    td = e.allDatetime.substring(0, 4) + "/" + e.allDatetime.substring(4, 6) + "/" + e.allDatetime.substring(6, 8) + " " + e.allDatetime.substring(8, 10) + ":" + e.allDatetime.substring(10, 12) + ":" + e.allDatetime.substring(12, 14);
                                    $scope.option2.series[0].markPoint.data.push({
                                        name: '服务节点重连',
                                        value: 100,
                                        xAxis: td,
                                        yAxis: 0
                                    })
                                }
                                td = e.allDatetime.substring(0, 4) + "/" + e.allDatetime.substring(4, 6) + "/" + e.allDatetime.substring(6, 8) + " " + e.allDatetime.substring(8, 10) + ":" + e.allDatetime.substring(10, 12) + ":" + e.allDatetime.substring(12, 14);
                                $scope.activeCluster.dataTime.push(td);
                                $scope.activeCluster.tps.push(e.sum);
                                // $scope.activeCluster.linkH.push(e.l)
                            }
                            else {
                                if (td.indexOf("->") == -1) {
                                    tr = true;
                                    $scope.activeCluster.dataTime.push(td + " ");
                                    $scope.activeCluster.tps.push(0);
                                    $scope.option2.series[0].markPoint.data.push({
                                        name: '服务节点断开', value: 100, xAxis: td + " ", yAxis: 0
                                    })
                                    td = td + "->";
                                }
                            }
                        })
                        $scope.settingAll();
                        $scope.smm($scope.activeCluster.cluster.id);
                        document.getElementById("hd").value = angular.isDefined($scope.activeCluster.dataTime[0]) ? $scope.activeCluster.dataTime[0] : '';
                    }
                    document.getElementById("info").innerHTML = angular.isDefined(ret.data.noInfo) ? ret.data.noInfo : 'loading...';
                    $scope.activeCluster.hti = 0;
                    $scope.activeCluster.exchangeQuantity = updateTps($scope.activeCluster.exchangeQuantity, ret.data.exchanges);
                    $scope.activeCluster.linkQuantity = updateLnks($scope.activeCluster.linkQuantity, ret.data.links);
                    $scope.activeCluster.hosts = updateNodes($scope.activeCluster.hosts, ret.data.nodes);
                    $scope.activeCluster.groups = updateMachines($scope.activeCluster.groups, ret.data.machines);
                    $scope.activeCluster.connections = ret.data.connections;
                    $scope.activeCluster.inbounds = ret.data.apps;
                    $scope.setting("apps", ret.data.apps, ret.data.appss);
                    $scope.setting("groups", ret.data.groups, ret.data.groupss);
                    $scope.setting2(ret.data.appw);
                    $scope.setting21(ret.data.groupsw);

                    $scope.activeCluster.outbounds = ret.data.groups;
                    $scope.activeCluster.transactions = [{
                        label: "TPS",
                        data: $scope.activeCluster.exchangeQuantity,
                        lines: {show: true},
                        points: {show: true},
                        color: '#5bc0de'
                    }];
                    $scope.activeCluster.links = [{
                        label: "连接数",
                        data: $scope.activeCluster.linkQuantity,
                        color: '#8a6d3b',
                        lines: {show: true, steps: true, fill: true}
                    }];
                    $scope.activeCluster.hosts.forEach(function (node) {
                        if (node.displayOccupy) {
                            $scope.getOccupy(node.occupys, 'node', node.id);
                        }
                    });
                    $scope.activeCluster.groups.forEach(function (group) {
                        group.machines.forEach(function (machine) {
                            if (machine.displayOccupy) {
                                $scope.getOccupy(machine.occupys, 'machine', machine.ready.id);
                            }
                        });
                    });
                    if ($scope.activeCluster.tickInterval > 0) {
                        if (angular.isDefined($scope.theTimer))
                            $timeout.cancel($scope.theTimer);
                        $scope.theTimer = $timeout($scope.updateQuantities, $scope.activeCluster.tickInterval * 1000);
                        if (!angular.isDefined($scope.aliveTimer))
                            $scope.aliveTimer = $timeout($scope.keepAlive, 60000);
                    }
                }
            }, function (ret) { // 处理错误 .reject
                $scope.showModal(ret)
            });
        };
        $scope.option1 = {
            tooltip: {
                trigger: 'item',
                formatter: "{a} <br/>{b}: {c} ({d}%)"
            },
            toolbox: {
                show: true,
                x: 'center',
                y: 'top',
                feature: {
                    mark: {show: true},
                    dataView: {show: true, readOnly: false},
                    magicType: {
                        show: true,
                        type: ['pie', 'funnel']
                    },
                    restore: {show: true},
                    saveAsImage: {show: true}
                }
            },
            calculable: true,
            series: [
                {
                    type: 'pie',
                    selectedMode: 'single',
                    radius: [0, '40%'],
                    label: {
                        normal: {
                            position: 'inner'
                        }
                    },
                    labelLine: {
                        normal: {
                            show: false
                        }
                    }
                },
                {
                    name: '交易率',
                    type: 'pie',
                    radius: ['50%', '65%'],
                    labelLine: {
                        normal: {
                            show: true,
                            length: 0.01
                        }
                    }
                }
            ]
        };
        $scope.setting = function (name, ndata, sdata) {
            var f = [], fs = [], fz = [], fzm = [];
            ndata.forEach(function (e) {
                f.push({name: e.label, value: e.data})
            })
            sdata.forEach(function (es) {
                fs = [];
                fs.push({name: '[' + es.label + ']\n成功量', value: es.data});
                f.forEach(function (ef) {
                    if (es.label == ef.name) {
                        fz = fz.concat(fs);
                        var cs = ef.value - es.data
                        if (cs > 0) {
                            fz.push({name: '[' + es.label + ']\n失败量', value: ef.value - es.data});
                        }
                    }
                });
            });
            if (ndata.length > sdata.length) {
                var cu = $scope.uns(ndata, sdata)
                angular.forEach(cu, function (e, n) {
                    fz.push({name: '[' + e.label + ']\n失败量', value: e.data});
                })
            }
            angular.forEach(f, function (ez) {
                fz.forEach(function (es) {
                    var lns = (es.name).replace(new RegExp(/(\[|])|\n/g), '')
                    if (ez.name == lns.substring(0, lns.length - 3))
                        fzm.push(es)
                })
            })
            if ('apps' == name) {
                if (!angular.isDefined($scope.pie1) || $scope.tapcapp != $scope.activeCluster.cluster.id) {
                    $scope.pie1 = echarts.init(document.getElementById("pie1" + $scope.activeCluster.cluster.id));
                    $scope.tapcapp = $scope.activeCluster.cluster.id;
                }
                $scope.option1.series.forEach(function (e, n) {
                    if (n == 0) e.data = f, e.name = "应用介入总量";
                    else {
                        e.name = "应用交易量";
                        e.data = fzm;
                    }
                })
                $scope.pie1.setOption($scope.option1);
            }
            if ('groups' == name) {
                if (!angular.isDefined($scope.pie2) || $scope.tapgroups != $scope.activeCluster.cluster.id) {
                    $scope.pie2 = echarts.init(document.getElementById("pie2" + $scope.activeCluster.cluster.id));
                    $scope.tapgroups = $scope.activeCluster.cluster.id;
                }
                $scope.option1.series.forEach(function (e, n) {
                    if (n == 0)
                        e.data = f, e.name = "密码机组介入量"
                    else {
                        e.name = "密码机交易量";
                        e.data = fzm;
                    }
                })
                $scope.pie2.setOption($scope.option1);
            }
        }
        $scope.uns = function (v1, v2) {
            var v3 = [];
            for (var i = 0; i < v1.length; i++) {
                var flag = true;
                for (var j = 0; j < v2.length; j++) {
                    if (v1[i].label == v2[j].label)
                        flag = false;
                }
                if (flag)
                    v3.push(v1[i]);
            }
            return v3;
        }
        $scope.option2 = {
            tooltip: {
                trigger: 'axis',
                position: function (pt) {
                    return [pt[0], '10%'];
                }
            },
            title: {
                left: 'center',
                text: '历史信息',
            },
            toolbox: {
                feature: {
                    dataZoom: {
                        yAxisIndex: 'none'
                    },
                    restore: {},
                    saveAsImage: {}
                }
            },
            xAxis: {
                name: '时间',
                type: 'category',
                boundaryGap: false
                // data: x
            },
            yAxis: {
                name: 'TPS',
                type: 'value',
                boundaryGap: [0, '10%']
            },
            dataZoom: [{
                type: 'inside',
                start: 0,
                end: 10
            },
                {
                    start: 0,
                    end: 10,
                    handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
                    handleSize: '80%',
                    handleStyle: {
                        color: '#fff',
                        shadowBlur: 3,
                        shadowColor: 'rgba(0, 0, 0, 0.6)',
                        shadowOffsetX: 2,
                        shadowOffsetY: 2
                    }
                }],
            series: [
                {
                    name: 'TPS',
                    type: 'line',
                    smooth: true,
                    symbol: 'none',
                    sampling: 'average',
                    itemStyle: {
                        normal: {
                            color: 'rgb(255, 70, 131)'
                        }
                    },
                    areaStyle: {
                        normal: {
                            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                                offset: 0,
                                color: 'rgb(255, 158, 68)'
                            }, {
                                offset: 1,
                                color: 'rgb(255, 70, 131)'
                            }])
                        }
                    },
                    markPoint: {
                        itemStyle: {
                            normal: {
                                borderColor: '#b5ffa8',
                                color: '#ff0b20',
                                label: {
                                    formatter: function (param) {
                                        return "⚡";
                                    }
                                }
                            }

                        },
                        data: []
                    }
                }
            ]
        };
        $scope.settingAll = function () {
            if (!angular.isDefined($scope.shuju) || $scope.tapshuju != $scope.activeCluster.cluster.id) {
                $scope.tapshuju = $scope.activeCluster.cluster.id;
                $scope.shuju = echarts.init(document.getElementById("shuju"));
            }
            var x = $scope.activeCluster.dataTime
            var data = $scope.activeCluster.tps;
            var data2 = $scope.activeCluster.linkH;
            $scope.option2.xAxis.data = x;
            $scope.option2.series.forEach(function (e, n) {
                if (data.length != 0) {
                    if (n == 0) e.data = data;
                    if (n == 1) e.data = data2;
                } else {
                    e.data = [0]; //X 已经设置为空，为避免length问题，赋一代替值
                }
            })
            $scope.shuju.setOption($scope.option2);
        }
        $scope.option3 = {
            color: ['#3398DB'],
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            xAxis: [
                {
                    type: 'category',
                    axisTick: {
                        alignWithLabel: true
                    }
                }
            ],
            yAxis: [
                {
                    type: 'value'
                }
            ],
            series: [
                {
                    // name: '交易总量',
                    type: 'bar',
                    barWidth: '60%'
                }
            ]
        };
        $scope.setting2 = function (vf) {
            if (!angular.isDefined($scope.ct) || $scope.tapct != $scope.activeCluster.cluster.id) {
                $scope.ct = echarts.init(document.getElementById("ct" + $scope.activeCluster.cluster.id));
                $scope.tapct = $scope.activeCluster.cluster.id;
            }
            var temp = [];
            if (vf == '')
                $scope.option4.series.forEach(function (e) {
                    e.data = [];
                })
            angular.forEach(vf, function (e) {
                if (temp.indexOf(e.label) == -1) {
                    temp.push(e.label);
                }
            });
            $scope.option4.xAxis[0].data = temp;
            var bi = 0;
            for (var i = 0; i < temp.length; i++) {
                angular.forEach(vf, function (e, n) {
                    if (temp[i] == e.label) {
                        var tg = false;
                        var tc = [];
                        $scope.option4.series.forEach(function (e1) {
                            if (e1.name == e.appsymbol) {
                                tg = true;
                                if (i > bi) {
                                    if (e1.data.length < temp.length) //传入节点个数大于原数据节点个数
                                        e1.data.push(e.data);   //加入新节点
                                    else {
                                        e1.data = [];
                                        for (var k = 0; k < temp.length - e1.data.length; k++) { //  前一节点没有信息后节点填充信息
                                            e1.data.push(0);
                                        }
                                        e1.data.push(e.data);
                                    }
                                }
                                else {
                                    e1.data = [e.data];
                                }
                            }
                        })
                        if (!tg) { //创建新的渠道名统计
                            var data = [];
                            if (i > bi) { //确定是哪个集群
                                var kl = i - bi;
                                for (var k = 0; k < kl; k++) {
                                    data.push(0); //加入
                                }
                                data.push(e.data);
                            } else {
                                data.push(e.data);
                            }
                            $scope.option4.series.push({
                                    name: e.appsymbol,
                                    type: 'bar',
                                    stack: 'sum',
                                    barWidth: '60%',
                                    itemStyle: {
                                        normal: {
                                            label: {
                                                show: true, position: 'left',
                                                textStyle: {
                                                    color: 'tomato'
                                                }
                                            }
                                        }
                                    },
                                    data: data
                                }
                            )
                        }
                        vf.forEach(function (v) {
                            tc.push(v.appsymbol)
                        })
                        var index1 = [];
                        $scope.option4.series.forEach(function (e, n) {
                            if (tc.indexOf(e.name) == -1) {
                                index1.push(n);
                            }
                        })
                        index1.forEach(function (fd) {
                            $scope.option4.series.splice(fd, 1);
                            $scope.ct.clear();  //清空滞留数据缓存
                        })
                    }
                });
            }
            bi = i;
            $scope.ct.setOption($scope.option4);
        }
        $scope.option4 = {
            tooltip: {
                trigger: 'axis',
                axisPointer: {            // 坐标轴指示器，坐标轴触发有效
                    type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
                },
                formatter: function (params) {
                    var res = params[0].name;
                    var sum = 0, vum = "";
                    angular.forEach(params, function (e) {
                        if (!angular.isDefined(e.value))
                            e.value = 0;
                        sum += e.value
                        vum += '<br/>' + e.seriesName + ":" + e.value
                    })
                    return res + vum + '<br/>交易总量 : ' + sum
                }
            },
            xAxis: [
                {
                    type: 'category'
                }
            ],
            yAxis: [
                {
                    type: 'value',
                    boundaryGap: [0, 0.01]
                }
            ],
            series: []
        };
        $scope.setting21 = function (vf) {
            if (!angular.isDefined($scope.ct1) || $scope.tapct1 != $scope.activeCluster.cluster.id) {
                $scope.ct1 = echarts.init(document.getElementById("ct1" + $scope.activeCluster.cluster.id));
                $scope.tapct1 = $scope.activeCluster.cluster.id;
            }
            var cv = [];
            var cn = [];
            angular.forEach(vf, function (e) {
                cn.push(e.label);
                cv.push(e.data);
            })
            $scope.option3.xAxis[0].data = cn;
            $scope.option3.series[0].data = cv;
            $scope.option3.series[0].name = '连接数';
            $scope.ct1.setOption($scope.option3);
        }
        $scope.smm = function (clusterId) {
            $scope.shuju.on('dataZoom', function (params) {
                //params里面有什么，可以打印出来看一下就明白
                // console.log(params);
                //可以通过params获取缩放的起止百分比，但是鼠标滚轮和伸缩条拖动触发的params格式不同，所以用另一种方法
                //获得图表数据数组下标
                var m = $scope.shuju.getOption().xAxis[0].data;
                var eN = $scope.shuju.getModel().option.dataZoom[0].endValue;
                var sN = $scope.shuju.getModel().option.dataZoom[0].startValue;
                if (m != undefined && m.length != 0) {
                    if (angular.isUndefined($scope.endValue1)) {
                        $scope.endValue1 = m[eN].replace(new RegExp(/(:|\/| )/g), '')
                        $scope.endValue2 = $scope.endValue1;
                    }
                    else {
                        $scope.endValue2 = m[eN].replace(new RegExp(/(:|\/| )/g), '');
                        if (Math.abs($scope.endValue2 - $scope.endValue1) >= 1) {
                            $scope.endValue1 = $scope.endValue2;
                        }
                    }
                    if (angular.isUndefined($scope.startValue1)) {    //1
                        $scope.startValue1 = m[sN].replace(new RegExp(/(:|\/| )/g), '');
                        $scope.startValue2 = $scope.startValue1;
                        $scope.activeCluster.history = 1;
                        $scope.activeCluster.startTime = $scope.startValue2;
                        $scope.activeCluster.endTime = $scope.endValue2;
                        $scope.activeCluster.hti = 3;
                        $scope.activeCluster.lastPoint = 0;
                        $scope.updateQuantities(clusterId);
                        console.log("start:" + $scope.startValue2 + "、end:" + $scope.endValue2);
                    }
                    else {
                        $scope.startValue2 = m[sN].replace(new RegExp(/(:|\/| )/g), ''); //2
                        if (Math.abs($scope.startValue2 - $scope.startValue1) >= 1) {
                            $scope.startValue1 = $scope.startValue2;
                            $scope.activeCluster.history = 1;
                            $scope.activeCluster.startTime = $scope.startValue2;
                            $scope.activeCluster.endTime = $scope.endValue2;
                            $scope.activeCluster.lastPoint = 0;
                            $scope.activeCluster.hti = 3;
                            $scope.updateQuantities(clusterId);
                            console.log("start:" + $scope.startValue2 + "、end:" + $scope.endValue2);
                        }
                    }
                }

                // var endValue = $scope.shuju.getModel().option.dataZoom[0].endValue;
                //获得起止位置百分比
                // var startPercent = $scope.shuju.getModel().option.dataZoom[0].start;
                // var endPercent = $scope.shuju.getModel().option.dataZoom[0].end;
                // alert(startValue);
            })
        }

        $scope.keepAlive = function (i) {
            var uri = "keepAlive/";
            var promise2 = myServer.call(uri + "?sessionId=" + $scope.$root.sessionId, {}, 'GET'); // 同步调用，获得承诺接口
            promise2.then(function(ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201){
                    $scope.aliveTimer = $timeout($scope.keepAlive, 60000);
                }
            }, function(ret) { // 处理错误 .reject
                $scope.showModal(ret)
            });
        }
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
    .controller('todoNoticCtrl', ['$log', '$rootScope', '$scope', 'myServer', 'myOptions', function($log, $rootScope, $scope, myServer, myOptions) {
        myServer.crud($scope, "notice", '通知事项', myServer.notices);
        if($rootScope.pow != null){
            myServer.errorDialog($rootScope);
            $rootScope.showModalPower($rootScope.pow);
            $rootScope.pow = null;
        }
        // $scope.qry.status = 0;
        $scope.query($scope.qry);
        myServer.retrieveMenuTree($scope);
        myServer.retrieveRoleList($scope);
        myServer.retrieveGroupList($scope);
        myServer.retrieveUsersList($scope);
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
                // var page = 'views/' + rec.table + '/edit.html';
                $rootScope.detailPanels.push('views/' + rec.table + '/edit.html');
                $rootScope.detailPageIDs[rec.table] = chosenPanel = $rootScope.detailPanels.length;
            }
            $scope.crudPanels.activePanel = chosenPanel;
        };

        $scope.authorize2 = function(ele, action, status) {
            var uri = "notice/" + $scope.selectedRec.seq + "/" + action +"/"+ele.repeate + "?sessionId=" + $rootScope.sessionId;
            var promise = myServer.call(uri, {notice:"1111"}); // 同步调用，获得承诺接口
            promise.then(function (ret) {  // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    ele.status = status;
                    $scope.crudPanels.activePanel = 0;
                    var ctrl = myOptions.findController($scope.selectedRec.table);
                    if (angular.isDefined(ctrl) && angular.isDefined(ctrl.postChecked)) {
                        ctrl.postChecked($log, $rootScope, $scope, myServer);
                    }
                    $scope.conditionQuery($scope.qry);
                    // $scope.showTips('复核操作成功');
                }
            }, function (ret) {  // 处理错误 .reject
                $scope.authorizeState = false;
                $scope.showModal(ret);
            });
        };
        $scope.authorizeX2 = function(action, status) {
            $scope.authorizeState = true;
            angular.element.each($scope.recs, function(n, ele) {
                if (angular.isDefined(ele.chosen) && ele.chosen) {
                    $scope.selectedRec = ele;
                    $scope.authorize2(ele, action, status);
                    if ($scope.authorizeState) {
                        // $scope.showTips('复核操作成功')
                    }
                }
            });
        };

    }])
    .controller('todoCheckCtrl', ['$log', '$rootScope', '$scope', 'myServer', 'myOptions', function($log, $rootScope, $scope, myServer, myOptions) {
        myServer.crud($scope, "JournalBiz", '待办事项', myServer.journals);
        if($rootScope.pow != null){
            myServer.errorDialog($rootScope);
            $rootScope.showModalPower($rootScope.pow);
            $rootScope.pow = null;
        }
        $scope.qry.status = 0;
        $scope.query($scope.qry);
        myServer.retrieveMenuTree($scope);
        myServer.retrieveRoleList($scope);
        myServer.retrieveGroupList($scope);
        myServer.retrieveUsersList($scope);
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
                // var page = 'views/' + rec.table + '/edit.html';
                $rootScope.detailPanels.push('views/' + rec.table + '/edit.html');
                $rootScope.detailPageIDs[rec.table] = chosenPanel = $rootScope.detailPanels.length;
            }
            $scope.crudPanels.activePanel = chosenPanel;
        };
        $scope.authorize = function(ele, action, status) {
            var uri = "authorize/" + $scope.selectedRec.seq + "/" + action + "?sessionId=" + $rootScope.sessionId;
            var promise = myServer.call(uri, {notice:" "}); // 同步调用，获得承诺接口
            promise.then(function (ret) {  // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    ele.status = status;
                    $scope.crudPanels.activePanel = 0;
                    var ctrl = myOptions.findController($scope.selectedRec.table);
                    if (angular.isDefined(ctrl) && angular.isDefined(ctrl.postChecked)) {
                        ctrl.postChecked($log, $rootScope, $scope, myServer);
                    }
                    $scope.conditionQuery($scope.qry);
                    $scope.showTips('复核操作成功');
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