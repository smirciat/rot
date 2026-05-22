/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';
//import lusca from 'lusca';
import * as auth from './auth/auth.service';

export default function(app) {
  app.use('/api/raws', require('./api/raw'));
  app.use('/api/things', require('./api/thing'));
  //app.use(lusca.csrf({angular:true}));
  // Insert routes below
  app.use('/api/evaluations', require('./api/evaluation'));
  //app.get('/pdf', auth.hasRole('admin'),function(req, res){
  app.get('/pdf', function(req, res){
    if (req.query) res.sendFile("./pdfs/" + req.query.filename, {root: __dirname});
    else res.status(500);
  });
  app.get('/fileserver', function(req, res){
    if (req.query) res.sendFile("./fileserver/" + req.query.filename, {root: __dirname});
    else res.status(500);
  });
  app.get('/records', function(req, res){
    if (req.query) res.sendFile("./records/" + req.query.filename, {root: __dirname});
    else res.status(500);
  });
  app.get('/fileserver/attachments', function(req, res){
    if (req.query) res.sendFile("./fileserver/attachments/" + req.query.filename, {root: __dirname});
    else res.status(500);
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
