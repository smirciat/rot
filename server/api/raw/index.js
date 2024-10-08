'use strict';

var express = require('express');
var controller = require('./raw.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.post('/upload', controller.upload);
router.post('/list', controller.list);
router.post('/delete',controller.deleteFile);
router.put('/:id', controller.update);
router.patch('/:id', controller.update);
router.delete('/:id', controller.destroy);

module.exports = router;
