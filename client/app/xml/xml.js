'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('xml', {
        url: '/xml',
        template: '<xml></xml>'
      });
  });
