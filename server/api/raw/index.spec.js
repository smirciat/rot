'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var rawCtrlStub = {
  index: 'rawCtrl.index',
  show: 'rawCtrl.show',
  create: 'rawCtrl.create',
  update: 'rawCtrl.update',
  destroy: 'rawCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var rawIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './raw.controller': rawCtrlStub
});

describe('Raw API Router:', function() {

  it('should return an express router instance', function() {
    expect(rawIndex).to.equal(routerStub);
  });

  describe('GET /api/raws', function() {

    it('should route to raw.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'rawCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/raws/:id', function() {

    it('should route to raw.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'rawCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/raws', function() {

    it('should route to raw.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'rawCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/raws/:id', function() {

    it('should route to raw.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'rawCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/raws/:id', function() {

    it('should route to raw.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'rawCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/raws/:id', function() {

    it('should route to raw.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'rawCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
