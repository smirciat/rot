'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('records', {
        url: '/records',
        template: '<records></records>'
      });
  })
  .filter('trusted', ['$sce', function($sce) {
    return function(url) {
        return $sce.trustAsResourceUrl(url);
    };
  }]);
  