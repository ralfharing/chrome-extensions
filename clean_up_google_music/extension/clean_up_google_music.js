/**
 * @author Ralf Haring 2014-05-11
 */

// all the constants in one place
var str = {
    card : 'div.card',
    // hardcoding English probably breaks localized versions...
    // still don't know if "sal" has been completely retired...
    //album : 'div[data-type="album"]',
    album : 'div[data-type="album"]:not(:contains("Suggested new release"))',
    playlist : 'div[data-type="pl"]',
    instant_mix_user : 'div[data-type="st"]',
    instant_mix_auto : 'div[data-type="im"]',
    im_feeling_lucky : 'div[data-type="imfl"]',
    //suggested_album : 'div[data-type="sal"]',
    suggested_album : 'div[data-type]:contains("Suggested new release")',
    suggested_artist : 'div[data-is-radio][data-type="artist"]',
    suggested_genre : 'div[data-type="expgenres"]',
    // data-reason="12"  Free from Google
    // data-reason="2"   Recently Added to My Library
    // data-reason="3"   Recently played
    // data-reason="5"   Recently created
    free_from_google : 'div[data-reason="12"]',
    small_card_group : 'div.card-group.small:first',
    card_group : 'div.card-group',
    content_pane : 'div.g-content:last-child',
    listen_now : '#nav_collections li[data-type="now"]',
    loading_screen : '#loading-progress',
    settings_view : '.settings-view',
    footer : '#settings-footer'
};

// for user configurations, use sync storage for multiple chrome installs
var storage = chrome.storage.sync;

// one generic listener for all checkboxes. every interaction stores the setting.
var add_listeners = function(){
    $('#clean-up :checkbox').change(function(){
        var o = {};
        switch(this.id){
            case 'show_albums':
                o['show_albums'] = this.checked;
                break;
            case 'show_playlists':
                o['show_playlists'] = this.checked;
                break;
            case 'show_instant_mixes_user':
                o['show_instant_mixes_user'] = this.checked;
                break;
            case 'show_instant_mixes_auto':
                o['show_instant_mixes_auto'] = this.checked;
                break;
            case 'show_im_feeling_lucky':
                o['show_im_feeling_lucky'] = this.checked;
                break;
            case 'show_suggested_albums':
                o['show_suggested_albums'] = this.checked;
                break;
            case 'show_suggested_artists':
                o['show_suggested_artists'] = this.checked;
                break;
            case 'show_suggested_genres':
                o['show_suggested_genres'] = this.checked;
                break;
            case 'show_free_from_google':
                o['show_free_from_google'] = this.checked;
                break;
            case 'resize_cards':
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
            if(obj['show_albums'] == false){
                $(str.album).remove();
            }
            if(obj['show_playlists'] == false){
                $(str.playlist).remove();
            }
            if(obj['show_instant_mixes_user'] == false){
                $(str.instant_mix_user).remove();
            }
            if(obj['show_instant_mixes_auto'] == false){
                $(str.instant_mix_auto).remove();
            }
            if(obj['show_im_feeling_lucky'] == false){
                $(str.im_feeling_lucky).remove();
            }
            if(obj['show_suggested_albums'] == false){
                $(str.suggested_album).remove();
            }
            if(obj['show_suggested_artists'] == false){
                $(str.suggested_artist).remove();
            }
            if(obj['show_suggested_genres'] == false){
                $(str.suggested_genre).remove();
            }
            if(obj['show_free_from_google'] == false){
                $(str.free_from_google).remove();
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
            if(obj['show_im_feeling_lucky'] == true){
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
            // create [<div><div><div></div></div></div>]
            var header = $('<div>', {'class': 'settings-cluster settings-clean-up'})
                           .append($('<div>', {'class': 'header'})
                             .append($('<div>', {'class': 'title', text: 'Clean Up [Instant Mix/Radio Station]'})));

            // iterate through current settings and set checkbox defaults
            // create [<span></span><div><input><label></label><input><label></label>
            //         <input><label></label><input><label></label><input><label></label></div>]
            var first_row = $('<span>', {'class': 'settings-button-description', text: 'Check off the card types you wish to see'})
                              .add($('<div>').append($('<input>', {id: 'show_albums', type: 'checkbox', checked: obj['show_albums']})
                                .add($('<label>', {'for': 'show_albums', text: 'Albums'}))
                                .add($('<input>', {id: 'show_playlists', type: 'checkbox', checked: obj['show_playlists']}))
                                .add($('<label>', {'for': 'show_playlists', text: 'Playlists'}))
                                .add($('<input>', {id: 'show_instant_mixes_user', type: 'checkbox', checked: obj['show_instant_mixes_user']}))
                                .add($('<label>', {'for': 'show_instant_mixes_user', text: 'Instant Mixes (User)'}))
                                .add($('<input>', {id: 'show_instant_mixes_auto', type: 'checkbox', checked: obj['show_instant_mixes_auto']}))
                                .add($('<label>', {'for': 'show_instant_mixes_auto', text: 'Instant Mixes (Auto)'}))
                                .add($('<input>', {id: 'show_im_feeling_lucky', type: 'checkbox', checked: obj['show_im_feeling_lucky']}))
                                .add($('<label>', {'for': 'show_im_feeling_lucky', text: 'I\'m Feeling Lucky'}))));
            // create [<div><input><label></label><input><label></label><input><label></label></div>]
            var second_row = $('<div>').append($('<input>', {id: 'show_suggested_albums', type: 'checkbox', checked: obj['show_suggested_albums']})
                               .add($('<label>', {'for': 'show_suggested_albums', text: 'Suggested Albums'}))
                               .add($('<input>', {id: 'show_suggested_artists', type: 'checkbox', checked: obj['show_suggested_artists']}))
                               .add($('<label>', {'for': 'show_suggested_artists', text: 'Suggested Artists'}))
                               .add($('<input>', {id: 'show_suggested_genres', type: 'checkbox', checked: obj['show_suggested_genres']}))
                               .add($('<label>', {'for': 'show_suggested_genres', text: 'Suggested Genres'}))
                               .add($('<input>', {id: 'show_free_from_google', type: 'checkbox', checked: obj['show_free_from_google']}))
                               .add($('<label>', {'for': 'show_free_from_google', text: 'Free from Google'})));
            // create [<span></span>, <div><input><label></label></div>]
            var third_row = $('<span>', {'class': 'settings-button-description', text: 'Check off to force all cards to the uniform small size'})
                              .add($('<div>').append($('<input>', {id: 'resize_cards', type: 'checkbox', checked: obj['resize_cards']})
                                .add($('<label>', {'for': 'resize_cards', text: 'Resize All Cards to be Small'}))));
            // create [<div><div></div></div>]
            var boxes = $('<div>', {'class': 'settings-section-content', id: 'clean-up'})
                          .append($('<div>', {'class': 'buttons-section'})
                            .append([first_row, second_row, third_row]));

            // find "General" div and insert after
            var first_settings_section = $($(str.settings_view).children()[1]);
            first_settings_section.after(boxes).after(header);
        });

        // sleep for one second to make sure the nodes are properly there.
        // if done immediately, listeners weren't binding correctly.
        setTimeout(add_listeners, 1000);
    }
};

// check if storage is empty (first time extension runs, ever) and set defaults
storage.get(null, function(obj){
    var settings = {};
    var migrate = {album : 'show_albums',
                   playlist : 'show_playlists',
                   instant_mix_user : 'show_instant_mixes_user',
                   instant_mix_auto : 'show_instant_mixes_auto',
                   im_feeling_lucky : 'show_im_feeling_lucky',
                   suggested_album : 'show_suggested_albums',
                   suggested_artist : 'show_suggested_artists',
                   suggested_genre : 'show_suggested_genres',
                   resize_cards : 'resize_cards'};
    var defaults = {show_albums : true,
                    show_playlists : true,
                    show_instant_mixes_user : true,
                    show_instant_mixes_auto : false,
                    show_im_feeling_lucky : true,
                    show_suggested_albums : false,
                    show_suggested_artists : false,
                    show_suggested_genres : false,
                    show_free_from_google : true,
                    resize_cards : true};

    // if a new install or if using old settings
    if(! obj.hasOwnProperty('show_albums')){
        // loop through all possible old settings
        for(key in migrate){
            if(obj.hasOwnProperty(key)){
                // if there is a value for the old setting keep the previous value
                settings[migrate[key]] = obj[key];
            }else{
                // otherwise use the default (new installs or if any are missing)
                settings[migrate[key]] = defaults[migrate[key]];
            }
        }
        storage.clear(function(){
            storage.set(settings);
        });
    }else{
        // loop through all possible new settings
        for(key in defaults){
            // if any don't exist, add their default setting
            if(! obj.hasOwnProperty(key)){
                settings[key] = defaults[key];
            }
        }
        storage.set(settings);
    }
});

// container for all albums, instant mixes, and playlists
var album_pane = $('#main')[0];
// create an observer to delete the instant mixes
// watch for new children to be added
var observer = new WebKitMutationObserver(remove_mixes);
if(album_pane){
    observer.observe(album_pane, {childList : true});
}

// loading progress bar
var loading_screen = $(str.loading_screen)[0];
// create an observer to do the initial pass
// watch for page to finish loading
var loading_observer = new WebKitMutationObserver(remove_mixes);
if(loading_screen){
    loading_observer.observe(loading_screen, {attributes : true, attributeFilter : ['class']});
}