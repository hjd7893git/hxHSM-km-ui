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
    .directive('biChangePassword', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/user/biChangePasswordTemplate.html',
            replace : true
        };
    })
    .controller('biLoginFormCtrl', ['$location', '$scope', '$rootScope', 'myServer', '$log', function($location, $scope, $rootScope, myServer, $log) {
        var jumpTo = function(scope) {
            $scope.user.password = '';
            $location.path("views/change").replace();
        };
        myServer.errorDialog($scope, "user", jumpTo);
        $scope.doLogin = function(user) {
            user.password = angular.element.md5(user.password);
            var promise = myServer.call("login", user); // 同步调用，获得承诺接口
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    $rootScope.signedUp = true;
                    $rootScope.user = ret.data.user;
                    $rootScope.sessionId = ret.data.sessionId;
                    $location.path("views/check").replace();
                } else if (ret.status == 202) {
                    $scope.confirmLabel = '立即更改';
                    $scope.showModal(ret);
                }
            }, function(ret) { // 处理错误 .reject
                $scope.showModal(ret);
            });
        };
    }])
    .controller('biChangePasswordFormCtrl', ['$location', '$scope', '$rootScope', 'myServer', '$log', function($location, $scope, $rootScope, myServer, $log) {
        myServer.errorDialog($scope, "change");
        $scope.doChangePassword = function(user) {
            user.password = angular.element.md5(user.password);
            user.passwordNew = angular.element.md5(user.passwordNew);
            user.passwordAgain = angular.element.md5(user.passwordAgain);
            var promise = myServer.call("changePassword", user); // 同步调用，获得承诺接口
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    $rootScope.signedUp = false;
                    $rootScope.user = null;
                    $rootScope.sessionId = null;
                    $location.path("views/login").replace();
                }
            }, function(ret) { // 处理错误 .reject
                $scope.showModal(ret);
            });
        };
    }]);

