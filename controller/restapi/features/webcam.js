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
var ffmpeg = require('fluent-ffmpeg');
exports.getWebCam = function(req, res, next)
{
    
    ffmpeg.ffprobe('/raw/rawctl1', function(err, metadata) { if (err) {console.log('/raw/rawctl1: ',err)} else {console.dir('/raw/rawctl1: ',metadata); }});

    res.send('getWebCam processing');       
    /*
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