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

    .controller('biLoginFormCtrl', ['$location', '$scope', '$rootScope', '$interval', 'myServer', '$log', function($location, $scope, $rootScope, $interval, myServer, $log) {
        $scope.auth = false;
        var jumpTo = function(scope) {
            $scope.user.password = '';
            $scope.user.sign = '';
            $location.path("views/change").replace();
        };

        myServer.errorDialog($scope, "user", jumpTo);
        document.getElementById("userSign").addEventListener('change', function() {
            var promise = myServer.call("login", $scope.user); // 同步调用，获得承诺接口
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    $scope.user.sys='IC'
                    $rootScope.sys = $scope.user.sys;
                    //
                    // if($scope.user.sys==null){
                    //     $rootScope.sys='KM';
                    //     document.title="密钥统一管理系统"
                    // }
                    // else{
                    //     $rootScope.sys = $scope.user.sys;
                    //     if($rootScope.sys=='KM'){
                    //         document.title="密钥统一管理系统"
                    //     }
                    //     if($rootScope.sys=='IC'){
                    //         document.title="金融IC卡密钥管理系统"
                    //     }
                    //     if($rootScope.sys=='ATM'){
                    //         document.title="ATM管理系统"
                    //     }
                    // }

                    $rootScope.signedUp = true;
                    $rootScope.user = ret.data.user;
                    $rootScope.pow = ret.data.msga;
                    $rootScope.sessionId = ret.data.sessionId;

                    $location.path("views/check").replace();
                } else if (ret.status == 202) {
                    $scope.confirmLabel = '立即更改';
                    $scope.showModal(ret);
                }
            }, function(ret) { // 处理错误 .reject
                    $scope.showModal(ret);
            });
        });
        document.getElementById("userSign").addEventListener('input', function() {
            $scope.auth = true;
        });

        /* 获取设备信息 */
        $scope.checkDev = function(){
            try{
                var evt = document.createEvent("CustomEvent");
                evt.initCustomEvent("ukeyCheckDev", true, false, {isManager: "false"});
                document.dispatchEvent(evt);
            } catch (er) {
                if (er.name == "NotSupportedError") {
                    document.getElementById("HxUKeyDevInfo").innerHTML = "<font color=\"red\">未安装/未启用 UKey浏览器插件</font>";
                }
            }
        };

        /* UKey认证 */
        $scope.ukeyLogin = function(password) {
            try{
                var evt = document.createEvent("CustomEvent");
                evt.initCustomEvent('ukeyLogin', true, false, {isManager: "false", password: password});
                document.dispatchEvent(evt);
            } catch (er) {
                if (er.name == "NotSupportedError") {
                    document.getElementById("HxUKeyDevInfo").innerHTML = "未安装/未启用 UKey浏览器插件";
                }
            }
        }
        $scope.doChangePower = function (sn) {
            var promise = myServer.call("power?sn=" + sn, {}, 'GET')
            promise.then(function (ret) {
                if (ret.status == 200 || ret.status == 201){
                  // if(ret.status)
                }
            })
        }
        $scope.doLogin = function(user, password) {
            var promise = myServer.call("login", null, 'GET'); // 同步调用，获得承诺接口
            promise.then(function(ret) { // 调用承诺API获取数据 .resolve
                if (ret.status == 200 || ret.status == 201) {
                    user.time = ret.data.time;
                    user.data = ret.data.data;
                }
                user.password = angular.element.md5(user.password);
                try{
                    var evt = document.createEvent("CustomEvent");
                    var sm3res = sm3(user.mobile + user.time + user.data); //对用户名，时间，随机数进行哈希计算
                    console.log(sm3res);
                    evt.initCustomEvent('ukeySignData', true, false, {isManager: "false", data: sm3res, password: password});
                    document.dispatchEvent(evt);
                } catch (er) {
                    if (er.name == "NotSupportedError") {
                        document.getElementById("HxUKeyDevInfo").innerHTML = "未安装/未启用 UKey浏览器插件";
                    }
                }
            }, function(ret) { // 处理错误 .reject
                $scope.showModal(ret);
            });
        };
        $scope.checkDev();
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

