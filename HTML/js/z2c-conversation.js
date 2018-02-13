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
// z2c-conversation.js
// browser support for conversation
// display interaction same as in Chapter 6 - custom dialog

// talk to me ... use the existing text to speech service to talk to the user
var _input;
var _conversation;
var _context = {};
var resArray;
var tInfo, tRow, tSubmit, tRelevance, tMsg, tResp, msgID, msgRev, _modal= $("#modal");

/**
 * Initialize the page
 */ 
function initiateConversation()
{
  _input = $("#textInput");
  _conversation = $("#conversation");
  _conversation.empty()
  initiateTraining();
  // start the conversation with Watson
  getResponse("Hi There!");
}
function initiateTraining()
{
  msgID = 0;
  tInfo = $("#trainInfo");
  tRow = $("#trainRow");
  tSubmit = $("#train");
  tRelevance = $("#relevance");
  tMsg = $("#msg");
  tResp = $("#resp");
  _modal.append("<center><h2 class='white'>Thanks!</h2><img src='icons/loading.gif' /></center>");
  _modal.height($(window).height());
  console.log($(window));
  _modal.addClass("modalDialog");
  _modal.hide();
  tRelevance.on('change', function()
  { 
    console.log("tRelevance.find(':selected').val(): "+tRelevance.find(':selected').val());
    if (tRelevance.find(':selected').val() === "2")
      {tRow.removeClass("off"); tRow.addClass("on");}
    else
    {if (tRow.hasClass('on')) {tRow.removeClass("on"); tRow.addClass("off");}}
  });
  tSubmit.on('click', function()
  {
    if (msgID === 0) {return;}
    var options = {};
    options.id = msgID;
    options.rev = msgRev;
    options.relevance = tRelevance.find(':selected').val();
    options.training = tInfo.val();
    _modal.show();
    $.when($.post('/api/train', options)).done(function(resp){
      tInfo.val('');
      tRelevance.val("0").change();
      tMsg.empty();
      tResp.empty();
      msgID = 0;
      _modal.hide();
    });
  });
}
/**
 * get the user's response in the conversation and send it to Watson
 */ 
function getMessage()
 {
   // copy the conversation from the text input box and create a new text bubble with that text
   _conversation.append('<div class="shape bubble1"><p>'+_input.val()+"</p></div>");
   // connect to the server and get the next step
   getResponse(_input.val());
   tMsg.empty(); tMsg.append(_input.val()); 
   tResp.empty();
   tRelevance.val(0);
   // empty the text input box
   _input[0].value = "";
}

/**
 * Connect to Watson conversation and get the next step
 * @param {String} _text - text to be sent to Watson
 */ 
function getResponse(_text)
{
  // initialize options
   var options = {};
   options.input = _text;
   options.context = _context;
   // request the next step from our nodejs server
   $.when($.post("/api/response", options)).then(
     function(res, _type, _jqXHR)
     {
      _context = res.context;
      var _image = '';
      // this function is entered if the request was successful
      //  if (options.input === "Hi There!") 
      //{_image = '<img src="/icons/wakeboarding.png">';}
      console.log("res: "+res);
      var _incoming = res;
      msgID = _incoming.id; 
      msgRev = _incoming.rev;
       console.log("z2c-conversations.js getMessage Success res",_incoming.data);
       _conversation.append('<div class="shape bubble2">'+_image+'<p>'+_incoming.data.output.text+"</p></div>");
       smoothScroll('conv_scroll');
       tResp.append(_incoming.data.output.text);
     },
   function(res, _type, _jqXHR)
     { 
       // this function is entered if the request was unsuccessful
       console.log("z2c-conversations.js getMessage Failure res.responseText",res.responseText);
      _conversation.append('<div class="shape bubble2"><p>'+res.responseText+"</p></div>");
     });
 }
/**
 * 
 * 
 */
function loadAdmin()
{
  $.when($.get('resumeAdmin.html')).done(function(_res){$('#body').empty(); $('#body').append(_res);});
}/**
 * 
 * 
 */
function getAllRecords()
{
  resArray = new Array();
  $.when($.get('/api/getAllRecords')).done(function(_res)
  { 
    console.log('getAllRecords complete');
    console.log(_res); 
    $('#resume_res').empty(); 
    var _str = "<h3>Resume Bot Interactions: "+_res.data.total_rows;
    for (each in _res.data.rows){(function(_idx, _arr){var _t = _arr[_idx]; _t.index= _t.doc.user+ _t.doc.timestamp; resArray.push(_t);})(each, _res.data.rows);}
    resArray.sort(function(a,b){return (b.index > a.index) ? 1 : -1;});
    var _current = "";
    var _sel = "";
    for (each in resArray){(function(_idx, _arr)
      {
        if (_idx === 1){console.log('['+_idx+']: '+_arr[_idx].doc.user); _current = _arr[_idx].doc.user; _sel='<option value="'+_arr[_idx].doc.user+'">'+_arr[_idx].doc.user+'</option>';}
        if (_arr[_idx].doc.user !== _current) {console.log('['+_idx+']: '+_arr[_idx].doc.user); _current = _arr[_idx].doc.user; _sel+='<option value="'+_arr[_idx].doc.user+'">'+_arr[_idx].doc.user+'</option>';}
      })(each, resArray);}
      console.log('_sel: '+_sel);
      $('#userIP').empty();
      $('#userIP').append(_sel);
      $('#resume_res').append(_str);
  });
}

/**
 * 
 * 
 */
function viewOneSeries()
{
  var _person = $("#userIP").find(':selected').val();
  console.log("selected id is: "+_person);
  var oneArray = new Array();
  var _str = "<h3>Resume Bot Interactions for : "+_person;
  _str += "<table border='1' width='100%'><tr><th>#</th><th><center>Question</center></th><th><center>Answer</center></th></tr>";
  $('#resume_res').empty(); 
for (each in resArray){(function(_idx, _arr){if (_arr[_idx].doc.user === _person) {oneArray.push(_arr[_idx]);}})(each, resArray)}
  oneArray.sort(function(a,b){return (b.doc.count < a.doc.count) ? 1 : -1;});  
  for (each in oneArray){(function(_idx, _arr){_str+='<tr class="acc_header off"><td>'+_arr[_idx].doc.count+'</td><td>'+_arr[_idx].doc.input+'</td><td>'+_arr[_idx].doc.output.data.output.text+'</td//tr>';})(each, oneArray)}
  _str += '</table>';
  $('#resume_res').append(_str);

}