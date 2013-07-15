/**
 * @author Ralf Haring 2013-07-15
 */

// all the constants in one place
var str = {
    card : 'div.card',
    album : 'div[data-type="al"]',
    playlist : 'div[data-type="pl"]',
    suggested_album : 'div[data-type="sal"]',
    instant_mix_auto : 'div[data-type="im"]',
    instant_mix_user : 'div[data-type="st"]',
    small_card_group : 'div.card-group.small:first',
    content_pane : 'div.g-content:last-child',
    listen_now : '#nav_collections li[data-type="now"]',
    loading_screen : '#loading-progress',
    breadcrumbs : '#breadcrumbs span',
    device_settings : '.settings-manager-my-device'
};

// for user configurations, use sync storage for multiple chrome installs
var storage = chrome.storage.sync;

// one generic listener for all checkboxes. every interaction stores the setting.
var add_listeners = function(){
    $('#clean-up :checkbox').change(function(){
        var o = {};
        switch(this.id){
            case 'show-playlists':
                o['playlist'] = this.checked;
                break;
            case 'show-instant-mixes-auto':
                o['instant_mix_auto'] = this.checked;
                break;
            case 'show-instant-mixes-user':
                o['instant_mix_user'] = this.checked;
                break;
            case 'show-suggested-albums':
                o['suggested_album'] = this.checked;
                break;
            case 'show-albums':
                o['album'] = this.checked;
                break;
        }
        storage.set(o);
    });
};

// does the work
var remove_mixes = function(){
    // only proceed if in the Listen Now tab or if initial loading has just finished
    if((this == observer && $(str.listen_now).hasClass('selected')) ||
       (this == loading_observer && $(str.loading_screen).hasClass('fadeout'))){
        // change all large cards to small
        $(str.card).removeClass('large').addClass('small');

        // remove those items the user has unchecked
        storage.get(null, function(obj){
            if(obj['album'] == false){
                $(str.album).remove();
            }
            if(obj['playlist'] == false){
                $(str.playlist).remove();
            }
            if(obj['instant_mix_auto'] == false){
                $(str.instant_mix_auto).remove();
            }
            if(obj['instant_mix_user'] == false){
                $(str.instant_mix_user).remove();
            }
            if(obj['suggested_album'] == false){
                $(str.suggested_album).remove();
            }

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
        });
    }else if(this == observer && $(str.breadcrumbs).text() == "Settings"){
        // if the settings page is opened, insert clean up settings
        // between the two "General" and "Manage My Devices" sections

        storage.get(null, function(obj){
            // clean up header
            var header = '<div class="settings-section-header settings-clean-up"><div class="settings-title">Clean Up [Instant Mix/Radio Station]</div></div>';
            // iterate through current settings and set checkbox defaults
            var boxes = '<div class="settings-section-content" id="clean-up"><div class="buttons-section"><div><input id="show-albums" type="checkbox"';
            if(obj['album']){ boxes += ' checked'; }
            boxes += '><label for="show-albums">Albums</label><input id="show-playlists" type="checkbox"';
            if(obj['playlist']){ boxes += ' checked'; }
            boxes += '><label for="show-playlists">Playlists</label><input id="show-suggested-albums" type="checkbox"';
            if(obj['suggested_album']){ boxes += ' checked'; }
            boxes += '><label for="show-suggested-albums">Suggested Albums</label><input id="show-instant-mixes-user" type="checkbox"';
            if(obj['instant_mix_user']){ boxes += ' checked'; }
            boxes += '><label for="show-instant-mixes-user">Instant Mixes (User)</label><input id="show-instant-mixes-auto" type="checkbox"';
            if(obj['instant_mix_auto']){ boxes += ' checked'; }
            boxes += '><label for="show-instant-mixes-auto">Instant Mixes (Auto)</label></div></div></div>';

            // find "Manage My Devices" div and insert before
            $(str.device_settings).before(header);
            $(str.device_settings).before(boxes);
        });

        // sleep for one second to make sure the nodes are properly there.
        // if done immediately, listeners weren't binding correctly.
        setTimeout(add_listeners, 1000);
    }
};

// check if storage is empty (first time extension runs, ever) and set defaults
storage.get('album', function(obj){
    if(! obj.hasOwnProperty('album')){
        var settings = {'album' : true, 'suggested_album' : false, 'playlist' : true,
                        'instant_mix_auto' : false, 'instant_mix_user' : true};
        storage.set(settings);
    }
});

// container for all albums, instant mixes, and playlists
var album_pane = $('#main')[0];
// create an observer to delete the instant mixes
// watch for new children to be added
var observer = new WebKitMutationObserver(remove_mixes);
observer.observe(album_pane, {childList : true});

// loading progress bar
var loading_screen = $(str.loading_screen)[0];
// create an observer to do the initial pass
// watch for page to finish loading
var loading_observer = new WebKitMutationObserver(remove_mixes);
loading_observer.observe(loading_screen, {attributes : true, attributeFilter : ['class']});