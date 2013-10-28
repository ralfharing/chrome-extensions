/**
 * @author Ralf Haring 2013-10-28
 */

var storage = chrome.storage.sync;

// loop and construct the searches card in the G+ main stream
function makeSearchCard(search_terms){
    // make card have two columns, so split it for easy adding during loop
    var first_part = '<div tabindex="-1" class="nja"><div class="Ee fP Ue lk Ls" role="article"><div class="a5 Gi"><h3 class="EY Ni zj"><span>Saved Searches</span></h3></div><div class="B3 Kg" id="saved_searches"><div class="xj"><div class="p3"><ul class="Bx wg">';
    var middle_part = '</ul></div></div><div class="xj"><div class="q3"><ul class="Bx wg">';
    var last_part = '</ul></div></div></div></div></div>';

    var empty_row = '<li class="Zz fj A2" rowindex="ROW_INDEX"><div class="N5 Mq"><div class="VZb rVd"></div><span class="Jo search_item"><a href="s/SEARCH_URL" target="_top" class="d-s ob FSc" tabindex="0">SEARCH_TEXT</a><span role="button" class="delete_button"></span></span></div><div class="Xp"></div></li>';

    for(var i=0; i < search_terms.length; i++){
        var new_row = empty_row.replace('SEARCH_TEXT', search_terms[i][0]).replace('SEARCH_URL', search_terms[i][1]).replace('ROW_INDEX', i);
        if(i < search_terms.length / 2){
            first_part += new_row;
        }else{
            middle_part += new_row;
        }
    }

    var search_card = first_part + middle_part + last_part;
    // insert after the share card
    $(search_card).insertAfter('div[data-iid="sii2:111"]');

    // add listeners for the buttons which delete the appropriate search <li>
    // elements as well as remove them from chrome.storage
    $('#saved_searches').on('click', 'span.delete_button', function(event){
        var search_term = this.previousSibling.text;
        $(this.parentNode.parentNode.parentNode).remove();
        storage.remove(search_term);
    });
}

var parseSearches = function(){
    // array of human readable searches and urlized versions
    var searches = [];

    // searches are only present at first in a script tag.
    // parse it to get human readable text and create hrefs.
    // strip out newlines and empty array bits that break JSON.parse.
    var search_js = $("script:contains('key: \'23\'')").text().replace(/\n/g, '').replace(/\[,,?\[/g, '[[');

    // on 15 November 2013 when Google turns off saved searches, the above script
    // tag presumably won't exist anymore. in that case, retrieve the saved
    // searches from chrome.storage instead.
//    search_js = "";
    if(search_js == ""){
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
        var start_pos = search_js.indexOf('["osi.gc"');
        search_js = search_js.substr(start_pos, search_js.length - start_pos - 3);
        var search_array = JSON.parse(search_js)[1];
        // just the human readable parts for saving to chrome.storage
        var simple_searches = [];

        for(var j=0; j < search_array.length; j++){
            // push elements like ["#human readable", "%23human%20readable"]
            searches.push([search_array[j][1], encodeURIComponent(search_array[j][1])]);
            simple_searches.push(search_array[j][1]);
        }

        // reverse the array to get the timestamps right, earliest first
        simple_searches.reverse();
        storage.get(simple_searches, function(obj){
            // check if an entry already exists and if not save a new timestamp
            for(var k=0; k < simple_searches.length; k++){
//                console.log('checking ' + k + ' ' + simple_searches[k]);
                var search_term = simple_searches[k];
                if(! obj.hasOwnProperty(search_term)){
//                    console.log('saving ' + search_term);
                    var o = {};
                    o[search_term] = new Date().valueOf();
                    storage.set(o);
                }
            }
        });
        makeSearchCard(searches);
    }
};

// wait until page is fully loaded
$(document).ready(function(){
    parseSearches();
});

// navid="1" is the home button on the left sidebar
var home_button = document.querySelector('div[navid="1"]').firstChild.firstChild.firstChild;

// create an observer who will watch for modifications of the home button
var observer = new WebKitMutationObserver(function(mutations){
    // wait a second for the rest of page to be
    // constructed before trying to insert saved searches
    setTimeout(parseSearches, 1000);
});

// watch for attribute level changes
observer.observe(home_button, {'attributes': true});

// enable the search button and make sure it shows as grey/green
function showSaveButton(search_term){
    storage.get(search_term, function(obj){
        if(Object.keys(obj).length == 0){
//            console.log(this.args[1] + ' does not exist');
            $('.save_button').removeClass('saved').css('visibility', 'visible');
        }else{
//            console.log(this.args[1] + ' exists');
            $('.save_button').addClass('saved').css('visibility', 'visible');
        }
    });
}

// listen when the input textbox changes and show/hide save button
$('#gbqfq').change(function(){
    if(this.value == ''){
//        console.log('2 hiding save button');
        $('.save_button').css('visibility', 'hidden');
    }else{
//        console.log('2 showing save button');
/* temporarily comment so delete button never shows
        showSaveButton(this.value);
*/    }
});

// when save button is clicked, update chrome.storage and button color
function clickSaveButton(){
//    console.log('3 clicking save button');
    var search_term = $('#gbqfq').val();
    if($('.save_button').hasClass('saved')){
//        console.log('3 ' + search_term + ' exists');
//        console.log('3 removing ' + search_term);
        storage.remove(search_term);
    }else{
//        console.log('3 ' + search_term + ' does not exist');
//        console.log('3 saving ' + search_term);
        var o = {};
        o[search_term] = new Date().valueOf();
        storage.set(o);
    }
    $('.save_button').toggleClass('saved');
}

// create the save button and add it as the first child of the input textbox div
$('<span role="button" class="save_button"></span>').prependTo('#gbqfqwb').click(clickSaveButton);

// do initial check on page load
if($('#gbqfq').val() != ''){
//    console.log('1 showing save button');
/* temporarily comment so delete button never shows
    showSaveButton($('#gbqfq').val());
*/}