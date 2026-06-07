/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /api/things              ->  index
 * POST    /api/things              ->  create
 * GET     /api/things/:id          ->  show
 * PUT     /api/things/:id          ->  update
 * DELETE  /api/things/:id          ->  destroy
 */

'use strict';

import _ from 'lodash';
import {Thing} from '../../sqldb';
const admin = require('firebase-admin');
const serviceAccount = require('../../firebase.json');
//initialize admin SDK using serciceAcountKey
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const firebase_db = admin.firestore();

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

// Gets a list of Things
export function index(req, res) {
  return Thing.findAll()
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Gets a single Thing from the DB
export function show(req, res) {
  return Thing.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Creates a new Thing in the DB
export function create(req, res) {
  return Thing.create(req.body)
    .then(respondWithResult(res, 201))
    .catch(handleError(res));
}

// Updates an existing Thing in the DB
export function update(req, res) {
  if (req.body._id) {
    delete req.body._id;
  }
  return Thing.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(saveUpdates(req.body))
    .then(respondWithResult(res))
    .catch(handleError(res));
}

// Deletes a Thing from the DB
export function destroy(req, res) {
  return Thing.find({
    where: {
      _id: req.params.id
    }
  })
    .then(handleEntityNotFound(res))
    .then(removeEntity(res))
    .catch(handleError(res));
}

async function getDocument(collectionName, documentId) {
  let data={};
  const docRef = firebase_db.collection(collectionName).doc(documentId);
  const doc = await docRef.get();
  if (!doc.exists) {
    console.log('No such document!');
  } else {
    data=doc.data();
    data._id=documentId;
    console.log('Document data:', doc.data());
  }
  return data;
}

export async function getCollectionQuery(collectionName,limit,parameter,operator,value,timestampBoolean,parameter2,operator2,value2) {
  try {
    for (let s of [collectionName,limit,parameter,operator,value,timestampBoolean]){
      console.log(s);
    }
    if (timestampBoolean) {
      value=admin.firestore.Timestamp.fromDate(new Date(value));
      if (value2) value2=admin.firestore.Timestamp.fromDate(new Date(value2));
    }
    const collectionRef = firebase_db.collection(collectionName);
    let date1,date2,date3;
    let querySnapshot, querySnapshot1, querySnapshot2;
    if (!value2) querySnapshot = await collectionRef.where(parameter, operator , value).orderBy('date', 'desc').limit(limit).get();
    else querySnapshot = await collectionRef.where(parameter, operator , value).where(parameter2, operator2 , value2).orderBy('date', 'desc').limit(limit).get();
    if (parameter==="false"){//"dateString")  {
      date3=new Date(value);
      date2=new Date(value);
      date1=new Date(value);
      date2.setDate(date2.getDate() - 1);
      date1.setDate(date1.getDate() - 2);
      date2=date2.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
      date1=date1.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' });
      querySnapshot1 = await collectionRef.where(parameter, operator , date1).orderBy('date', 'desc').limit(limit).get();
      querySnapshot2 = await collectionRef.where(parameter, operator , date2).orderBy('date', 'desc').limit(limit).get();
    }
    let mergedData=[];
    if (querySnapshot1){
      querySnapshot1.forEach((doc1) => {
        mergedData.push(doc1);
        //console.log(doc.id, '=>', doc.data());
      });
    }
    if (querySnapshot2){
      querySnapshot2.forEach((doc2) => {
        mergedData.push(doc2);
        //console.log(doc.id, '=>', doc.data());
      });
    }
    querySnapshot.forEach((doc) => {
      mergedData.push(doc);
      //console.log(doc.id, '=>', doc.data());
    });
    return mergedData;
  } catch (error) {
    console.error('Error getting collection:', error);
  }
}

export async function getCollectionLimited(collectionName,limit) {
  try {
    const collectionRef = firebase_db.collection(collectionName);
    const querySnapshot = await collectionRef.orderBy('date', 'desc').limit(limit).get();

    querySnapshot.forEach((doc) => {
      //console.log(doc.id, '=>', doc.data());
    });
    return querySnapshot;
  } catch (error) {
    console.error('Error getting collection:', error);
  }
}

async function getCollection(collectionName) {
  try {
    const collectionRef = firebase_db.collection(collectionName);
    const querySnapshot = await collectionRef.get();

    querySnapshot.forEach((doc) => {
      //console.log(doc.id, '=>', doc.data());
    });
    return querySnapshot;
  } catch (error) {
    console.error('Error getting collection:', error);
  }
}

async function updateDocument(collection,docId,data) {
   if (!docId) docId=Date.now().toString();
   const docRef = firebase_db.collection(collection).doc(docId);
   try {
     await docRef.set(data, { merge: true });
     console.log('Document successfully updated!');
     const docSnap = await docRef.get();
     data = docSnap.data();
     data._id=docId;
     return data;
   } catch (error) {
     console.error('Error updating document:', error);
     return false;
   }
}

function collectionToArray(result){
  let array=[];
  result.forEach(doc=>{
    let obj=doc.data();
    obj._id=doc.id;
    array.push(obj);
  });
  return array;
}

export async function firebaseDoc(req,res){
  let collection=req.body.collection||'flights';
  let documentId=req.body._id||'759-051725-1';
  try {
    const result=await getDocument(collection,documentId);
    return res.status(200).json(result);
  } catch(err){
    console.log(err);
    return res.status(500).json(err);
  }
}

export async function firebase(req,res){
  let collection=req.body.collection;
  const result=await getCollection(collection);
  let array=collectionToArray(result);
  //console.log(array);
  return res.status(200).json(array);
}

export async function firebaseQueryFunction(collection,limit,parameter,operator,value,timestampBoolean){
  const result=await getCollectionQuery(collection,limit,parameter,operator,value,timestampBoolean);
  return collectionToArray(result);
}

export async function firebaseQuery(req,res){
  try {
    let collection=req.body.collection||'pilots';
    let limit=req.body.limit||50;
    let parameter=req.body.parameter||'pilotEmployeeNumber';
    let operator=req.body.operator||'==';
    let value=req.body.value||'933';
    let timestampBoolean=req.body.timestampBoolean||false;
    const result=await getCollectionQuery(collection,limit,parameter,operator,value,timestampBoolean,req.body.parameter2,req.body.operator2,req.body.value2);
    let array=collectionToArray(result);
    return res.status(200).json(array);
  }
  catch(err){
    return res.status(501).json(err)
  }
}

export async function firebaseLimited(req,res){
  let collection=req.body.collection;
  let limit=req.body.limit||50;
  const result=await getCollectionLimited(collection,limit);
  let array=collectionToArray(result);
  if (res) return res.status(200).json(array);
  return array;
}

export async function updateFirebase(req,res){
  console.log(req.body)
  let collection=req.body.collection;
  let localDoc=req.body.doc;
  let id;
  if (localDoc._id) id = localDoc._id.toString();
  delete localDoc._id;
  console.log(localDoc)
  updateDocument(collection, id, localDoc).then((data)=>{
    if (data) return res.status(200).json(data);
    return res.status(500).json('No response from firebase')
  });
}

export async function deleteFirebase(req,res) {
  const collection='records';
  const docId=req.body.id;
  if (!docId) return res.status(500).json('No ID in this call');
  try {
    const docRef = firebase_db.collection(collection).doc(docId);
    await docRef.delete();
    return res.status(200).json('Document Deleted');
  }
  catch(err){
    console.log(err);
    return res.status(500).json('Error Trying to Delete from Firestore');
  }
}
