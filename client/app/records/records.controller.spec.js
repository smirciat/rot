'use strict';

describe('RecordsComponent training exp history', function() {

  beforeEach(module('rotApp'));

  var ctrl;
  var appConfig;

  beforeEach(inject(function($rootScope, $componentController, _appConfig_) {
    appConfig = _appConfig_;
    ctrl = $componentController('records', {
      $scope: $rootScope.$new(),
      $timeout: function(fn) { fn(); },
      $interval: angular.noop,
      $http: { post: angular.noop },
      toaster: { success: angular.noop, error: angular.noop, warning: angular.noop },
      appConfig: appConfig,
      Modal: { confirm: { quickMessage: angular.noop, radio: angular.noop, pilotData: angular.noop } },
      categoryFilterFilter: angular.identity,
      $state: { go: angular.noop },
    });
    ctrl.fullPilot = {
      _id: 101,
      name: 'Test Pilot',
      C208PICExp: '6/30/2027',
      trainingExpHistory: {},
    };
    window.user = { email: 'smirciat@gmail.com', accessToken: 'test' };
  }));

  afterEach(function() {
    delete window.user;
    delete window.recordsExpHistoryDebug;
  });

  it('maps far293a to far293a148 field key', function() {
    expect(ctrl.getPilotExpFieldKey('far293a')).to.equal('far293a148');
    expect(ctrl.getPilotExpFieldKey('C208PIC')).to.equal('C208PICExp');
  });

  it('prepends history and caps at three entries', function() {
    var entry = ctrl.buildExpHistoryEntry('6/30/2027', { source: 'approval' });
    expect(ctrl.prependExpHistory('C208PICExp', entry)).to.equal(true);
    expect(ctrl.prependExpHistory('C208PICExp', entry)).to.equal(false);
    ctrl.prependExpHistory('C208PICExp', ctrl.buildExpHistoryEntry('6/30/2026', { source: 'approval' }));
    ctrl.prependExpHistory('C208PICExp', ctrl.buildExpHistoryEntry('6/30/2025', { source: 'approval' }));
    ctrl.prependExpHistory('C208PICExp', ctrl.buildExpHistoryEntry('6/30/2024', { source: 'approval' }));
    expect(ctrl.fullPilot.trainingExpHistory.C208PICExp.length).to.equal(3);
    expect(ctrl.fullPilot.trainingExpHistory.C208PICExp[0].exp).to.equal('6/30/2024');
  });

  it('shows live profile on current row and prior logged values below', function() {
    ctrl.fullPilot.trainingExpHistory.C208PICExp = [
      { exp: '6/30/2027', source: 'approval' },
      { exp: '6/30/2026', source: 'approval' },
      { exp: '6/30/2025', source: 'approval' },
    ];
    expect(ctrl.getExpHistoryCell('C208PIC', 0)).to.equal('6/30/2027');
    expect(ctrl.getExpHistoryCell('C208PIC', 1)).to.equal('6/30/2026');
    expect(ctrl.getExpHistoryCell('C208PIC', 2)).to.equal('6/30/2025');
  });

  it('shifts previous rows when live profile diverges from logged history', function() {
    ctrl.fullPilot.C208PICExp = '7/31/2027';
    ctrl.fullPilot.trainingExpHistory.C208PICExp = [
      { exp: '6/30/2027', source: 'approval' },
      { exp: '6/30/2026', source: 'approval' },
    ];
    expect(ctrl.getExpHistoryCell('C208PIC', 0)).to.equal('7/31/2027');
    expect(ctrl.getExpHistoryCell('C208PIC', 1)).to.equal('6/30/2027');
    expect(ctrl.getExpHistoryCell('C208PIC', 2)).to.equal('6/30/2026');
  });

  it('exposes debug helpers for approvers', function() {
    ctrl.installExpHistoryDebug();
    expect(window.recordsExpHistoryDebug).to.exist;
    expect(window.recordsExpHistoryDebug.dump('C208PIC').fieldKey).to.equal('C208PICExp');
  });

  it('allows approvers to restore a previous value', function() {
    var postedDoc;
    var successCalled = false;
    ctrl.http.post = function(url, body) {
      postedDoc = body.doc;
      return { then: function(cb) { cb(); return { catch: angular.noop }; } };
    };
    ctrl.toaster.success = function() { successCalled = true; };
    ctrl.pilots = [{ _id: 101, C208PICExp: '7/31/2027' }];
    ctrl.pilot = { _id: 101, name: 'Test Pilot' };
    ctrl.fullPilot.C208PICExp = '7/31/2027';
    ctrl.fullPilot.trainingExpHistory.C208PICExp = [
      { exp: '6/30/2027', source: 'approval', baseMonth: 'June' },
      { exp: '6/30/2026', source: 'approval' },
    ];
    window.confirm = function() { return true; };

    expect(ctrl.canRestoreExpHistory('C208PIC', 1)).to.equal(true);
    expect(ctrl.canRestoreExpHistory('C208PIC', 0)).to.equal(false);
    ctrl.restoreExpHistory('C208PIC', 1);

    expect(ctrl.fullPilot.C208PICExp).to.equal('6/30/2027');
    expect(postedDoc.C208PICExp).to.equal('6/30/2027');
    expect(postedDoc.trainingExpHistory.C208PICExp[0].source).to.equal('restore');
    expect(successCalled).to.equal(true);
  });
});
