'use strict';

angular.module('rotApp', ['rotApp.auth', 'rotApp.admin', 'rotApp.constants', 'ngCookies',
    'ngResource', 'ngSanitize', 'ui.select', 'ui.router', 'ui.bootstrap', 'validation.match','lr.upload',
    'ui.grid','ui.grid.edit', 'ui.grid.cellNav','ui.grid.selection','ui.grid.exporter','angularMoment','AngularPrint','angular-thumbnails'
  ])
  .config(function($urlRouterProvider, $locationProvider,$compileProvider) {
    $urlRouterProvider.otherwise('/');

    $locationProvider.html5Mode(true);
    
    $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|blob):/);
    
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);
  });
