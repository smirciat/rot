'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('pilotEvals', {
        url: '/pilotEvals',
        template: '<pilot-evals></pilot-evals>'
      });
  });
