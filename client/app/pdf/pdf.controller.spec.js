'use strict';

describe('Component: PdfComponent', function () {

  // load the controller's module
  beforeEach(module('rotApp'));

  var PdfComponent;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($componentController) {
    PdfComponent = $componentController('pdf', {});
  }));

  it('should ...', function () {
    expect(1).to.equal(1);
  });
});
