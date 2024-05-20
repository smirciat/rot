'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('ome', {
        url: '/ome',
        template: '<ome></ome>'
      });
  });
