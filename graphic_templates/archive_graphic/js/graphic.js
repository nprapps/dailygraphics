// Global vars
var pymChild = null;
var isMobile = false;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    pymChild = new pym.Child({});

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
    });

    // Update iframe
    /*
    if (pymChild) {
        pymChild.sendHeight();
    }
    */
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
