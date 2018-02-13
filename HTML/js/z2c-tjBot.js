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

var lights;
var wave;
var sentiment;
var conversation;
var flasher;
var rh_panel;

function initTJBot()
{
var lights = $('#lights');
    wave = $('#wave');
    sentiment = $('#sentiment');
    conversation = $('#conversation');
    rh_panel = $('#rh_panel');
    flasher = $('#flasher');
    lights.on('click', function(){displayLightOptions();});
    wave.on('click', function(){runWave();});
    sentiment.on('click', function(){runSentiment();});
    conversation.on('click', function(){runConversation();});
    setTimeout(function (){console.log('stopping flasher'); flasher.empty(); flasher.append('./images/flasher.png'); }, 3000)
}

function runLights(_pattern)
{
    var options = {};
    options.pattern = _pattern;
    $.when($.post('tjBot/cycleLight', options)).done(function(_res)
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
    $.when($.post('tjBot/wave', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}
function runConversation()
{
    var options = {};
    $.when($.post('tjBot/conversation', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}
function runSentiment()
{
    var options = {};
    $.when($.post('tjBot/sentiment', options)).done(function(_res)
    {rh_panel.empty(); rh_panel.append(_res.results); });
}
