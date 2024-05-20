/**
 * Main application file
 */

'use strict';

import express from 'express';
import fs from 'fs';
import sqldb from './sqldb';
import config from './config/environment';
import https from 'https';
import cors from 'cors';
var privateKey  = fs.readFileSync('/etc/letsencrypt/live/bering.ddns.net/privkey.pem', 'utf8');
var certificate = fs.readFileSync('/etc/letsencrypt/live/bering.ddns.net/fullchain.pem', 'utf8');
var credentials = {key: privateKey, cert: certificate};

// Populate databases with sample data
if (config.seedDB) { require('./config/seed'); }

// Setup server
let app = express();
let corsOptions = { 
    origin: [ 'https://bering.ddns.net:59090', 'https://bering.ddns.net:59091' ] 
}; 
app.use(cors(corsOptions));
//app.options(corsOptions, cors());
//var server = http.createServer(app);
let server = https.createServer(credentials,app);
require('./config/express').default(app);
require('./routes').default(app);

// Start server
function startServer() {
  app.angularFullstack = server.listen(config.port, config.ip, function() {
    console.log('Express server listening on %d, in %s mode', config.port, app.get('env'));
  });
}

sqldb.sequelize.sync()
  .then(startServer)
  .catch(function(err) {
    console.log('Server failed to start due to error: %s', err);
  });

// Expose app
exports = module.exports = app;
