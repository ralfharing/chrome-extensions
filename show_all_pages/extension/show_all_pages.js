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
        // .aJa = the <a> hover elements (among others)
        // a[href*="/b/"] = only those that contain link to brand pages
        // contents() = <img> and text nodes for each
        // .filter(nodeType = 3) = only the text nodes
        var existingHoverEntries = $('.aJa').filter('a[href*="/b/"]').contents().filter(function(){return(this.nodeType == 3);});

        // convert text nodes to strings
        $.each(existingHoverEntries, function(index, val){existingHoverEntries[index] = val.nodeValue;})

        // .OYb.a-f-e.YOb = a page entry on the management page
        $('.OYb.a-f-e.YOb', data).each(function(){
            // .Ira = div with the name
            var name = $(this).find('.Ira').text();
            // if the name is already on the hovercard, do nothing
            if($.inArray(name, existingHoverEntries) != -1) return;

            // .l-tk.Rf = img tag with big picture
            // src = only the src property
            // replace(.s102) = get small thumbnails
            // replace(https) = chop the protocol
            var thumbnail = $(this).find('.l-tk.Rf').prop('src').replace('s102-c-k', 's32-c-k').replace('https:', '');
            // .MYb = a tag with the page link
            // href = only the href property
            // replace() = chop the protocal and domain
            var link = $(this).find('.MYb').prop('href').replace('https://plus.google.com', '');

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
    }, 'html');
});