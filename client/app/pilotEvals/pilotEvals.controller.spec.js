'use strict';

describe('Component: PilotEvalsComponent', function () {

  // load the controller's module
  beforeEach(module('rotApp'));

  var PilotEvalsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    PilotEvalsComponent = $componentController('pilotEvals', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
