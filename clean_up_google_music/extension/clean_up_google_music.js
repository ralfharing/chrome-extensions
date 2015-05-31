/**
 * @author Ralf Haring 2015-05-31
 */

// all the selectors in one place
var selector = {
    loading_screen : '#loading-progress',
    album_inner_pane : '.g-content',
    situations : '.situations-container',
    containers : '.cluster-text-protection',
    last_child : ':last-child',
    lane_content : '.lane-content'
};

// quick and simple rules to modify the layout
var modify_layout = function(){
    if($(selector.containers).length > 1){
        $(selector.situations).remove();
        $(selector.containers + selector.last_child).remove();
        $(selector.lane_content).css('white-space', 'normal');
    }
};

// after the loading screen finishes, the structure is there for the other
// observers to attach to
var bind_observers = function(mutations){
    // inner container for the content pane, for monitoring if the album
    // cards are reinserted or otherwise refreshed
    var album_inner_pane = $(selector.album_inner_pane)[0];
    if(album_inner_pane){
        refresh_observer.observe(album_inner_pane, {childList : true});
    }
    modify_layout();
};

// observer to watch for periodic refreshes
var refresh_observer = new WebKitMutationObserver(modify_layout);
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