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

        pymChild.onMessage('on-screen', function(bucket) {
            ANALYTICS.trackEvent('on-screen', bucket);
        });
        pymChild.onMessage('scroll-depth', function(data) {
            data = JSON.parse(data);
            ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
        });
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

        pymChild.onMessage('on-screen', function(bucket) {
            ANALYTICS.trackEvent('on-screen', bucket);
        });
        pymChild.onMessage('scroll-depth', function(data) {
            data = JSON.parse(data);
            ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
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
        .attr('class', 'countries background')
        .selectAll('path')
            .data(topoData['countries']['features'])
            .enter()
                .append('path')
                .attr('d', path)
                .attr('class', function(d) {
                    var id = d['id'];
                    return 'country-' + d['id'];
                });

    /*
     * Display data on the map
     */
    if (DATA_DISPLAY == 'choropleth') {
        if (DATA_POSITIONING == 'country') {
            // Define color bins
            // You'll probabaly want to change the bins, but here's a starting point.
            var maxValue = d3.max(config['data'], function(d) {
                return d[dataColumn];
            });
            // var colorBins = [ 1, 500, 5000, 10000, 50000 ];
            var colorBins = [ 1,
                              Math.floor(maxValue/3),
                              Math.floor(maxValue/3) * 2,
                              maxValue + 1 ];
            var colorRange = [ '#DDD', COLORS['teal5'], COLORS['teal3'], COLORS['teal1'] ];
            var colorNoData = '#EEE';
            var colorBinsCount = colorBins.length;
            var colorScale = d3.scale.threshold()
                .domain(colorBins)
                .range(colorRange);

            // Render legend
            var legend = containerElement.insert('ul', ':first-child')
                .attr('class', 'key');

            var legendBins = legend.selectAll('li')
                .data(colorBins)
                .enter().append('li')
                    .attr('class', function(d, i) {
                        return 'key-item key-' + i;
                    });
            legendBins.append('b')
                .style('background-color', function(d,i) {
                    return colorRange[i];
                });
            legendBins.append('label')
                .html(function(d, i) {
                    if (i == 0) {
                        return 'None';
                    } else if (i == (colorBinsCount - 1)) {
                        return '&ge;&nbsp;' + fmtComma(colorBins[i-1]);
                    } else {
                        return fmtComma(colorBins[i-1]) + '-' + fmtComma((colorBins[i] - 1));
                    }
                    return d['key'];
                });

            var legendNoData = legend.append('li')
                .attr('class', 'key-item key-' + colorBinsCount);
            legendNoData.append('b')
                .style('background-color', colorNoData);
            legendNoData.append('label')
                .text('Data not available');

            // Fill in the countries
            var countryWrapper = chartElement.select('.countries')
                .classed('background', false);

            var countries = countryWrapper.selectAll('path')
                .attr('fill', function(d) {
                    var id = d['id'];
                    // Does this country exist in the spreadsheet?
                    if (typeof config['dataIndexed'][id] == 'undefined') {
                        console.log('no data for: ' + id);
                        return colorNoData;
                    // Is it null in the spreadsheet?
                    } else if (config['dataIndexed'][id][dataColumn] == null) {
                        console.log('no data for: ' + config['dataIndexed'][id]['name']);
                        return colorNoData;
                    // Or does it have actual data?
                    } else {
                        return colorScale(config['dataIndexed'][id][dataColumn]);
                    }
                });
        } else {
            console.warn('WARNING: If you want to display data on the map as a choropleth (rather than as a bubble map), data_display must be set to \'country\' in the content spreadsheet. Choropleth display will not work with \'latlon\' data.');
        }
    }
    if (DATA_DISPLAY == 'bubble') {
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
            .data(config['data'].filter(function(d, i) {
                return d[dataColumn] != null;
            }).sort(function(a, b) {
                return d3.descending(a[dataColumn], b[dataColumn]);
            }))
            .enter()
                .append('circle')
                    .attr('transform', function(d,i) {
                        var id = d['id'];
                        var centroid = [ 0, 0 ];

                        // check for an override
                        if (d['lat'] != null && d['lon'] != null) {
                            centroid = [ d['lon'], d['lat'] ];
                        // or, if this is a country map, use country centroid
                        } else if (DATA_POSITIONING == 'country') {
                            var country = d3.select('.country-' + id);
                            // find the country centroid
                            if (country[0][0] != null) {
                                centroid = d3.geo.centroid(country[0][0]['__data__']);
                            // or maybe the point doesn't exist
                            } else {
                                console.log('no centroid for: ' + d['name']);
                            }
                        // or maybe the point doesn't exist
                        } else {
                            console.log('no lat/lon info for: ' + d['name']);
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
            .attr('class', 'key-scale');

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
