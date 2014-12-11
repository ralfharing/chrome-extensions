/**
 * @author Ralf Haring 2014-12-11
 */

// all the selectors in one place
var selector = {
    card : 'div.card',
    album : 'div[data-type="album"]',
    playlist : 'div[data-type="pl"]',
    instant_mix_user : 'div[data-type="st"]',
    instant_mix_auto : 'div[data-type="im"]',
    im_feeling_lucky : 'div[data-type="imfl"]',
    // data-reason="0"   ? ""
    // data-reason="1"   Recently purchased
    // data-reason="2"   Recently Added to My Library
    // data-reason="3"   Recently played
    // data-reason="4"   Recently subscribed
    // data-reason="5"   Recently created
    // data-reason="6"   Recently modified
    // data-reason="7"   Suggested new release
    // data-reason="8"   Recommended for you
    // data-reason="9"   Recommended album
    // data-reason="10"  Identified on Sound Search
    // data-reason="11"  Artist playing live near you
    // data-reason="12"  Free from Google
    suggested_album : 'div[data-reason="9"]',
    suggested_artist : 'div[data-is-radio][data-type="artist"]',
    suggested_genre : 'div[data-type="expgenres"]',
    free_from_google : 'div[data-reason="12"]',
    situations : 'div[data-type="situations"]',
    explore : 'div[data-type="exptop"]',
    small_card_group : 'div.card-group[data-size="small"]:first',
    card_group : 'div.card-group',
    content_pane : 'div.g-content:last-child',
    listen_now : '#nav_collections > [data-type="now"]',
    loading_screen : '#loading-progress',
    settings_view : '.settings-view',
    footer : '#settings-footer',
    keep_false : '[keep="false"]',
    album_pane : '#main',
    album_inner_pane : '.g-content',
    clean_up_section : '#clean-up',
    clean_up_checkboxes : '#clean-up :checkbox',
    explore_menu : '#explore-nav',
    shop_menu : '#shop-nav'
};

// for user configurations, use sync storage for multiple chrome installs
var storage = chrome.storage.sync;

// one generic listener for all checkboxes. every interaction stores the setting.
var add_listeners = function(){
    $(selector.clean_up_checkboxes).change(function(){
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
            case 'show_situations':
                o['show_situations'] = this.checked;
                break;
            case 'resize_cards':
                o['resize_cards'] = this.checked;
                break;
        }
        storage.set(o);
    });
};

// does the work
var filter_cards = function(mutations){
    // for debugging
    //if(this == refresh_observer && mutations[0].addedNodes.length == 1 &&
    //   mutations[0].addedNodes[0].className == 'cards' && $(selector.card).length > 1){
    //    console.log('refresh');
    //}

    // the all access Listen Now page is structured differently
    var is_all_access = $(selector.explore_menu).length == 1;

    if(this == refresh_observer){
        if(is_all_access == true && !(mutations[0].addedNodes.length == 4 &&
           mutations[0].addedNodes[0].className == 'situations-container' &&
           $(selector.listen_now).hasClass('selected'))){
            // bump out when the page refreshes, all access is enabled,
            // and any of the following aren't true:
            // - the four situation rows are what was refreshed
            // - the listen now page is the one being displayed
            // if all of those *are* true or if the initial loading screen observer
            // was the one calling this handler, proceed to filtering the cards
            return;
        }else if(is_all_access == false && !(mutations[0].addedNodes.length == 1 &&
                 mutations[0].addedNodes[0].className == 'cards' && $(selector.card).length > 1 &&
                 $(selector.listen_now).hasClass('selected'))){
            // bump out when the page refreshes, all access is not enabled,
            // and any of the following aren't true:
            // - exactly one new card was added
            // - there is more than one existing card
            // - the listen now page is the one being displayed
            // if all of those *are* true or if the initial loading screen observer
            // was the one calling this handler, proceed to filtering the cards
            return;
        }
    }

    // change all large cards to small
    $(selector.card).attr('data-size', 'small');

    // the suggestions and lucky cards are shaped completely differently in All Access
    // and won't fit into the standard grid
    if(is_all_access == true){
        var o = {show_im_feeling_lucky : false,
                 show_suggested_albums : false,
                 show_suggested_artists : false,
                 show_suggested_genres : false};
        storage.set(o);
    }

    // remove those items the user has unchecked
    storage.get(null, function(obj){
        $(selector.album).attr('keep', obj['show_albums'].toString());
        $(selector.playlist).attr('keep', obj['show_playlists'].toString());
        $(selector.instant_mix_user).attr('keep', obj['show_instant_mixes_user'].toString());
        $(selector.instant_mix_auto).attr('keep', obj['show_instant_mixes_auto'].toString());
        $(selector.im_feeling_lucky).attr('keep', obj['show_im_feeling_lucky'].toString());
        $(selector.suggested_album).attr('keep', obj['show_suggested_albums'].toString());
        $(selector.suggested_artist).attr('keep', obj['show_suggested_artists'].toString());
        $(selector.suggested_genre).attr('keep', obj['show_suggested_genres'].toString());
        $(selector.free_from_google).attr('keep', obj['show_free_from_google'].toString());
        $(selector.situations).attr('keep', obj['show_situations'].toString());
        // the explore card will always be false and always removed
        $(selector.explore).attr('keep', obj['show_explore'].toString());
        $(selector.keep_false).remove();

        // backup all the cards
        var cards = $(selector.card).toArray();
        // backup a small empty container and change dimensions to hold one album each
        var small_card_group = $(selector.small_card_group).clone();
        // the all access screen doesn't have any card groups so create one
        if(is_all_access){
            small_card_group = $('<div>', {'class': 'card-group', 'data-size' : 'small'});
        }
        $(small_card_group).empty().css('height', '255px');
        // backup clean copies of all existing containers (empty for all access)
        var card_groups = $(selector.card_group).empty().toArray();
        // flush everything that exists
        $(selector.content_pane).empty();

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
                $(imfl_group).css('height', '255px').append(imfl_card).append(card1).append(card2).appendTo(selector.content_pane);
            }else{
                $(card1).attr('data-size', 'large');
                $(imfl_group).append(imfl_card).append(card1).appendTo(selector.content_pane);
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
        if(obj['resize_cards'] == true || is_all_access == true){
            while(cards.length > 0){
                small_card_group.clone().append(cards.shift()).appendTo(selector.content_pane);
            }
        }else{
            while(card_groups.length > 0){
                // don't bother looping through all groups if no cards left
                if(cards.length == 0) break;
                var card_group = card_groups.shift();
                var card1 = cards.shift();
                if($(card_group).attr('data-size') == 'large'){
                    $(card1).attr('data-size', 'large');
                    $(card_group).append(card1).appendTo(selector.content_pane);
                }else{
                    var card2 = cards.shift();
                    $(card_group).append(card1).append(card2).appendTo(selector.content_pane);
                }
            }
        }
    });
};

// after the loading screen finishes, the structure is there for the other
// observers to attach to
var bind_observers = function(mutations){
    // outer container for the content pane, for monitoring if the settings
    // page is displayed
    var album_pane = $(selector.album_pane)[0];
    if(album_pane){
        settings_observer.observe(album_pane, {childList : true, subtree : true});
    }
    // inner container for the content pane, for monitoring if the album
    // cards are reinserted or otherwise refreshed
    var album_inner_pane = $(selector.album_inner_pane)[0];
    if(album_inner_pane){
        refresh_observer.observe(album_inner_pane, {childList : true});
    }
    //console.log('loading');
    filter_cards(mutations);
};

// if the settings page is opened, insert clean up settings
// between the two "General" and "Manage My Devices" sections
var show_settings = function(){
    //console.log('settings');
    if($(selector.footer).length == 1 && $(selector.clean_up_section).length == 0){
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
                               .add($('<label>', {'for': 'show_free_from_google', text: 'Free from Google'}))
                               .add($('<input>', {id: 'show_situations', type: 'checkbox', checked: obj['show_situations']}))
                               .add($('<label>', {'for': 'show_situations', text: 'Situations'})));
            // create [<span></span>, <div><input><label></label></div>]
            var third_row = $('<span>', {'class': 'settings-button-description', text: 'Check off to force all cards to the uniform small size'})
                              .add($('<div>').append($('<input>', {id: 'resize_cards', type: 'checkbox', checked: obj['resize_cards']})
                                .add($('<label>', {'for': 'resize_cards', text: 'Resize All Cards to be Small'}))));
            // create [<div><div></div></div>]
            var boxes = $('<div>', {'class': 'settings-section-content', id: 'clean-up'})
                          .append($('<div>', {'class': 'buttons-section'})
                            .append([first_row, second_row, third_row]));

            // find "General" div and insert after
            var first_settings_section = $($(selector.settings_view).children()[1]);
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
                    show_situations : false,
                    show_explore : false,
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

// observers to watch for the settings page and the periodic refreshes
var settings_observer = new WebKitMutationObserver(show_settings);
var refresh_observer = new WebKitMutationObserver(filter_cards);
// create an observer to do the initial pass
var loading_observer = new WebKitMutationObserver(bind_observers);

// use jquery's load bind method. others trigger too early, before the loading screen appears.
$(window).load(function(){
    // loading progress bar
    var loading_screen = $(selector.loading_screen)[0];
    if(loading_screen){
        loading_observer.observe(loading_screen, {attributes : true, attributeFilter : ['style']});
    }
});