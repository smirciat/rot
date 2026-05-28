'use strict';

describe('Component: RecordsComponent', function () {

  // load the controller's module
  beforeEach(module('rotApp'));

  var RecordsComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    RecordsComponent = $componentController('records', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
