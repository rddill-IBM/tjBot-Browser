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
var TJBot = require('tjbot');
var sleep = require('sleep');
var Twitter = require('twitter');
var config = require('../../env.json');
var intervalID;

var tjConversation = new TJBot(['microphone', 'speaker', 'servo'], {log: {level: 'debug'}}, {"conversation": config.conversations, "speech_to_text": config.speech_to_text, "text_to_speech": config.text_to_speech});
var tjServo = new TJBot(['servo'], {log: {level: 'debug'}}, {});
var tjLED = new TJBot(['led'], {log: {level: 'debug'}}, {});
var tjSentiment = new TJBot(['led'], {log: {level: 'verbose'}}, config);

var twitterCreds = config.twitter;
var SENTIMENT_KEYWORD = twitterCreds.sentiment_keyword;
var SENTIMENT_ANALYSIS_FREQUENCY_MSEC = twitterCreds.sentiment_analysis_frequency_sec * 1000;
var twitter = new Twitter({
    consumer_key: twitterCreds.consumer_key,
    consumer_secret: twitterCreds.consumer_secret,
    access_token_key: twitterCreds.access_token_key,
    access_token_secret: twitterCreds.access_token_secret
});
var TWEETS = [];
var MAX_TWEETS = 100;
var CONFIDENCE_THRESHOLD = 0.5;
var WORKSPACEID = config.conversations.workspace;
var WORKSPACEID = config.conversations.factoidWorkspace;



/**
 * wave - Make the TJBot arm wave
 * @param {*} req NodeJS request object. Contains information sent to this function
 * @param {*} res NodeJS response object. Used exactly once in this function to respond to request
 * @param {*} next NodeJS next object. Used to pass processing on to next logical nodeJS service instead of "responding" to request
 */
exports.wave = function(req, res, next)
{
    console.log("wave entered");
    tjServo.wave();
    res.send({"results": "wave complete"});
}

/**
 * wave - Make the TJBot arm wave
 * @param {*} req NodeJS request object. Contains information sent to this function
 * @param {*} res NodeJS response object. Used exactly once in this function to respond to request
 * @param {*} next NodeJS next object. Used to pass processing on to next logical nodeJS service instead of "responding" to request
 */
exports.cancelSentiment = function(req, res, next)
{
    if (typeof((intervalID !== "undefined") && intervalID !== null))
    {
        clearInterval(intervalID); intervalID = null;
        res.send({"results": "Sentiment processing cancelled."});
    }else
    {
        res.send({"results": "Sentiment processing was not active."});
    }
}

/**
 * cycleLight. Cycle the lights through the requested pattern
 * @param {*} req NodeJS request object. Contains information sent to this function
 *  req.body.pattern contains a JSON object with one or more elements. Each element specifies a color and a time to wait before cycling the next color.
 *  pattern = { patterns: [ { color: `blue`, duration: `# seconds to display`}]}
 * @param {*} res NodeJS response object. Used exactly once in this function to respond to request
 * @param {*} next NodeJS next object. Used to pass processing on to next logical nodeJS service instead of "responding" to request
 */
exports.cycleLight = function(req, res, next)
{
    var pattern = req.body.pattern
    var _len = pattern.patterns.length;
    var _cur = 0;
    pattern.patterns.forEach(function(_pattern) {
        _cur++;
         console.log('Processing '+_cur+' of '+_len+' : '+_pattern.color+' for '+_pattern.duration+' seconds');
         tjLED.shine(_pattern.color);
         sleep.sleep(parseInt(_pattern.duration, 10));
     });
     tjLED.shine('blue');
     res.send({"results": "Color Cycle Complete."});
}
/**
 * getColors. get an array of colors available on this tjBot
 * @param {*} req NodeJS request object. Contains information sent to this function
 * @param {*} res NodeJS response object. Used exactly once in this function to respond to request
 * @param {*} next NodeJS next object. Used to pass processing on to next logical nodeJS service instead of "responding" to request
 */
exports.getColors = function(req, res, next)
{
    var _colors = tj.shineColors();
    res.send({"colors": _colors});
}

/**
 * sentiment - invoke the sentiment against twitter function
 * @param {*} req NodeJS request object. Contains information sent to this function
 * @param {*} res NodeJS response object. Used exactly once in this function to respond to request
 * @param {*} next NodeJS next object. Used to pass processing on to next logical nodeJS service instead of "responding" to request
 */
exports.sentiment = function(req, res, next)
{
    res.send({"results": "Request to perform sentiment analysis received."});
        // monitor twitter
        console.log('monitoring twitter');
        twitter.stream('statuses/filter', {track: SENTIMENT_KEYWORD }, function(stream) {
            stream.on('data', function(event) {
                if (event && event.text) {
                    var tweet = event.text;
                    // Remove non-ascii characters (e.g chinese, japanese, arabic, etc.) and
                    // remove hyperlinks
                    tweet = tweet.replace(/[^\x00-\x7F]/g, "");
                    tweet = tweet.replace(/(?:https?|ftp):\/\/[\n\S]+/g, "");
    
                    // keep a buffer of MAX_TWEETS tweets for sentiment analysis
                    while (TWEETS.length >= MAX_TWEETS) {
                        TWEETS.shift();
                    }
                    TWEETS.push(tweet);
                }
            });
    
            stream.on('error', function(error) {
                console.log("\nAn error has occurred while connecting to Twitter. Please check your twitter credentials, and also refer to https://dev.twitter.com/overview/api/response-codes for more information on Twitter error codes.\n");
                throw error;
            });
        });
    
        // perform sentiment analysis every N seconds
        intervalID = setInterval(function() {
            console.log("Performing sentiment analysis of the tweets, pulse light yellow, 1 second interval");
            tjSentiment.pulse('yellow', 1);
            shineFromTweetSentiment();
        }, SENTIMENT_ANALYSIS_FREQUENCY_MSEC);
    
}
function shineFromTweetSentiment() {
    // make sure we have at least 5 tweets to analyze, otherwise it
    // is probably not enough.
    if (TWEETS.length > 5) {
        var text = TWEETS.join(' ');
        tjSentiment.pulse('green', 0.5);
        console.log("Analyzing tone of " + TWEETS.length + " tweets. Pulsing light green, 0.5 second interval");

        tjSentiment.analyzeTone(text).then(function(tone) {
            tone.document_tone.tone_categories.forEach(function(category) {
                if (category.category_id == "emotion_tone") {
                    // find the emotion with the highest confidence
                    var max = category.tones.reduce(function(a, b) {
                        return (a.score > b.score) ? a : b;
                    });

                    // make sure we really are confident
                    if (max.score >= CONFIDENCE_THRESHOLD) {
                        shineForEmotion(max.tone_id);
                    }
                }
            });
        });
    } else {
        console.log("Not enough tweets collected to perform sentiment analysis");
    }
}

function shineForEmotion(emotion) {
    console.log("Current emotion around " + SENTIMENT_KEYWORD + " is " + emotion);

    switch (emotion) {
    case 'anger':
        tjSentiment.shine('red');
        break;
    case 'joy':
        tjSentiment.shine('yellow');
        break;
    case 'fear':
        tjSentiment.shine('magenta');
        break;
    case 'disgust':
        tjSentiment.shine('green');
        break;
    case 'sadness':
        tjSentiment.shine('blue');
        break;
    default:
        break;
    }
}

/**
 * conversation - load a conversation to tjBot
 * @param {*} req NodeJS request object. Contains information sent to this function
 * @param {*} res NodeJS response object. Used exactly once in this function to respond to request
 * @param {*} next NodeJS next object. Used to pass processing on to next logical nodeJS service instead of "responding" to request
 */
exports.conversation = function(req, res, next)
{
    res.send({"results": "starting conversation"});
    tjConversation.listen(function(msg) {
            // send to the conversation service
            tjConversation.converse(WORKSPACEID, msg, function(response) {
                // speak the result
                tjConversation.speak(response.description);
            });
    });   
}

/**
 * factoid - load the factoid conversation to tjBot
 * @param {*} req NodeJS request object. Contains information sent to this function
 * @param {*} res NodeJS response object. Used exactly once in this function to respond to request
 * @param {*} next NodeJS next object. Used to pass processing on to next logical nodeJS service instead of "responding" to request
 */
exports.factoid = function(req, res, next)
{
    res.send({"results": "starting conversation"});
    tjConversation.listen(function(msg) {
            // send to the conversation service
            tjConversation.converse(FACTOID, msg, function(response) {
                // speak the result
                tjConversation.speak(response.description);
            });
    });   
}
