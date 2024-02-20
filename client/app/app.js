'use strict';

angular.module('rotApp', ['rotApp.auth', 'rotApp.admin', 'rotApp.constants', 'ngCookies',
    'ngResource', 'ngSanitize', 'ui.select', 'ui.router', 'ui.bootstrap', 'validation.match','lr.upload'
  ])
  .config(function($urlRouterProvider, $locationProvider,$compileProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
    
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
  });
