'use strict';

var express = require('express');
var controller = require('./thing.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);
router.post('/firebase',controller.firebase);
router.post('/firebaseDoc',controller.firebaseDoc);
router.post('/firebaseLimited',controller.firebaseLimited);
router.post('/firebaseQuery',controller.firebaseQuery);
router.post('/updateFirebase',controller.updateFirebase);
router.post('/deleteFirebase',controller.deleteFirebase);

module.exports = router;
