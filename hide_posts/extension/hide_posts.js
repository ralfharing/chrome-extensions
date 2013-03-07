/**
 * @author Ralf Haring 2013-02-14
 */

// I'd prefer to use sync instead of local but there
// is a max limit of 512 items
// http://code.google.com/p/chromium/issues/detail?id=176440
var storage = chrome.storage.local;

// Issue opened to more easily view all the items stored in chrome.storage
// regardless of sync or local, and regardless of context. Right now you
// must iterate over and over.
// chrome.storage.local.get(null,function(items){var count = 0;for(x in items){if(items.hasOwnProperty(x)){++count;}}console.log(count);console.log(items)})
// http://code.google.com/p/chromium/issues/detail?id=176225

// all the constants in one place
var str = {
    contentPane: '#contentPane',
    divUpdate: 'div[id|=update]',
    optionsMenu: 'span[title="Options menu"]',
    hideButton: '<span role="button" class="hide_button"></span>',
    divID: 'div[id=',
    spanHideButton: 'span.hide_button',
    id: 'id'
};

// number of days after which to purge the hide record from chrome.storage
var daysToRetain = 4;

// container for all the posts
var content_pane = $(str.contentPane)[0];

// create an observer to add hide buttons to new posts
var observer = new WebKitMutationObserver(function(mutations){
    // multiple mutationRecords can be observed at once
    mutations.forEach(function(mutation){
        //console.log(mutation);
        // filter to only process the ones where new nodes added
        if(mutation.addedNodes != null && mutation.addedNodes.length > 0){
            // filter out all new nodes that aren't new posts
            $(mutation.addedNodes).filter(str.divUpdate).each(function(){
                var id = $(this).attr(str.id);
                // if id is in chrome.storage, delete post div
                // else add hide button
                storage.get(id, function(obj){
                    if(obj.hasOwnProperty(id)){
                        $(str.divID + id + ']').remove();
                    }else{
                        $(str.divID + id + ']').find(str.optionsMenu).after(str.hideButton);
                    }
                });
            });
        }
    }); 
});

// watch for new posts to be added to the content pane
observer.observe(content_pane, {subtree: true, childList: true});

// wait until page is fully loaded to add the initial set of hide buttons
$(document).ready(function(){
    // loop through the existing stored values and delete any older than 1 week
    storage.get(null, function(contents){
        //console.log(contents);
        var week_ago = new Date();
        week_ago.setDate(week_ago.getDate() - daysToRetain);
        var old_ids = [];
        for(var x in contents){
            var old_date = new Date(contents[x]);
            if(old_date < week_ago){
                old_ids.push(x);
            }
        }
        storage.remove(old_ids);
    });

    // TODO: abstract this stuff along with the observer into a method
    // loop through all posts
    $(str.divUpdate).find(str.optionsMenu).each(function(){
        var id = $(this).parents(str.divUpdate).attr(str.id);
        // if id is in chrome.storage, delete post div
        // else add hide button
        storage.get(id, function(obj){
            if(obj.hasOwnProperty(id)){
                $(str.divID + id + ']').remove();
            }else{
                $(str.divID + id + ']').find(str.optionsMenu).after(str.hideButton);
            }
        });
    });

    // add a listener for the button which deletes the appropriate parent div
    $(str.contentPane).on('click', str.spanHideButton, function(event){
        var id = $(this).parents(str.divUpdate).attr(str.id);
        $(this).parents(str.divUpdate).remove();
        // add the id to chrome.storage along with timestamp
        var obj = {};
        obj[id] = new Date().toDateString();
        storage.set(obj);
    });
});