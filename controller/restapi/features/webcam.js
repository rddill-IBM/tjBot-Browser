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

var fs = require('fs-extra');
var path = require('path');
var busboy = require('connect-busboy');
var watson = require('watson-developer-cloud');
var request = require('request');
var rl = require('readline-sync');
var sleep = require('sleep');
var config = require('../../env.json');
var util = require('./Z2B_Utilities').Z2B_Utility;
var raspividStream = require('raspivid-stream');
var raspivid = require('raspivid');
var fs = require('fs');
var http = require('http');
var webSocket = require('websocket');
var socketAddr = "9876";
var cs;
var ws = new webSocket.server({httpServer: http.createServer().listen(socketAddr)});
    ws.on('request', function(request) 
    {
        cs = request.accept(null, request.origin);
        cs.on('message', function(message)
        { console.log('message received: '+message.utf8Data); cs.sendUTF('connected'); });
        cs.on('close', function(m_connection) {console.log('connection closed'); });
        cs.on('data', function(m_connection) {console.log('data received', data);});
    });

    var video = raspivid();
    util.displayObjectProperties('video', video);
    util.displayObjectValues('video.server', video.server);
 
exports.getWebCam = function(req, res, next)
{
    video.on('data', function(data) {console.log('video data received'); cs.send(data);});
    res.send('getWebCam processing');       
}