/*
 * TODO:
 * re-implement auto-toggle
 */

// Global vars
var pymChild = null;
var isMobile = false;
var timeouts = [];

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

    initUI();

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

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

var autoToggle = function() {
    var toggleWrap = d3.select('#image-toggle');

    var stepList = [1, 2, 1, 2];
    toggleStep(0);

    function toggleStep(step_i) {
        if (step_i < stepList.length) {
            var step = stepList[step_i];

            // Don't auto-toggle if someone has clicked
            if (!toggleWrap.classed('clicked')) {
                if (step == 1) {
                    d3.select('.image-1').classed('hidden', false);
                } else {
                    d3.select('.image-1').classed('hidden', true);
                }

                d3.select('.toggle-btn.active').classed('active', false);
                d3.select('#toggle-' + step).classed('active', true);

                toggleTimeout = window.setTimeout(toggleStep, 2000, step_i+1);
            }
        }
    }
};

var initUI = function() {
    // autoToggle();

    d3.selectAll('.comparison').selectAll('.toggle-btn').on('click', function() {
        d3.event.preventDefault();

        var thisTab = d3.select(this); // .toggle-btn
        var parentToggle = d3.select(this.parentNode); // .image-toggle
        var parentWrapper = d3.select(this.parentNode.parentNode); // .comparison

        parentToggle.classed('clicked', true);
        // window.clearTimeout(toggleTimeout);

        if (thisTab.classed('toggle-1')) {
            parentWrapper.select('.image-1').classed('hidden', false);
        } else {
            parentWrapper.select('.image-1').classed('hidden', true);
        }

        if (!thisTab.classed('active')) {
            parentWrapper.select('.toggle-btn.active').classed('active', false);
            thisTab.classed('active', true);
        }
    });
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
