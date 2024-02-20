'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pdf', {
        url: '/pdf',
        template: '<pdf></pdf>'
      });
  });
