// Global vars
var pymChild = null;
var isMobile = false;
var BREAKPOINTS = [ 375, 600, 1000 ];

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    pymChild = new pym.Child({
        renderCallback: render
    });

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
    });
}

/*
 * Render the graphic.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = DEFAULT_WIDTH;
    }

    var sprite = 'img/filmstrip-' + BREAKPOINTS[BREAKPOINTS.length - 1] + '.jpg';
    for (var i = 0; i < BREAKPOINTS.length; i++) {
        if (i == 0 && containerWidth <= BREAKPOINTS[i]) {
            sprite = 'img/filmstrip-' + BREAKPOINTS[i] + '.jpg';
        } else if (containerWidth > BREAKPOINTS[(i - 1)] && containerWidth <= BREAKPOINTS[i]) {
            sprite = 'img/filmstrip-' + BREAKPOINTS[i] + '.jpg';
        }
    }

    d3.selectAll('.photo').html('');

    var canvidControl = canvid({
        selector : '.photo',
        videos: {
            // frames = # of stills
            // cols = # of stills in a row in the filmstrip. in this case,
            //        same as frames.
            // fps = frames per second (animation speed). integers only
            photo: { src: sprite, frames: 8, cols: 8, fps: 2 }
        },
        width: containerWidth,
            // multiply by height, width of original image
            height: Math.floor(containerWidth * 1614/1500),
        loaded: function() {
            canvidControl.play('photo');

            // Update iframe
            if (pymChild) {
                pymChild.sendHeight();
            }

        }
    });
}


/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
