'use strict';

describe('Service: firebase', function () {

  // load the service's module
  beforeEach(module('rotApp'));

  // instantiate service
  var firebase;
  beforeEach(inject(function (_firebase_) {
    firebase = _firebase_;
  }));

  it('should do something', function () {
    expect(!!firebase).to.be.true;
  });

});
