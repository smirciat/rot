'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pdftab', {
        url: '/pdftab',
        template: '<pdf></pdf>'
      });
  });
