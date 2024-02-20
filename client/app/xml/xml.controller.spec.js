'use strict';

describe('Component: XmlComponent', function () {

  // load the controller's module
  beforeEach(module('rotApp'));

  var XmlComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    XmlComponent = $componentController('xml', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
