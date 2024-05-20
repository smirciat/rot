'use strict';

describe('Component: OtzComponent', function () {

  // load the controller's module
  beforeEach(module('rotApp'));

  var OtzComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    OtzComponent = $componentController('otz', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
