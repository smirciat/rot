/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/raws              ->  index
 * POST    /api/raws              ->  create
 * GET     /api/raws/:id          ->  show
 * PUT     /api/raws/:id          ->  update
 * DELETE  /api/raws/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Raw} from '../../sqldb';
import fs from 'fs';

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

//export async function upload(req,res){
//  var file=new Buffer.from(req.body.data,"base64");
//  var obj = await bplist.parseFile(file);
//  var jsonData=JSON.stringify(obj);
//  res.status(200).json(jsonData);//(end();
//}

// Gets a list of Raws
export function index(req, res) {
  return Raw.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}


export function upload(req,res){
  let file=new Buffer.from(req.body.data,"base64");
  let filename=req.body.filename||"nofilename";
  filename=__dirname+'/../../fileserver/'+filename;
  fs.writeFileSync(filename,file);
  res.status(200).json("Response Text");
}

export function list(req,res){
  let folder=__dirname+'/../../fileserver';
  let files=fs.readdirSync(folder);
  let newFiles=[];
  files.forEach(file=>{
    if (Array.from(file)[0]!==".") newFiles.push(file);
  });
  let JsonData=JSON.stringify(newFiles);
  if (JsonData) res.status(200).json(JsonData);
}

export function deleteFile(req,res){
  let filename=__dirname+'/../../fileserver/'+req.body.filename;
  fs.unlinkSync(filename);
  res.status(200).json("File Deleted");
}

// Gets a single Raw from the DB
export function show(req, res) {
  return Raw.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Raw in the DB
export function create(req, res) {
  return Raw.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Raw in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Raw.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Raw from the DB
export function destroy(req, res) {
  return Raw.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}
