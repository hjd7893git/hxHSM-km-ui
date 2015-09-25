'use strict';

// 声明应用所依赖的页面或组件，自己开发的通常用应用Id打头。
angular.module('myApp', [
    'ngRoute', // ng打头的都是angular提供的
    'ngResource',
    'ui.tree',
    'ngmodel.format',
    'angular-flot', // 集成flot图表控件的
    'mgcrea.ngStrap.modal', // angular-strap的组件
    'mgcrea.ngStrap.popover', // angular-strap的组件
    'mgcrea.ngStrap.collapse', // angular-strap的组件
    'myApp.views', // 页面
    'myApp.filters', // 过滤器
    'myApp.services', // 后台服务
    'myApp.options', // 选项服务
    'myApp.components.user', // 用户相关组件
    'myApp.components.header', // 顶部导航相关组件
    'myApp.components.crud', // 增删改查相关组件
    'myApp.components.form', // 表单相关组件
    'myApp.components.utils' // 杂项组件
]).config(['$resourceProvider', function($resourceProvider) {
    // Don't strip trailing slashes from calculated URLs
    $resourceProvider.defaults.stripTrailingSlashes = false;
}]);
