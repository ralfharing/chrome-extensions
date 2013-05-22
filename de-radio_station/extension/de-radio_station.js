/**
 * @author Ralf Haring 2013-05-22
 */

// all the constants in one place
var str = {
    card : 'div.card',
    radio_station : 'div[data-type="im"]',
    small_card_group : 'div.card-group.small:first',
    content_pane : 'div.g-content:last-child',
    listen_now : '#nav_collections li[data-type="now"]',
    loading_screen : '#loading-progress'
};

// container for all albums, radio stations, and playlists
var album_pane = $('#main')[0];
// loading progress bar
var loading_screen = $(str.loading_screen)[0];

// does the work
var remove_stations = function(){
    // only proceed if in the Listen Now tab or if initial loading has just finished
    if((this == observer && $(str.listen_now).hasClass('selected')) ||
       (this == loading_observer && $(str.loading_screen).hasClass('fadeout'))){
        // change all large cards to small
        $(str.card).removeClass('large').addClass('small');
        // remove radio stations
        $(str.radio_station).remove();

        // TODO: allow user to select types
        /*
         al albums
         pl playlists
        sal suggested albums
         im radio station (auto)
         st radio station (user)
        */

        // backup all the cards
        cards = $(str.card);
        // backup empty container and change dimensions to hold one album each
        card_group = $(str.small_card_group).empty().css('height', '255px');
        // flush everything that exists
        $(str.content_pane).empty();

        // repopulate with all relevant small cards
        for(var i = 0; i < cards.length; i++){
            card_group.clone().append(cards[i]).appendTo(str.content_pane);
        }
    }
};

// create an observer to delete the radio stations
// watch for new children to be added
var observer = new WebKitMutationObserver(remove_stations);
observer.observe(album_pane, {childList: true});

// create an observer to do the initial pass
// watch for page to finish loading
var loading_observer = new WebKitMutationObserver(remove_stations);
loading_observer.observe(loading_screen, {attributes: true, attributeFilter: ['class']});