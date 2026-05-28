'use strict';

var app = require('../..');
import request from 'supertest';

var newEvaluation;

describe('Evaluation API:', function() {

  describe('GET /api/evaluations', function() {
    var evaluations;

    beforeEach(function(done) {
      request(app)
        .get('/api/evaluations')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          evaluations = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(evaluations).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/evaluations', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/evaluations')
        .send({
          name: 'New Evaluation',
          info: 'This is the brand new evaluation!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newEvaluation = res.body;
          done();
        });
    });

    it('should respond with the newly created evaluation', function() {
      expect(newEvaluation.name).to.equal('New Evaluation');
      expect(newEvaluation.info).to.equal('This is the brand new evaluation!!!');
    });

  });

  describe('GET /api/evaluations/:id', function() {
    var evaluation;

    beforeEach(function(done) {
      request(app)
        .get('/api/evaluations/' + newEvaluation._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          evaluation = res.body;
          done();
        });
    });

    afterEach(function() {
      evaluation = {};
    });

    it('should respond with the requested evaluation', function() {
      expect(evaluation.name).to.equal('New Evaluation');
      expect(evaluation.info).to.equal('This is the brand new evaluation!!!');
    });

  });

  describe('PUT /api/evaluations/:id', function() {
    var updatedEvaluation;

    beforeEach(function(done) {
      request(app)
        .put('/api/evaluations/' + newEvaluation._id)
        .send({
          name: 'Updated Evaluation',
          info: 'This is the updated evaluation!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedEvaluation = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedEvaluation = {};
    });

    it('should respond with the updated evaluation', function() {
      expect(updatedEvaluation.name).to.equal('Updated Evaluation');
      expect(updatedEvaluation.info).to.equal('This is the updated evaluation!!!');
    });

  });

  describe('DELETE /api/evaluations/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/evaluations/' + newEvaluation._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when evaluation does not exist', function(done) {
      request(app)
        .delete('/api/evaluations/' + newEvaluation._id)
        .expect(404)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

  });

});
