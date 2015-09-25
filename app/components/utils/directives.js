/**
 * 杂项组件。
 * Created by Ben on 15/3/31.
 */
'use strict';

angular.module('myApp.components.utils', [])

    .directive('biHireOp', ["$popover", function($popover) {
        return {
            restrict: 'A',
            scope: true,
            link: function postLink(scope, element, attr) {
                var options = {
                    scope: scope,
                    placement: 'bottom',
                    template: 'views/panel/hiringPopover.html',
                    autoClose: true
                };
                // Initialize popover
                var popover = $popover(element, options);
                // Garbage collection
                scope.$on('$destroy', function() {
                    if (popover)
                        popover.destroy();
                    options = null;
                    popover = null;
                });
            }
        };
    }]);

