'use strict';

var proxyquire = require('proxyquire').noPreserveCache();

var evaluationCtrlStub = {
  index: 'evaluationCtrl.index',
  show: 'evaluationCtrl.show',
  create: 'evaluationCtrl.create',
  update: 'evaluationCtrl.update',
  destroy: 'evaluationCtrl.destroy'
};

var routerStub = {
  get: sinon.spy(),
  put: sinon.spy(),
  patch: sinon.spy(),
  post: sinon.spy(),
  delete: sinon.spy()
};

// require the index with our stubbed out modules
var evaluationIndex = proxyquire('./index.js', {
  'express': {
    Router: function() {
      return routerStub;
    }
  },
  './evaluation.controller': evaluationCtrlStub
});

describe('Evaluation API Router:', function() {

  it('should return an express router instance', function() {
    expect(evaluationIndex).to.equal(routerStub);
  });

  describe('GET /api/evaluations', function() {

    it('should route to evaluation.controller.index', function() {
      expect(routerStub.get
        .withArgs('/', 'evaluationCtrl.index')
        ).to.have.been.calledOnce;
    });

  });

  describe('GET /api/evaluations/:id', function() {

    it('should route to evaluation.controller.show', function() {
      expect(routerStub.get
        .withArgs('/:id', 'evaluationCtrl.show')
        ).to.have.been.calledOnce;
    });

  });

  describe('POST /api/evaluations', function() {

    it('should route to evaluation.controller.create', function() {
      expect(routerStub.post
        .withArgs('/', 'evaluationCtrl.create')
        ).to.have.been.calledOnce;
    });

  });

  describe('PUT /api/evaluations/:id', function() {

    it('should route to evaluation.controller.update', function() {
      expect(routerStub.put
        .withArgs('/:id', 'evaluationCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('PATCH /api/evaluations/:id', function() {

    it('should route to evaluation.controller.update', function() {
      expect(routerStub.patch
        .withArgs('/:id', 'evaluationCtrl.update')
        ).to.have.been.calledOnce;
    });

  });

  describe('DELETE /api/evaluations/:id', function() {

    it('should route to evaluation.controller.destroy', function() {
      expect(routerStub.delete
        .withArgs('/:id', 'evaluationCtrl.destroy')
        ).to.have.been.calledOnce;
    });

  });

});
