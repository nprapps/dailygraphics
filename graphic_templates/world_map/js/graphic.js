// Global config
var GEO_DATA_URL = 'data/world-110m.json';

// Global vars
var pymChild = null;
var isMobile = false;
var geoData = null;
var dataIndexed = [];

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        formatData();
        loadGeoData();
    } else {
        pymChild = new pym.Child({});
    }
}

/*
 * Format data for D3.
 */
var formatData = function() {
    DATA.forEach(function(d) {
        var id = d['id'];
        if (d['amt'] != null) {
            d['amt'] = +d['amt'];
        }
        if (d['lat'] != null) {
            d['lat'] = +d['lat'];
        }
        if (d['lon'] != null) {
            d['lon'] = +d['lon'];
        }
        dataIndexed[id] = d;
    });
}

/*
 * Load graphic data from a CSV.
 */
var loadGeoData = function() {
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
        geoData: geoData,
        data: DATA,
        dataIndexed: dataIndexed
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
    var dataColumn = 'amt';

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
    var topoData = {};

    for (var key in config['geoData']['objects']) {
        topoData[key] = topojson.feature(config['geoData'], config['geoData']['objects'][key]);
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
            .data(topoData['countries']['features'])
            .enter()
                .append('path')
                .attr('d', path)
                .attr('class', function(d) {
                    var id = d['id'];
                    if (typeof config['dataIndexed'][id] != 'undefined') {
                        console.log(d['id'], config['dataIndexed'][id]['name'], config['dataIndexed'][id][dataColumn]);
                    } else {
                        console.log(d['id'], typeof(config['dataIndexed'][id]));
                    }
                    return 'country-' + d['id'];
                });

    if (DATA_DISPLAY == 'bubble' && DATA_POSITIONING == 'country') {
        // define scale
        var radiusMax = 25 * scaleFactor;
        var rounding = 100;
        var scaleMax = d3.max(config['data'], function(d) {
            return Math.ceil(d[dataColumn] / rounding) * rounding;
        });
        var scaleMin = Math.floor(scaleMax / 3);

        var radius = d3.scale.sqrt()
            .domain([0, scaleMax])
            .range([0, radiusMax]);

        var scaleKey = [ scaleMin, scaleMax ];

        // draw bubbles
        var bubbles = chartElement.append('g')
            .attr('class', 'bubbles');

        bubbles.selectAll('circle')
            // TODO: SORT ASCENDING
            .data(config['data'].filter(function(d, i) {
                var country = d3.select('.country-' + d['id']);
//                return d[dataColumn] != null && country[0][0] != null;
                return d[dataColumn] != null;
            }).sort(function(a, b) {
                return d3.descending(a[dataColumn], b[dataColumn]);
            }))
            .enter()
                .append('circle')
                    .attr('transform', function(d,i) {
                        var id = d['id'];
                        var country = d3.select('.country-' + id);
                        var centroid = [ 0, 0 ];

                        // check for an override
                        if (d['lat'] != null && d['lon'] != null) {
                            centroid = [ d['lon'], d['lat'] ];
                        // otherwise use country centroid
                        } else if (country[0][0] != null) {
                            centroid = d3.geo.centroid(country[0][0]['__data__']);
                        // or maybe the centroid doesn't exist
                        } else {
                            console.log('no centroid for: ' + d['name']);
                        }

                        return 'translate(' + projection(centroid) + ')'; }
                    )
                    .attr('r', function(d, i) {
                        if (d[dataColumn] != null) {
                            return radius(d[dataColumn]);
                        } else {
                            return radius(0);
                        }
                    })
                    .attr('class', function(d, i) {
                        return classify(d['name']);
                    });

        // add scale
        var scaleDots = chartElement.append('g')
            .attr('class', 'key');

        scaleKey.forEach(function(d, i) {
            scaleDots.append('circle')
                .attr('r', radius(d))
                .attr('cx', radius(scaleKey[1]) + 1)
                .attr('cy', mapHeight - radius(d) - 1);

            scaleDots.append('text')
                .attr('x', radius(scaleKey[1]))
                .attr('y', mapHeight - (radius(d) * 2))
                .attr('dy', function() {
                    if (isMobile) {
                        return 9;
                    } else {
                        return 12;
                    }
                })
                .text(function() {
                    var amt = d;
                    return fmtComma(amt.toFixed(0));
                });
        })
    }
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
