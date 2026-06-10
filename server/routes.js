/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
import {baseDirName} from './api/raw/raw.controller.js';
import lusca from 'lusca';
import * as auth from './auth/auth.service';

export default function(app) {
  app.use(lusca.csrf({angular:true}));
  app.use('/api/raws', require('./api/raw'));
  app.use('/api/things', require('./api/thing'));
  // Insert routes below
  app.use('/api/evaluations', require('./api/evaluation'));
  //app.get('/pdf', auth.hasRole('admin'),function(req, res){
  app.get('/pdf', function(req, res){
    if (!req.query||!req.query.filename) return res.status(500).json('No Query Filename included');
    const dirname = baseDirName(__dirname);
    const safePath = path.join(dirname, 'pdfs', req.query.filename);
    return res.sendFile(safePath,err=>{
      if (err) console.log(err);
      else console.log('file from `pdfs` folder sent successfully');
    });
  });
  app.get('/fileserver', function(req, res){
    if (!req.query||!req.query.filename) return res.status(500).json('No Query Filename included');
    const dirname = baseDirName(__dirname);
    const safePath = path.join(dirname, 'fileserver', req.query.filename);
    return res.sendFile(safePath,err=>{
      if (err) console.log(err);
      else console.log('file from `fileserver` folder sent successfully');
    });
  });
  app.get('/recordPDFs', function(req, res){
    if (!req.query||!req.query.filename) return res.status(500).json('No Query Filename included');
    const dirname = baseDirName(__dirname);
    const safePath = path.join(dirname, 'records', req.query.filename);
    return res.sendFile(safePath,err=>{
      if (err) console.log(err);
      else console.log('file from `records` folder sent successfully');
    });
  });
  app.get('/fileserver/attachments', function(req, res){
    if (!req.query||!req.query.filename) return res.status(500).json('No Query Filename included');
    const dirname = baseDirName(__dirname);
    const safePath = path.join(dirname, 'fileserver','attachments', req.query.filename);
    return res.sendFile(safePath,err=>{
      if (err) console.log(err);
      else console.log('file from `fileserver/attachments` folder sent successfully');
    });
  });
  app.use('/api/pilots', require('./api/pilot'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
    });
}
