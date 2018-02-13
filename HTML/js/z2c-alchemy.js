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
// z2c-alchemy.js

function initiateAlchemy()
{
  var _btn = $("#getNews"); var _co = $("#company");
  $("#days").val(5); $("#count").val(5);
  console.log("initiateAlchemy");
  _btn.on("click",  function() {
    // get selector value
    var _feed = $("#newsfeed");
    var _days = $("#days");
    var _count = $("#count");
    console.log("initiateAlchemy button clicked");
    if (_co.val() == "") {$("#newsfeed").empty(); $("#newsfeed").append("<p>Please enter a company identifier</p>"); return;}
    getAlchemyNews(_feed, _co.val(), _days.val(), _count.val(), displayAlchemyNews);
  });
}

function getAlchemyNews(_target, _key, _days, _count, alchemyDisplay)
{
  var _url_base = "https://gateway-a.watsonplatform.net/calls/data/GetNews?outputMode=json&start=now-{1}d&end=now&dedup=true&count={2}&&q.enriched.url.enrichedTitle.entities.entity.type=company&q.enriched.url.enrichedTitle.entities.entity.text=O[{0}]&return=enriched.url.url,enriched.url.title,enriched.url.enrichedTitle.relations.relation.subject.entities.entity.disambiguated.website,enriched.url.enrichedTitle.docSentiment.type,enriched.url.author&apikey=149c9015e8654ddceba4fd24875f98f398a1792c"
  var keywords = "";
  var _keywords = _key.split(",");
  for (each in _keywords) {(function(_idx, _terms){keywords+=encodeURIComponent(_terms[_idx])+"^";}(each, _keywords))}
  keywords = keywords.substring(0,keywords.length-1);
  console.log("keyword list: "+keywords);
  console.log("key: "+_key+" count: "+_count+" days: "+_days);
  var _url = _url_base.format(keywords, _days, _count);
  console.log(_url);
  $.when($.get(_url)).done(function(_data) {
    var myData = _data;
    alchemyDisplay(_target, _data.result.docs);
    console.log(_data.result.docs[0].source);
  });
}

function displayAlchemyNews(_target, _data)
{
  _target.empty();
  console.log("displayAlchemyNews entered with: "+_data);
  for (each in _data)
    { console.log("each: "+each);
      (function(_idx, _array)
    { var _hdr = "news_"+_idx+"_header";
      var _bdy = "news_"+_idx+"_content";
      var _author = "<tr><td>Written by: </td><td>"+_array[_idx].source.enriched.url.author+"</td></tr>";
      var _sentiment_icon;
      if (_array[_idx].source.enriched.url.enrichedTitle.docSentiment.type == "positive") {_sentiment_icon = '<td><img src="/icons/positive.png"></td>';}
      if (_array[_idx].source.enriched.url.enrichedTitle.docSentiment.type == "neutral") {_sentiment_icon = '<td><img src="/icons/neutral.png"></td>';}
      if (_array[_idx].source.enriched.url.enrichedTitle.docSentiment.type == "negative") {_sentiment_icon = '<td><img src="/icons/negative.png"></td>';}
      var _link = '<tr><td>Link: </td><td><a href="'+_array[_idx].source.enriched.url.url+'" target="_blank">'+_array[_idx].source.enriched.url.url+'</a>"';
      var _hdr_html = '<div class="acc_header off" id="'+_hdr+'" target="'+_bdy+'" onClick="accToggle(\'newsfeed\', \'news_'+_idx+'\');"><table><tr>'+_sentiment_icon+"<td>"+_array[_idx].source.enriched.url.cleanedTitle+'</td></tr></table></div >';
      var _bdy_html = '<div class="acc_body off" id="'+_bdy+'"><table>'+_author+_link+'</table></div>';
      _target.append(_hdr_html+_bdy_html);
//      _target.append(_bdy_html);
    })(each, _data);
    }
}
