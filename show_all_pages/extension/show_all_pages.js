/**
 * @author Ralf Haring 2012-05-10
 */

// tons of comments to find my way if/when the G+ class names change

// wait until page is fully loaded
$(document).ready(function(){
    // make a call to the page that lists all the pages
    $.get('https://plus.google.com/u/0/pages/manage', function(data){
        // Get the three existing entries on the hovercard.
        // On profile these will be the first three, but if you
        // are a page it will be the page plus the first two.
        //
        // .JUa = the <a> hover elements (among others)
        // a[href^="/u/0/b"] = only those that link to brand pages
        // contents() = <img> and text nodes for each
        // .filter(nodeType = 3) = only the text nodes
        var existingHoverEntries = $('.JUa').filter('a[href^="/b"]').contents().filter(function(){return(this.nodeType == 3);});

        // convert text nodes to strings
        $.each(existingHoverEntries, function(index, val){existingHoverEntries[index] = val.nodeValue;})

        // .JBb.a-f-e.lrb = a page entry on the management page
        $('.JBb.a-f-e.lrb', data).each(function(){
            // .qda = div with the name
            var name = $(this).find('.qda').text();
            // if the name is already on the hovercard, do nothing
            if($.inArray(name, existingHoverEntries) != -1) return;

            // .l-mj.Qf = img tag with big picture
            // src = only the src property
            // replace(.s102) = get small thumbnails
            // replace(https) = chop the protocol
            var thumbnail = $(this).find('.l-mj.Qf').prop('src').replace('s102-c-k', 's32-c-k').replace('https:', '');
            // .HBb = a tag with the page link
            // href = only the href property
            // replace() = chop the protocal and domain
            var link = $(this).find('.HBb').prop('href').replace('https://plus.google.com', '');

            // .JUa = the hovercard entries
            // a[href^="/u/0/b"] = only those that link to brand pages
            // .last() = no way to determine which is which from class data
            var lastHoverEntry = $('.JUa').filter('a[href^="/b"]').last();

            // make copy to hold new info and populate it
            var newHoverEntry = lastHoverEntry.clone();
            newHoverEntry.contents().last().replaceWith(name)
            newHoverEntry.prop('href', link);
            newHoverEntry.find('.Zb.Z7a').prop('src', thumbnail);

            // insert it before the current last hover entry
            newHoverEntry.insertAfter(lastHoverEntry);
        });
    }, 'html');
});