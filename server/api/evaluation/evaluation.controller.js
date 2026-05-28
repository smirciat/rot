/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/evaluations              ->  index
 * POST    /api/evaluations              ->  create
 * GET     /api/evaluations/:id          ->  show
 * PUT     /api/evaluations/:id          ->  update
 * DELETE  /api/evaluations/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Evaluation} from '../../sqldb';

function respondWithResult(res, statusCode) {
  statusCode = statusCode || 200;
  return function(entity) {
    if (entity) {
      return res.status(statusCode).json(entity);
    }
    return null;
  };
}

function saveUpdates(updates) {
  return function(entity) {
    if(entity) {
      return entity.updateAttributes(updates)
        .then(updated => {
          return updated;
        });
    }
  };
}

function removeEntity(res) {
  return function(entity) {
    if (entity) {
      return entity.destroy()
        .then(() => {
          res.status(204).end();
        });
    }
  };
}

function handleEntityNotFound(res) {
  return function(entity) {
    if (!entity) {
      res.status(404).end();
      return null;
    }
    return entity;
  };
}

function handleError(res, statusCode) {
  statusCode = statusCode || 500;
  return function(err) {
    res.status(statusCode).send(err);
  };
}

// Gets a list of Evaluations
export function index(req, res) {
  return Evaluation.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Evaluation from the DB
export function show(req, res) {
  return Evaluation.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Evaluation in the DB
export function create(req, res) {
  return Evaluation.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Evaluation in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Evaluation.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Evaluation from the DB
export function destroy(req, res) {
  return Evaluation.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
