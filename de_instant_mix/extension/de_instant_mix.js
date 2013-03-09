/**
 * @author Ralf Haring 2013-02-06
 */

// container for all albums, instant mixes, and playlists
var album_pane = $('#start-page-new-section')[0];

// does the work
var remove_mixes = function(){
    $('div[data-type="im"]').parent().remove();
}

// create an observer to delete the instant mixes
var observer = new WebKitMutationObserver(remove_mixes);
// watch for new children to be added
observer.observe(album_pane, {childList: true});

// call once while page content still loading offscreen
remove_mixes();