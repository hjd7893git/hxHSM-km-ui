/**
 * 杂项组件。
 * Created by Ben on 15/3/31.
 */
'use strict';

angular.module('myApp.components.crud', [])

    .directive('biEditButtons', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/crud/biEditButtonsTemplate.html',
            replace : true
        };
    })
    .directive('biTwoEditButtons', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/crud/biTwoEditButtonsTemplate.html',
            replace : true
        };
    })
    .directive('biRefEditButtons', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/crud/biRefEditButtonsTemplate.html',
            replace : true
        };
    })
    .directive('biTwoRefEditButtons', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/crud/biTwoRefEditButtonsTemplate.html',
            replace : true
        };
    })
    .directive('biQueryButtons', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/crud/biQueryButtonsTemplate.html',
            replace : true
        };
    })
    .directive('biQueryAction', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/crud/biQueryActionTemplate.html',
            replace : true
        };
    })
    .directive('biHistoryColumns', function($templateCache) {
        return {
            restrict : 'E',
            templateUrl : 'components/crud/biHistoryColumnsTemplate.html',
            replace : true,
            scope: {
                rowOperations: '=rowOperations'
            }
        };
    });

