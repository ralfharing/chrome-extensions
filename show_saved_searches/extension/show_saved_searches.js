/**
 * @author Ralf Haring 2012-05-07
 */

// wait until page is fully loaded
$(document).ready(function(){
    // make a call to the explore page that lists the saved searches
    $.get('https://plus.google.com/u/0/explore', function(data){
        // copy the searches div onto the main page before the trending topics
        $('div[componentid=18]', data).insertBefore('div[componentid=13]');
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
});