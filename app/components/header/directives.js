/**
 * 固定在顶部的导航组件。
 * Created by Ben on 15/3/31.
 */
'use strict';

angular.module('myApp.components.header', [])

    .directive('biHeader', function() {
        return {
            restrict : 'E',
            templateUrl : 'components/header/biHeaderTemplate.html',
            replace : true
        };
    })
    .directive('biFooter', function() {
        return {
            restrict: 'E',
            templateUrl: 'components/header/biFooterTemplate.html',
            replace: true
        };
    })
    .controller('biHeaderCtrl', ['$location', '$rootScope', '$scope', 'myServer', '$log', function($location, $rootScope, $scope, myServer, $log) {
        myServer.errorDialog($scope, "header");
        $scope.doLogout = function() {
            var uri = "logout?sessionId=" + $rootScope.sessionId;
            var promise = myServer.call(uri, {}); // 同步调用，获得承诺接口
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                $log.info("logout --> ok: " + ret);
                if (ret.status == 200 || ret.status == 201) {
                    $rootScope.signedUp = false;
                    $rootScope.user = null;
                    $rootScope.sessionId = null;
                    $location.path("views/login").replace();
                }
            }, function(ret) { // 处理错误 .reject
                $log.info("logout --> fail: " + ret)
                $scope.showModal(ret)
            });
        };
    }]);