/**
 * Copyright 2015 IBM Corp. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
/*
 * TJ Bot Browser
 */
var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var mime = require('mime');
var bodyParser = require('body-parser');
var cfenv = require('cfenv');

var cookieParser = require('cookie-parser');
var session = require('express-session');

var vcapServices = require('vcap_services');
var uuid = require('uuid');
var env = require('./controller/env.json');
var sessionSecret = env.sessionSecret;
var appEnv = cfenv.getAppEnv();
var app = express();
var busboy = require('connect-busboy');
app.use(busboy());

if (cfenv.getAppEnv().isLocal !== true)
{
  app.enable('trust proxy');
  app.use (function (req, res, next) 
  {
    if (req.secure) {next();}
    else {res.redirect('https://' + req.headers.host + req.url);}
  });
}

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.set('appName', 'tjBotController');
app.set('port', appEnv.port);

app.set('views', path.join(__dirname + '/HTML'));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/HTML'));
app.use(bodyParser.json());

// Define your own router file in controller folder, export the router, add it into the index.js.
// app.use('/', require("./controller/yourOwnRouter"));

app.use('/', require("./controller/restapi/router"));

    var server = app.listen(app.get('port'), function() {console.log('Listening on port %d', server.address().port);});
/*
*/
function loadSelectedFile(req, res) {
    var uri = req.originalUrl;
    var filename = __dirname + "/HTML" + uri;
    fs.readFile(filename,
        function(err, data) {
            if (err) {
                console.log('Error loading ' + filename + ' error: ' + err);
                return res.status(500).send('Error loading ' + filename);
            }
            var type = mime.lookup(filename);
           res.setHeader('content-type', type);
            res.writeHead(200);
            res.end(data);
        });
}
