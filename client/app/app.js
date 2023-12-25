'use strict';

angular.module('rotApp', ['rotApp.auth', 'rotApp.admin', 'rotApp.constants', 'ngCookies',
    'ngResource', 'ngSanitize', 'ui.select', 'ui.router', 'ui.bootstrap', 'validation.match'
  ])
  .config(function($urlRouterProvider, $locationProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
  });
