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
var util = Object.create(require('./Z2B_Utilities'));
var raspividStream = require('raspivid-stream');
var http = require('http');
var webSocket = require('websocket');
var socketAddr = "9876";
var ws = new webSocket.server({httpServer: http.createServer().listen(socketAddr)});
    util.displayObjectProperties(ws);
    ws.on('request', function(request) 
    {
        ws = request.accept(null, request.origin);
        ws.on('message', function(message)
        {
            console.log(message.utf8Data);
            ws.sendUTF('connected');
            ws.on('close', function(m_connection) {console.log('m_connection closed'); });
        });
    });

 
var stream = raspividStream();
 
exports.getWebCam = function(req, res, next)
{
    
    // To stream over websockets: 
    console.log(ws);
    var videoStream = raspividStream();

    videoStream.on('data', function(data) {
        ws.send(data, { binary: true }, function (error) { if (error) console.error(error); });
    });
        res.send('getWebCam processing');       
    /*
    raspivid -o - -t 0 -vf -hf -fps 10 -b 500000 | ffmpeg -re -ar 44100 -ac 2 -acodec pcm_s16le -f s16le -ac 2 -i /dev/zero -f h264 -i - -vcodec copy -acodec aac -ab 128k -g 50 -strict experimental -f mp4 rtmp://localhost:9876
    var proc = ffmpeg('/dev/video0')
                //.format('h264')
                .inputOptions([
                    '-f v4l2',
                    '-framerate 25',
                    '-video_size 300x200'
                ])
                .outputOptions([
                    '-f rtsp',
                    '-rtsp_transport tcp',
                    'rtsp://localhost:7002/live.sdp'
                ])
                //.output('rtsp://localhost:7002/live.sdp')
                .on('end',function(msg){
                    console.log("finish ffmpeg command " + msg);
                })
                .on('err',function(err){
                    console.log("error found " + err);
                });
                */
}