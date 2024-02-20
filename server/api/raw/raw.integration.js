'use strict';

var app = require('../..');
import request from 'supertest';

var newRaw;

describe('Raw API:', function() {

  describe('GET /api/raws', function() {
    var raws;

    beforeEach(function(done) {
      request(app)
        .get('/api/raws')
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          raws = res.body;
          done();
        });
    });

    it('should respond with JSON array', function() {
      expect(raws).to.be.instanceOf(Array);
    });

  });

  describe('POST /api/raws', function() {
    beforeEach(function(done) {
      request(app)
        .post('/api/raws')
        .send({
          name: 'New Raw',
          info: 'This is the brand new raw!!!'
        })
        .expect(201)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          newRaw = res.body;
          done();
        });
    });

    it('should respond with the newly created raw', function() {
      expect(newRaw.name).to.equal('New Raw');
      expect(newRaw.info).to.equal('This is the brand new raw!!!');
    });

  });

  describe('GET /api/raws/:id', function() {
    var raw;

    beforeEach(function(done) {
      request(app)
        .get('/api/raws/' + newRaw._id)
        .expect(200)
        .expect('Content-Type', /json/)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          raw = res.body;
          done();
        });
    });

    afterEach(function() {
      raw = {};
    });

    it('should respond with the requested raw', function() {
      expect(raw.name).to.equal('New Raw');
      expect(raw.info).to.equal('This is the brand new raw!!!');
    });

  });

  describe('PUT /api/raws/:id', function() {
    var updatedRaw;

    beforeEach(function(done) {
      request(app)
        .put('/api/raws/' + newRaw._id)
        .send({
          name: 'Updated Raw',
          info: 'This is the updated raw!!!'
        })
        .expect(200)
        .expect('Content-Type', /json/)
        .end(function(err, res) {
          if (err) {
            return done(err);
          }
          updatedRaw = res.body;
          done();
        });
    });

    afterEach(function() {
      updatedRaw = {};
    });

    it('should respond with the updated raw', function() {
      expect(updatedRaw.name).to.equal('Updated Raw');
      expect(updatedRaw.info).to.equal('This is the updated raw!!!');
    });

  });

  describe('DELETE /api/raws/:id', function() {

    it('should respond with 204 on successful removal', function(done) {
      request(app)
        .delete('/api/raws/' + newRaw._id)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          done();
        });
    });

    it('should respond with 404 when raw does not exist', function(done) {
      request(app)
        .delete('/api/raws/' + newRaw._id)
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
