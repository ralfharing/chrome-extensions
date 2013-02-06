/**
 * @author Ralf Haring 2013-02-06
 */

// container for all albums, instant mixes, and playlists
var album_pane = $('#start-page-new-section')[0];

// create an observer to delete the instant mixes
var observer = new WebKitMutationObserver(function(){
    $('div[data-type="im"]').parent().remove();
});

// watch for new children to be added
observer.observe(album_pane, {childList: true});