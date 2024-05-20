'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('otz', {
        url: '/otz',
        template: '<otz></otz>'
      });
  });
