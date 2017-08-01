// Global vars
var pymChild = null;
var isMobile = false;
var BREAKPOINTS = [ 375, 600, 1000 ];

// Canvid params are defined in the spreadsheet
var IMAGE_FOLDER = PARAMS['image_folder'];
var IMAGE_WIDTH = +PARAMS['image_width'];
var IMAGE_HEIGHT = +PARAMS['image_height'];
var FRAMES = +PARAMS['frames'];
var COLS = +PARAMS['cols'];
var FRAMES_PER_SECOND = +PARAMS['frames_per_second'];

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

    var sprite = IMAGE_FOLDER + '/filmstrip-' + BREAKPOINTS[BREAKPOINTS.length - 1] + '.jpg';
    for (var i = 0; i < BREAKPOINTS.length; i++) {
        if (i == 0 && containerWidth <= BREAKPOINTS[i]) {
            sprite = IMAGE_FOLDER + '/filmstrip-' + BREAKPOINTS[i] + '.jpg';
        } else if (containerWidth > BREAKPOINTS[(i - 1)] && containerWidth <= BREAKPOINTS[i]) {
            sprite = IMAGE_FOLDER + '/filmstrip-' + BREAKPOINTS[i] + '.jpg';
        }
    }

    // clear out previous canvid if it exists
    var photoContainers = document.getElementById('graphic');
    while (photoContainers.hasChildNodes()) {
        photoContainers.removeChild(photoContainers.firstChild);
    }

    var canvidControl = canvid({
        selector : '.photo',
        videos: {
            // frames = # of stills
            // cols = # of stills in a row in the filmstrip. in this case,
            //        same as frames.
            // fps = frames per second (animation speed). integers only
            photo: { src: sprite, frames: FRAMES, cols: COLS, fps: FRAMES_PER_SECOND }
        },
        width: containerWidth,
            // multiply by height, width of original image
            height: Math.floor(containerWidth * IMAGE_HEIGHT / IMAGE_WIDTH),
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
