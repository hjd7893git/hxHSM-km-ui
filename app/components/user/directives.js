/**
 * 用户相关的组件。
 * Created by Ben on 15/3/31.
 */
'use strict';

angular.module('myApp.components.user', [])

    .directive('biLogin', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/user/biLoginTemplate.html',
            replace : true
        };
    })
    .controller('biLoginFormCtrl', ['$location', '$scope', '$rootScope', 'myServer', '$log', function($location, $scope, $rootScope, myServer, $log) {
        myServer.errorDialog($scope, "user");
        $scope.doLogin = function(user) {
            var promise = myServer.call("login", user); // 同步调用，获得承诺接口
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                $log.info("login --> ok: " + ret);
                if (ret.status == 200 || ret.status == 201) {
                    $rootScope.signedUp = true;
                    $rootScope.user = ret.data.user;
                    $rootScope.sessionId = ret.data.sessionId;
                    $location.path("views/check").replace();
                }
            }, function(ret) { // 处理错误 .reject
                $log.info("login --> fail: " + ret)
                $scope.showModal(ret)
            });
        };
    }]);

