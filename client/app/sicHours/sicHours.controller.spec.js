'use strict';

describe('Component: SicHoursComponent', function () {

  // load the controller's module
  beforeEach(module('rotApp'));

  var SicHoursComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    SicHoursComponent = $componentController('sicHours', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
