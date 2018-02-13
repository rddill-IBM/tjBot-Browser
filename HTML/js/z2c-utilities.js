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
// utility functions

function getCookieValue(_name)
{
  var name = _name+"=";
  var cookie_array= document.cookie.split(";");
  for (each in cookie_array)
    { var c = cookie_array[each].trim();
      if(c.indexOf(name) == 0) return(c.substring(name.length, c.length));
    }
    return("");
}

// Inspired by http://bit.ly/juSAWl
// Augment String.prototype to allow for easier formatting.  This implementation
// doesn't completely destroy any existing String.prototype.format functions,
// and will stringify objects/arrays.
String.prototype.format = function(i, safe, arg) {

  function format() {
    var str = this, len = arguments.length+1;

    // For each {0} {1} {n...} replace with the argument in that position.  If
    // the argument is an object or an array it will be stringified to JSON.
    for (i=0; i < len; arg = arguments[i++]) {
      safe = typeof arg === 'object' ? JSON.stringify(arg) : arg;
      str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
    }
    return str;
  }

  // Save a reference of what may already exist under the property native.
  // Allows for doing something like: if("".format.native) { /* use native */ }
  format.native = String.prototype.format;

  // Replace the prototype property
  return format;

}();

// strip final period if exists
function trimStrip(_string)
{
  var str = _string.trim();
  var len = str.length;
  if(str.endsWith(".")) {str=str.substring(0,len-1);}
  if(str.endsWith(",")) {str=str.substring(0,len-1);}
  return(str);
}
function displayObjectProperties(_obj)
{
  for(var propt in _obj){ console.log("object property: "+propt ); }
}

function displayObjectValues (_string, _object)
{
  for (prop in _object){
      console.log(_string+prop+": "+(((typeof(_object[prop]) == 'object') || (typeof(_object[prop]) == 'function'))  ? typeof(_object[prop]) : _object[prop]));
    }
}

function accToggle(_parent, _body)
{
	var parent = "#"+_parent;
	var body="#"+_body+"_content";
	var header = "#"+_body+"_header";
  console.log("accToggle: body: "+body+" header: "+header);
	if ($(body).hasClass("on"))
		{$(body).removeClass("on"); $(body).addClass("off");
		$(header).removeClass("on"); $(header).addClass("off");
		}else
		{
		accOff(parent);
		$(body).removeClass("off"); $(body).addClass("on");
		$(header).removeClass("off"); $(header).addClass("on");
		}
}
function accOff(target)
{
	var thisElement = $(target);
	var childNodes = thisElement.children();
	for (each in childNodes)
		{var node = "#"+childNodes[each].id;
			if($(node).hasClass("on")) {$(node).removeClass("on");}
			$(node).addClass("off");
		}
}

function checkImageDroppable()
{
  var div = document.createElement('div');
  return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window;
}

function detectKey(event, cbfn)
{
  var code = (event.keyCode ? event.keyCode : event.which);
  if(code == 13)
  {
    switch(cbfn){
      case "login" :
      login();
      break;
      case "getMessage" :
      getMessage();
      break;
    }
  }
}

function smoothScroll (id) {
  console.log('div: '+id);
  var div = document.getElementById(id);
  console.log(id+ ' scrollHeight: '+div.scrollHeight+' clientHeight: '+div.clientHeight);
  $('#' + id).animate({
     scrollTop: div.scrollHeight - div.clientHeight
  }, 500);
}