/**
 * @author Ralf Haring 2013-10-19
 */

// all the constants in one place
var str = {
    card : 'div.card',
    album : 'div[data-type="album"]',
    playlist : 'div[data-type="pl"]',
    suggested_album : 'div[data-type="sal"]',
    instant_mix_auto : 'div[data-type="im"]',
    instant_mix_user : 'div[data-type="st"]',
    im_feeling_lucky : 'div[data-type="imfl"]',
    small_card_group : 'div.card-group.small:first',
    card_group : 'div.card-group',
    content_pane : 'div.g-content:last-child',
    listen_now : '#nav_collections li[data-type="now"]',
    loading_screen : '#loading-progress',
    device_settings : '.settings-manager-my-device',
    footer : '#settings-footer'
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
            case 'show-im-feeling-lucky':
                o['im_feeling_lucky'] = this.checked;
                break;
            case 'resize-cards':
                o['resize_cards'] = this.checked;
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
            if(obj['im_feeling_lucky'] == false){
                $(str.im_feeling_lucky).remove();
            }

            // backup all the cards
            var cards = $(str.card).toArray();
            // backup a small empty container and change dimensions to hold one album each
            var small_card_group = $(str.small_card_group).clone();
            $(small_card_group).empty().css('height', '255px');
            // backup clean copies of all existing containers
            var card_groups = $(str.card_group).empty().toArray();
            // flush everything that exists
            $(str.content_pane).empty();

            // deal with the I'm Feeling Lucky container as a one-off first
            if(obj['im_feeling_lucky'] == true){
                // pop off the relevant objects
                var imfl_group = card_groups.shift();
                var imfl_card = cards.shift();
                var card1 = cards.shift();

                // if cards are also to be smallified, pop off one more card.
                // then fix all the attributes as appropriate and append.
                if(obj['resize_cards'] == true){
                    $(card1).css('height', '160px');
                    var card2 = $(cards.shift()).css('height', '160px');
                    $(imfl_group).css('height', '255px').append(imfl_card).append(card1).append(card2).appendTo(str.content_pane);
                }else{
                    $(card1).removeClass('small').addClass('large');
                    $(imfl_group).append(imfl_card).append(card1).appendTo(str.content_pane);
                }
            }else{
                // chop off the ifl-group class for the case where we don't want to show it
                // and we don't want to smallify the cards. (if smallifying, the card_groups
                // array is ignored)
                $(card_groups[0]).removeClass('ifl-group');
            }

            // loop through different arrays depending on whether cards should be smallified.
            // if yes, for each card wrap a small card group around it and append.
            // else, for each existing card group, pop off relevant cards and fix them, then append.
            if(obj['resize_cards'] == true){
                while(cards.length > 0){
                    small_card_group.clone().append(cards.shift()).appendTo(str.content_pane);
                }
            }else{
                while(card_groups.length > 0){
                    // don't bother looping through all groups if no cards left
                    if(cards.length == 0) break;
                    var card_group = card_groups.shift();
                    var card1 = cards.shift();
                    if($(card_group).hasClass('large')){
                        $(card1).removeClass('small').addClass('large');
                        $(card_group).append(card1).appendTo(str.content_pane);
                    }else{
                        var card2 = cards.shift();
                        $(card_group).append(card1).append(card2).appendTo(str.content_pane);
                    }
                }
            }
        });
    }else if(this == observer && $(str.footer).length == 1){
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
            boxes += '><label for="show-instant-mixes-auto">Instant Mixes (Auto)</label><input id="show-im-feeling-lucky" type="checkbox"';
            if(obj['im_feeling_lucky']){ boxes += ' checked'; }
            boxes += '><label for="show-im-feeling-lucky">I\'m Feeling Lucky</label></div><div><input id="resize-cards" type="checkbox"';
            if(obj['resize_cards']){ boxes += ' checked'; }
            boxes += '><label for="resize-cards">Resize All Cards to be Small</label></div></div></div>';

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
    var settings = {};

    if(! obj.hasOwnProperty('resize_cards')){
        settings['resize_cards'] = true;
    }
    if(! obj.hasOwnProperty('im_feeling_lucky')){
        settings['im_feeling_lucky'] = true;
    }
    if(! obj.hasOwnProperty('album')){
        settings['album'] = true;
        settings['suggested_album'] = false;
        settings['playlist'] = true;
        settings['instant_mix_auto'] = false;
        settings['instant_mix_user'] = true;
    }
    storage.set(settings);
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