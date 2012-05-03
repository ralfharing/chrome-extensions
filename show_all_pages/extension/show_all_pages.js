/**
 * @author Ralf Haring 2012-04-19
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
        // .kMQ7Yd.k-Qf-C-RySO6d = the <a> hover elements (among others)
        // a[href^="/u/0/b"] = only those that link to brand pages
        // contents() = <img> and text nodes for each
        // .filter(nodeType = 3) = only the text nodes
        var existingHoverEntries = $('.kMQ7Yd.k-Qf-C-RySO6d').filter('a[href^="/u/0/b"]').contents().filter(function(){return(this.nodeType == 3);});
        // convert text nodes to strings
        $.each(existingHoverEntries, function(index, val){existingHoverEntries[index] = val.nodeValue;})

        // .fhZcod.c-wa-Da.FzEPlf = a page entry on the management page
        $('.fhZcod.c-wa-Da.FzEPlf', data).each(function(){
            // .i9sidf = div with the name
            var name = $(this).find('.i9sidf').text();
            // if the name is already on the hovercard, do nothing
            if($.inArray(name, existingHoverEntries) != -1) return;

            // .kM5Oeb-wsYqfb.ft16Ge = img tag with big picture
            // src = only the src property
            // replace(.s102) = get small thumbnails
            // replace(https) = chop the protocol
            var thumbnail = $(this).find('.kM5Oeb-wsYqfb.ft16Ge').prop('src').replace('s102-c-k', 's32-c-k').replace('https:', '');
            // .t7SApd = a tag with the page link
            // href = only the href property
            // replace() = chop the protocal and domain
            var link = $(this).find('.t7SApd').prop('href').replace('https://plus.google.com', '');

            // .kMQ7Yd.eNVk8e.k-Qf-C-RySO6d = the last hovercard entry (eNVk8e is the real determinant)
            // a[href^="/u/0/b"] = only those that link to brand pages
            var lastHoverEntry = $('.kMQ7Yd.eNVk8e.k-Qf-C-RySO6d').filter('a[href^="/u/0/b"]');

            // make copy to hold new info and populate it
            var newHoverEntry = lastHoverEntry.clone();
            newHoverEntry.contents().last().replaceWith(name)
            newHoverEntry.prop('href', link);
            newHoverEntry.find('.uVaJZ.vgmsXe').prop('src', thumbnail);

            // insert it before the current last hover entry
            newHoverEntry.insertAfter(lastHoverEntry);
            // delete the previous "last entry" class signifier since
            // the new one is now the last entry
            lastHoverEntry.removeClass('eNVk8e');
        });
    }, 'html');
});