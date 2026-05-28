'use strict';

angular.module('rotApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('sicHours', {
        url: '/sicHours',
        template: '<sic-hours></sic-hours>'
      });
  });
