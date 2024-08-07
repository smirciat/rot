'use strict';

(function() {

  function authInterceptor($rootScope, $q, $cookies, $injector, Util) {
    var state;
    return {
      // Add authorization token to headers
      request(config) {
        config.headers = config.headers || {};
        if ($cookies.get('token') && Util.isSameOrigin(config.url)) {
          config.headers.Authorization = 'Bearer ' + $cookies.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError(response) {
        if (response.status === 401) {
          alert('Hit refresh or Login, your login token may be expired');
          (state || (state = $injector.get('$state')))
          //.go('login');
          // remove any stale tokens
          //$cookies.remove('token');
        }
        return $q.reject(response);
      }
    };
  }

  angular.module('rotApp.auth')
    .factory('authInterceptor', authInterceptor);
})();
