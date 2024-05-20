'use strict';

describe('Component: OmeComponent', function () {

  // load the controller's module
  beforeEach(module('rotApp'));

  var OmeComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    OmeComponent = $componentController('ome', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
