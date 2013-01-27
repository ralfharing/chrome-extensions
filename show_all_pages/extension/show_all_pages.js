/**
 * @author Ralf Haring 2012-05-10
 */

// tons of comments to find my way if/when the G+ class names change

var doWork = function(){
    // Get the three existing entries on the hovercard.
    // On profile these will be the first three, but if you
    // are a page it will be the page plus the first two.
    //
    // .aJa = the <a> hover elements (among others)
    // a[href*="/b/"] = only those that contain link to brand pages
    // contents() = <img> and text nodes for each
    // .filter(nodeType = 3) = only the text nodes
    var existingHoverEntries = $('.aJa').filter('a[href*="/b/"]').contents().filter(function(){return(this.nodeType == 3);});

    // convert text nodes to strings
    $.each(existingHoverEntries, function(index, val){existingHoverEntries[index] = val.nodeValue;})

    // #gbmpas = the account dropdown in the toolbar
    // .gbmtc:gt(0) = each page entry minus the first which is the user
    $('#gbmpas > .gbmtc:gt(0)').each(function(){
        // .gbps = div with the name
        var name = $(this).find('.gbps').text();
        // if the name is already on the hovercard, do nothing
        if($.inArray(name, existingHoverEntries) != -1) return;

        // .gbmpia = img tag with picture
        // src = only the src property
        // replace(.s32) = insert url path to get small thumbnails
        var thumbnail = $(this).find('.gbmpia').prop('src').replace('photo.jpg', 's32-c-k/photo.jpg');
        // .gbmt = a tag with the page link
        // href = only the href property
        var link = $(this).find('.gbmt').prop('href');

        // .aJa = the hovercard entries
        // a[href*="/b/"] = only those that contain link to brand pages
        // .last() = no way to determine which is which from class data
        var lastHoverEntry = $('.aJa').filter('a[href*="/b/"]').last();

        // make copy to hold new info and populate it
        // .Zb.AWa = img tag with the hover entry thumbnail
        var newHoverEntry = lastHoverEntry.clone();
        newHoverEntry.contents().last().replaceWith(name)
        newHoverEntry.prop('href', link);
        newHoverEntry.find('.Zb.AWa').prop('src', thumbnail);

        // insert it before the current last hover entry
        newHoverEntry.insertAfter(lastHoverEntry);
    });
};

// navid="7" is the pages button on the left sidebar
var pagesButton = document.querySelector('div[navid="7"]').firstChild.firstChild.firstChild;

// create an observer who will watch for modifications of the pages button
// Pm in the class list = the button is the active button
// Aj in the class list = the button is being hovered over
var observer = new WebKitMutationObserver(function(mutations){
    var classes = mutations[0].target.className;
    if(classes.indexOf('Aj') != -1){
        // if hover entry popup box has exactly the normal limit
        // less and it's fine, more and we've already done this
        if($('.aJa').filter('a[href*="/b/"]').contents().filter(function(){return(this.nodeType == 3);}).length == 3){
            doWork();
        }
    }
});

// watch for attribute level changes
observer.observe(pagesButton, {attributes: true});