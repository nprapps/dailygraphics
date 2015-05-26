// Global config
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;

// Global vars
var pymChild = null;
var isMobile = false;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({});
    }
}

/*
 * Render the graphic.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = GRAPHIC_DEFAULT_WIDTH;
    }

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Draw something here

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
