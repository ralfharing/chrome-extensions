/**
 * @author Ralf Haring 2013-10-15
 */

var doWork = function(){
    // searches are only present at first in a script tag
    // parse it to get human readable text and create hrefs

    // strip out newlines and empty array bits that break JSON.parse
    var searchText = $("script:contains('key: \'23\'')").text().replace(/\n/g, '').replace(/\[,,?\[/g, '[[');
    // strip out function surrounding everything
    var startPos = searchText.indexOf('["osi.gc"');
    searchText = searchText.substr(startPos, searchText.length - startPos - 3);
    var searchArray = JSON.parse(searchText)[1];
    var searches = [];

    for(var j=0; j < searchArray.length; j++){
        // push elements like ["#human readable", "%23human%20readable"]
        searches.push([searchArray[j][1], encodeURIComponent(searchArray[j][1])]);
    }

    // loop and construct the searches card

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