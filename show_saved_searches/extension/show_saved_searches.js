/**
 * @author Ralf Haring 2013-10-20
 */

var storage = chrome.storage.sync;

// TODO: add method of saving new searches
// TODO: add method of removing saved searches

function makeSearchCard(searches){
    // loop and construct the searches card in the G+ main stream

    // make card have two columns, so split it for easy adding during loop
    var firstPart = '<div tabindex="-1" class="nja"><div class="Ee fP Ue lk Ls" role="article"><div class="a5 Gi"><h3 class="EY Ni zj"><span>Saved Searches</span></h3></div><div class="B3 Kg"><div class="xj"><div class="p3"><ul class="Bx wg">';
    var middlePart = '</ul></div></div><div class="xj"><div class="q3"><ul class="Bx wg">';
    var lastPart = '</ul></div></div></div></div></div>';

    var emptyRow = '<li class="Zz fj A2" rowindex="ROW_INDEX"><div class="N5 Mq"><div class="VZb rVd"></div><span class="Jo"><a href="s/SEARCH_URL" target="_top" class="d-s ob FSc" tabindex="0">SEARCH_TEXT</a></span></div><div class="Xp"></div></li>';

    for(var i=0; i < searches.length; i++){
        var newRow = emptyRow.replace('SEARCH_TEXT', searches[i][0]).replace('SEARCH_URL', searches[i][1]).replace('ROW_INDEX', i);
        if(i < searches.length / 2){
            firstPart += newRow;
        }else{
            middlePart += newRow;
        }
    }

    var searchCard = firstPart + middlePart + lastPart;
    // insert after the share card
    $(searchCard).insertAfter('div[data-iid="sii2:111"]');
}

var doWork = function(){
    // array of human readable searches and urlized versions
    var searches = [];

    // searches are only present at first in a script tag.
    // parse it to get human readable text and create hrefs.
    // strip out newlines and empty array bits that break JSON.parse.
    var searchText = $("script:contains('key: \'23\'')").text().replace(/\n/g, '').replace(/\[,,?\[/g, '[[');

    // on 15 November 2013 when Google turns off saved searches, the above script
    // tag presumably won't exist anymore. in that case, retrieve the saved
    // searches from chrome.storage instead.
    if(searchText == ""){
        storage.get(null, function(obj){
            var stored_searches = [];
            // convert the storage object to an array to sort
            for(x in obj){
                stored_searches.push([x, obj[x]]);
            }
            // pass in custom sort function for newest-first
            stored_searches.sort(function(a, b){
                return b[1] - a[1];
            });
            // drop the dates and create the searches array using the search
            // text and the encoded version for the actual link
            searches = stored_searches.map(function(y){return [y[0], encodeURIComponent(y[0])]});
            makeSearchCard(searches);
        });
    }else{
        // strip out function surrounding everything
        var startPos = searchText.indexOf('["osi.gc"');
        searchText = searchText.substr(startPos, searchText.length - startPos - 3);
        var searchArray = JSON.parse(searchText)[1];
        // just the human readable parts for saving to chrome.storage
        var simple_searches = [];

        for(var j=0; j < searchArray.length; j++){
            // push elements like ["#human readable", "%23human%20readable"]
            searches.push([searchArray[j][1], encodeURIComponent(searchArray[j][1])]);
            simple_searches.push(searchArray[j][1]);
        }

        // reverse the array to get the timestamps right, earliest first
        simple_searches.reverse();
        storage.get(simple_searches, function(obj){
            // check if an entry already exists and if not save a new timestamp
            for(var k=0; k < simple_searches.length; k++){
//                console.log("checking " + k + " " + simple_searches[k]);
                var search_name = simple_searches[k];
                if(! obj.hasOwnProperty(search_name)){
//                    console.log("saving " + search_name);
                    var o = {};
                    o[search_name] = new Date().valueOf();
                    storage.set(o);
                }
            }
        });
        makeSearchCard(searches);
    }
};

// wait until page is fully loaded
$(document).ready(function(){
    doWork();
});

// navid="1" is the home button on the left sidebar
var homeButton = document.querySelector('div[navid="1"]').firstChild.firstChild.firstChild;

// create an observer who will watch for modifications of the home button
var observer = new WebKitMutationObserver(function(mutations){
    // wait a second for the rest of page to be
    // constructed before trying to insert saved searches
    setTimeout(doWork, 1000);
});

// watch for attribute level changes
observer.observe(homeButton, {attributes: true});