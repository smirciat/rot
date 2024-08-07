'use strict';

function firebaseService() {
  // Service logic
  // ...
  
  var meaningOfLife = 42;

  // Public API here
  return {
    someMethod: function () {
      return meaningOfLife;
    }
  };
}


angular.module('rotApp')
  .factory('firebase', firebaseService);
