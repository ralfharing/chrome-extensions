/**
 * @author Ralf Haring 2012-05-07
 */

var doWork = function(){
    // if componentid="18" (saved search box) doesn't already exist
    if(!document.querySelector('div[componentid="18"]')){
        // insert dummy empty div to ward off later calls that might
        // come in before we've finished setting up the real
        // saved search div
        $('<div componentid="18"></div>').insertBefore('div[componentid=13]');
        // make a call to the explore page that lists the saved searches
        $.get('https://plus.google.com/u/0/explore', function(data){
            // copy the searches div onto the main page before the trending topics
            $('div[componentid=18]', data).replaceAll('div[componentid=18]');
            // the search elements are "buttons" of some sort instead of links
            // so need some post-processing
            $('div[componentid=18] span[role="button"]').each(function(){
                // copy the first trending topic and modify the elements
                var linkTemplate = $('div[componentid=13] li[rowindex=0] a').clone();
                var searchTerm = $(this).text();
                linkTemplate.contents().replaceWith(searchTerm);
                linkTemplate.prop('href', 's/' + searchTerm.replace('#', '%23') + '/posts');
                $(this).replaceWith(linkTemplate);
            });
        }, 'html');
    }
};

// wait until page is fully loaded
$(document).ready(function(){
    doWork();
});

// navid="1" is the home button on the left sidebar
var homeButton = document.querySelector('div[navid="1"]').firstChild.firstChild.firstChild;

// create an observer who will watch for modifications of the home button
// Pm in the class list = the button is the active button
// Aj in the class list = the button is being hovered over
var observer = new WebKitMutationObserver(function(mutations){
    var classes = mutations[0].target.className;
//    if(classes.indexOf('Pm') != -1){
//        console.log('classes ' + classes + '     oldClasses ' + oldClasses);
//        if(oldClasses.indexOf('Aj') == -1){
            // wait a second for the rest of page to be
            // constructed before trying to insert saved searches
            setTimeout(doWork, 1000);
//            setTimeout(doWork, Math.floor(Math.random() * 10000));
//            doWork();
//        }
//   }
});

// watch for attribute level changes
observer.observe(homeButton, {attributes: true});