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
var Watson = require( 'watson-developer-cloud/conversation/v1' );
var config = require("../../env.json");
var format = require('date-format');
var fs = require('fs-extra');
var path = require('path');
const util = Object.create(require('./Z2B_Utilities').Z2B_Utility);
var myDB = require('./cloudant_utils');
myDB.authenticate(myDB.create, '');

var count = 0;

var conversation = new Watson({
  username: config.conversations.username,
  password: config.conversations.password,
  url: config.conversations.url,
  version_date: '2016-09-20',
  version: 'v1'
});
console.log(config.conversations);

/**
 * response connects to the previously defined conversation server and sends in the input and context information from the browser
 * @param {object} req - nodejs object with the request information 
 * req.body holds post parameters
 * req.body.input - text from browser
 * req.body.context - context from browser
 * @param {object} res - nodejs response object
 * @param {object} next - nodejs next object - used if this routine does not provide a response
 */
exports.response = function(req, res)
{
  // set the payload base options
  var payload = { workspace_id: config.conversations.workspace, context: {}, input: {text: ""} };
  // if req.body exists, then check for text and context information. use them if they are present
  if (req.body) {
    if (req.body.input) { payload.input.text = req.body.input; }
    if (req.body.context) { payload.context = req.body.context; }
  } else {
    return res.send({"error": "Nothing received to process"})}

    // create db write json data with input, count and context
    count++;
    var db_data = {};
    db_data.count = count;
    db_data.timestamp = new Date().toISOString();
    db_data.userIP = req.ip;
    db_data.input = req.body.input;
    db_data.context = req.body.context;
    db_data.versiondate = '2018-01-18';
    db_data.version = '0.2';
    if (req.body.input === 'Hi There!') 
      {
        res.cookie('user', db_data.timestamp, { maxAge: 900000, httpOnly: true });
        db_data.user = db_data.timestamp;
      }
      else
      {db_data.user = decodeURIComponent(util.getCookieValue(req.headers.cookie, "user"));}
    
    (function(_payload, _db_data)
    {
      // connect to the conversation workspace identified as config.conversations.workspace and ask for a response
      conversation.message(_payload, function(err, data)
      {
        // return error information if the request had a problem
        var db_save = {};
        for (each in _db_data){(function(_idx, _arr){db_save[_idx] = _arr[_idx];})(each, _db_data);}
        if (err) 
        {
          console.log('conversation error: ', err);
          // append dbwrite json data with error info
          db_save.output={"result": "error", "code": err.code, "message": err.message};
          // write to db
          myDB.insert('resumebot', db_save.timestamp, db_save, function(err, response, body)
          {
            console.log('error on db access: ', body);
            return res.status(err.code || 500).json(err); 
          });
        }else
        // or send back the results if the request succeeded
        {
          // append dbwrite json data with success info
          db_save.output={"result": "success", "data": data};
          // write to db
          myDB.insert('resumebot', db_save.timestamp, db_save, function(err, response, body)
          {
          return res.send({"id": body.id, "rev": body.rev, "data": data});
          });
        }
      });
    })(payload, db_data)
}

exports.train = function(req, res, next)
{
  // get the record
  myDB.get('resumebot', req.body.id, function(err, response, body)
  {
    var _resp = JSON.parse(response);
    _resp.relevance = req.body.relevance;
    _resp.trainInfo = req.body.training;
    myDB.update('resumebot',_resp._id, _resp, function(err, response, body)
    {
      console.log("err: ", err);
      res.send('done');
    });
  });
  // add training data
  // save the record
}

exports.getAllRecords = function(req, res, next)
{
  var _method = 'getAllRecords';
  console.log(_method+' entered');
  myDB.listAllDocuments('resumebot', function(err, response, body)
  {
    if(err) {console.log('error:'+err.message); res.send({"result": "error", "data": err});}
    else {console.log('success, response: ', response); res.send ({"result": "success", "data": response});}
  });
}