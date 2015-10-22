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
        $scope.$on('$includeContentLoaded', function() {
            $log.info("event: include-reloaded");
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
    }]);