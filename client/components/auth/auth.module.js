'use strict';

angular.module('rotApp.auth', ['rotApp.constants', 'rotApp.util', 'ngCookies', 'ui.router'])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
