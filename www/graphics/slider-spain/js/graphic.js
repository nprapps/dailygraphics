var $ba;
var $ba_img_before;

var orig_width = [ 800, 1533, 900, 900 ];
var orig_height = [ 488, 846, 533, 417 ];


function render(width) {
    var new_width = width;
    
    // reset old slider
    $('.ui-draggable').remove();
    $('.balinks').remove();
    $('div[style]').removeAttr('style');
    $('img[style]').removeAttr('style');
    $('img').each( function(i) {
        if ($(this).attr('src') == './js/lib/lt-small.png' ||
            $(this).attr('src') == './js/lib/rt-small.png') {
            $(this).remove();
        }
    });
    
    // create new slider
    $.each($ba_img_before, function(k,v) {
        var ratio = new_width / orig_width[k];
        var new_height = orig_height[k] * ratio;

        $(v).width(new_width);
        $(v).height(new_height);
    });

    $('#before-after-2').beforeAfter( { beforeLinkText: '2002', afterLinkText: '2012' } );
    $('#before-after-3').beforeAfter( { beforeLinkText: '2009', afterLinkText: '2012' } );
    $('#before-after-4').beforeAfter( { beforeLinkText: '2000', afterLinkText: '2009' } );
    $('#before-after-5').beforeAfter( { beforeLinkText: '2003', afterLinkText: '2012' } );

    // update responsive iframe
    sendHeightToParent();
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    $ba = $('#before-after');
    $ba_img_before = $ba.find('.before img');

    setupResponsiveChild({
        renderCallback: render
    });
})
