// Global config
var GEO_DATA_URL = 'data/world-110m.json';

// Global vars
var pymChild = null;
var isMobile = false;
var geoData = null;

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        loadJSON()
    } else {
        pymChild = new pym.Child({});
    }
}

/*
 * Load graphic data from a CSV.
 */
var loadJSON = function() {
    d3.json(GEO_DATA_URL, function(error, data) {
        geoData = data;

        pymChild = new pym.Child({
            renderCallback: render
        });
    });
}

/*
 * Render the graphic(s). Called by pym with the container width.
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

    // Render the chart!
    renderLocatorMap({
        container: '#world-map',
        width: containerWidth,
        geoData: geoData
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

var renderLocatorMap = function(config) {
    /*
     * Setup
     */
    var aspectWidth = 1.92;
    var aspectHeight = 1;
    var defaultScale = 95;

    var mapProjection = null;
    var path = null;
    var chartWrapper = null;
    var chartElement = null;

    // Calculate actual map dimensions
    var mapWidth = config['width'];
    var mapHeight = Math.ceil((config['width'] * aspectHeight) / aspectWidth);

    /*
     * Extract topo data.
     */
    var mapData = {};

    for (var key in config['geoData']['objects']) {
        mapData[key] = topojson.feature(config['geoData'], config['geoData']['objects'][key]);
    }

    /*
     * Create the map projection.
     */
    var mapScale = (mapWidth / DEFAULT_WIDTH) * defaultScale;
    var scaleFactor = mapWidth / DEFAULT_WIDTH;

    var projection = d3.geo.miller()
        .scale(mapScale)
        .translate([ mapWidth / 2 * 0.97, mapHeight / 2 * 1.27 ]);

    path = d3.geo.path()
        .projection(projection);

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create the root SVG element.
     */
    chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = containerElement.append('svg')
        .attr('width', mapWidth)
        .attr('height', mapHeight)
        .append('g')
        .attr('transform', 'translate(0,0)');

    /*
     * Render countries.
     */
    // Land outlines
    chartElement.append('g')
        .attr('class', 'countries')
        .selectAll('path')
            .data(mapData['countries']['features'])
            .enter()
                .append('path')
                .attr('d', path)
                .attr('class', function(d) {
                    return 'country-' + d['id'];
                });
}

/*
 * Move a set of D3 elements to the front of the canvas.
 */
d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
