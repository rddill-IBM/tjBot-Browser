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
** z2c-speech.js
*/

var lights, LEDcolor;
var wave;
var sentiment, sentiment_icon;
var conversation, factoid;
var flasher;
var rh_panel;
var bSentiment = false;
var canvasFrame, context, FPS, stream;
var socketAddr = "ws://192.168.85.26:9876";
var wsSocket;


function initTJBot()
{
    var lights = $('#lights');
    wave = $('#wave');
    factoid = $('#factoid');
    sentiment = $('#sentiment');
    sentiment_icon = $('#sentiment_icon');
    conversation = $('#conversation');
    rh_panel = $('#rh_panel');
    flasher = $('#flasher');
    LEDcolor = $('#color');
    lights.on('click', function(){displayLightOptions();});
    wave.on('click', function(){runWave();});
    sentiment.on('click', function(){runSentiment();});
    conversation.on('click', function(){runConversation();});
    // factoid.on('click', function(){runFactoid();});
    LEDcolor.on('click', function(){runControlLED();});
    setTimeout(function (){console.log('stopping flasher'); flasher.empty(); flasher.append('<img src="./images/flasher.jpg" width="200">') }, 3000)
    FPS = 30;
    canvasFrame = $('#videoInput');
    console.log('initiating post request to /tjBot/getWebCam');
    wsSocket = new WebSocket(socketAddr);
    wsSocket.onmessage = function (data) {console.log("message from server");}
    wsSocket.onopen = function () {wsSocket.send('connected to client');};
    wsSocket.onerror = function (error) {console.log('WebSocket error on wsSocket: ' + error);};

    $.when($.post('/tjBot/getWebCam', {})).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
    
//    stream = $("#videoStream");
//    stream.src = 'http://localhost:8090/feed1.ffm';
}

function runLights(_pattern)
{
    var options = {};
    options.pattern = _pattern;
    $.when($.post('/tjBot/cycleLight', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}

function displayLightOptions()
{
    // replace this with an html page to select color pattern
    var patterns = {"patterns": [{"color": "white", "duration": "2"}, {"color": "red", "duration": "1"}, {"color": "yellow", "duration": "2"}, {"color": "green", "duration": "1"}, {"color": "purple", "duration": "2"} ]};
    runLights(patterns);
}

function runWave()
{
    var options = {};
    $.when($.post('/tjBot/wave', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}
function runConversation()
{
    var options = {};
    $.when($.post('/tjBot/conversation', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}
function runFactoid()
{
    var options = {};
    $.when($.post('/tjBot/factoid', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}
function runControlLED()
{
    var options = {};
    $.when($.post('/tjBot/controlLED', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}
function runSentiment()
{
    if (!bSentiment)
    {
        var options = {};
        options.topic = $("#sentiment_topic").val();
        console.log('options.topic: '+options.topic);
        sentiment_icon.empty(); sentiment_icon.append('<img src="./icons/stop.png" width="200">')
        $.when($.post('/tjBot/sentiment', options)).done(function(_res)
        {rh_panel.empty(); rh_panel.append(_res.results); bSentiment = true;});
    }else
    {cancelSentiment(); bSentiment=false;}
}
function cancelSentiment()
{
    var options = {};
    $.when($.post('/tjBot/cancelSentiment', options)).done(function(_res)
    {
        sentiment_icon.empty(); sentiment_icon.append('<img src="./images/sentiment.png" width="200">')
        rh_panel.empty(); rh_panel.append(_res.results); });
}

function processVideo()
{
    var video = $("#videoInput")[0]; // video is the id of video tag
        console.log(stream);
        video.srcObject = stream;
        video.play();
}
