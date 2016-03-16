/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    // Uncomment to enable column sorting
    // var tablesort = new Tablesort(document.getElementById('state-table'));

    pymChild = new pym.Child({});

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(percent) {
        ANALYTICS.trackEvent('scroll-depth', percent);
    });
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
