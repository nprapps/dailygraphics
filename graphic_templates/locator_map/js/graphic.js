// Global config
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;
var GEO_DATA_URL = 'data/geodata.json';

// Global vars
var pymChild = null;
var isMobile = false;
var geoData = null;


// labels
var LABEL_DEFAULTS = [];
LABEL_DEFAULTS['text-anchor'] = 'start';
LABEL_DEFAULTS['dx'] = '6';
LABEL_DEFAULTS['dy'] = '4';

var CITY_LABEL_ADJUSTMENTS = [];
CITY_LABEL_ADJUSTMENTS['Biratnagar'] = { 'dy': -3 };
CITY_LABEL_ADJUSTMENTS['Birganj'] = { 'dy': -3 };
CITY_LABEL_ADJUSTMENTS['Kathmandu'] = { 'text-anchor': 'end', 'dx': -4, 'dy': -4 };
CITY_LABEL_ADJUSTMENTS['Nepalganj'] = { 'text-anchor': 'end', 'dx': -4, 'dy': 12 };
CITY_LABEL_ADJUSTMENTS['Pokhara'] = { 'text-anchor': 'end', 'dx': -6 };
CITY_LABEL_ADJUSTMENTS['Kanpur'] = { 'dy': 12 };

var COUNTRY_LABEL_ADJUSTMENTS = [];
COUNTRY_LABEL_ADJUSTMENTS['Nepal'] = { 'text-anchor': 'end', 'dx': -50, 'dy': -20 };
COUNTRY_LABEL_ADJUSTMENTS['Bangladesh'] = { 'text-anchor': 'end', 'dx': -10 };


/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        loadJSON('data/geodata.json')
    } else {
        pymChild = new pym.Child({});
    }
}

/*
 * Load graphic data from a CSV.
 */
var loadJSON = function(url) {
    d3.json(url, function(error, data) {
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
        containerWidth = GRAPHIC_DEFAULT_WIDTH;
    }

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Render the chart!
    renderLocatorMap({
        container: '#graphic',
        width: containerWidth,
        data: geoData,
        primaryCountry: 'Nepal'
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
    var aspectWidth = 2;
    var aspectHeight = 1.2;

    var defaultScale = 3000;
    var cityDotRadius = 3;

    // Calculate actual map dimensions
    var mapWidth = config.width;
    var mapHeight = Math.ceil((config.width * aspectHeight) / aspectWidth);

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config.container);
    containerElement.html('');

    var mapData = {};
    var mapProjection = null;
    var path = null;
    var chartWrapper = null;
    var chartElement = null;

    /*
     * Extract topo data.
     */
    var extractMapData = function() {
        for (var key in config.data['objects']) {
            mapData[key] = topojson.feature(config.data, config.data['objects'][key]);
        }
    }

    /*
     * Create the map projection.
     */
    var createProjection = function() {
        var bbox = config.data['bbox'];
        var centroid = [((bbox[0] + bbox[2]) / 2), ((bbox[1] + bbox[3]) / 2)];

        var mapScale = (mapWidth / GRAPHIC_DEFAULT_WIDTH) * defaultScale;
        var scaleFactor = mapWidth / GRAPHIC_DEFAULT_WIDTH;

        projection = d3.geo.mercator()
            .center(centroid)
            .scale(mapScale)
            .translate([ mapWidth/2, mapHeight/2 ]);

        path = d3.geo.path()
            .projection(projection)
            .pointRadius(cityDotRadius * scaleFactor);
    }

    /*
     * Create the root SVG element.
     */
    var createSVG = function() {
        chartWrapper = containerElement.append('div')
            .attr('class', 'graphic-wrapper');

        chartElement = chartWrapper.append('svg')
            .attr('width', mapWidth)
            .attr('height', mapHeight)
            .append('g')
    }

    /*
     * Create SVG filters.
     */
    var createFilters = function() {
        var defs = chartElement.append('defs');

        var textFilter = defs.append('filter')
            .attr('id', 'textshadow');

        textFilter.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('result', 'blurOut')
            .attr('stdDeviation', '.25');

        var landFilter = defs.append('filter')
            .attr('id', 'landshadow');

        landFilter.append('feGaussianBlur')
            .attr('in', 'SourceGraphic')
            .attr('result', 'blurOut')
            .attr('stdDeviation', '10');
    }

    /*
     * Render countries.
     */
    var renderCountries = function() {
        chartElement.append('path')
            .attr('class', 'landmass')
            .datum(mapData['countries'])
            .attr('filter', 'url(#landshadow)')
            .attr('d', path);

        chartElement.append('g')
            .attr('class', 'countries')
            .selectAll('path')
                .data(mapData['countries']['features'])
            .enter().append('path')
                .attr('class', function(d) {
                    return classify(d['id']);
                })
                .attr('d', path);

        d3.select('.countries path.' + classify(config.primaryCountry))
            .moveToFront()
            .attr('class', 'primary ' + classify(config.primaryCountry));
    }

    /*
     * Render rivers.
     */
    var renderRivers = function() {
        chartElement.append('g')
            .attr('class', 'rivers')
            .selectAll('path')
                .data(mapData['rivers']['features'])
            .enter().append('path')
                .attr('d', path);
    }

    /*
     * Render lakes.
     */
    var renderLakes = function() {
        chartElement.append('g')
            .attr('class', 'lakes')
            .selectAll('path')
                .data(mapData['lakes']['features'])
            .enter().append('path')
                .attr('d', path);
    }

    /*
     * Render primary cities.
     */
    var renderPrimaryCities = function() {
        chartElement.append('g')
            .attr('class', 'cities primary')
            .selectAll('path')
                .data(mapData['cities']['features'])
            .enter().append('path')
                .attr('d', path)
                .attr('class', function(d) {
                    var c = 'place';
                    c += ' ' + classify(d['properties']['city']);
                    c += ' ' + classify(d['properties']['featurecla']);
                    c += ' scalerank-' + d['properties']['scalerank'];
                    return c;
                });
    }

    /*
     * Render neighboring cities.
     */
    var renderNeighboringCities = function() {
        chartElement.append('g')
            .attr('class', 'cities neighbors')
            .selectAll('path')
                .data(mapData['neighbors']['features'])
            .enter().append('path')
                .attr('d', path)
                .attr('class', function(d) {
                    var c = 'place';
                    c += ' ' + classify(d['properties']['city']);
                    c += ' ' + classify(d['properties']['featurecla']);
                    c += ' scalerank-' + d['properties']['scalerank'];
                    return c;
                });
    }

    /*
     * Render country labels.
     */
    var renderCountryLabels = function() {
        chartElement.append('g')
            .attr('class', 'country-labels')
            .selectAll('.label')
                .data(mapData['countries']['features'])
            .enter().append('text')
                .attr('class', function(d) {
                    return 'label ' + classify(d['id']);
                })
                .attr('transform', function(d) {
                    return 'translate(' + path.centroid(d) + ')';
                })
                .attr('text-anchor', function(d) {
                    return positionLabel(COUNTRY_LABEL_ADJUSTMENTS, d['id'], 'text-anchor');
                })
                .attr('dx', function(d) {
                    return positionLabel(COUNTRY_LABEL_ADJUSTMENTS, d['id'], 'dx');
                })
                .attr('dy', function(d) {
                    return positionLabel(COUNTRY_LABEL_ADJUSTMENTS, d['id'], 'dy');
                })
                .text(function(d) {
                    return COUNTRIES[d['properties']['country']] || d['properties']['country'];
                });

        d3.select('.country-labels text.' + classify(config.primaryCountry))
            .attr('class', 'label primary ' + classify(config.primaryCountry));
    }

    /*
     * Render city labels.
     */
    var renderCityLabels = function() {
        var cityLabels = [ 'city-labels shadow',
                           'city-labels',
                           'city-labels shadow primary',
                           'city-labels primary' ];

        cityLabels.forEach(function(v, k) {
            var cityData;

            if (v == 'city-labels shadow' || v == 'city-labels') {
                cityData = mapData['neighbors']['features'];
            } else {
                cityData = mapData['cities']['features'];
            }

            chartElement.append('g')
                .attr('class', v)
                .selectAll('.label')
                    .data(mapData['cities'])
                .enter().append('text')
                    .attr('class', function(d) {
                        var c = 'label';
                        c += ' ' + classify(d['properties']['city']);
                        c += ' ' + classify(d['properties']['featurecla']);
                        c += ' scalerank-' + d['properties']['scalerank'];
                        return c;
                    })
                    .attr('transform', function(d) {
                        return 'translate(' + projection(d['geometry']['coordinates']) + ')';
                    })
                    .attr('style', function(d) {
                        return 'text-anchor: ' + positionLabel(CITY_LABEL_ADJUSTMENTS, d['properties']['city'], 'text-anchor');
                    })
                    .attr('dx', function(d) {
                        return positionLabel(CITY_LABEL_ADJUSTMENTS, d['properties']['city'], 'dx');
                    })
                    .attr('dy', function(d) {
                        return positionLabel(CITY_LABEL_ADJUSTMENTS, d['properties']['city'], 'dy');
                    })
                    .text(function(d) {
                        return CITIES[d['properties']['city']] || d['properties']['city'];
                    });
        });

        d3.selectAll('.shadow')
            .attr('filter', 'url(#textshadow)');
    }

    /*
     * Render a scale bar.
     */
    var renderScaleBar = function() {
        var bbox = config.data['bbox'];
        var scaleBarDistance = calculateOptimalScaleBarDistance(bbox, 10);
        var scaleBarStart = [10, mapHeight - 20];
        var scaleBarEnd = calculateScaleBarEndPoint(projection, scaleBarStart, scaleBarDistance);

        chartElement.append('g')
            .attr('class', 'scale-bar')
            .append('line')
            .attr('x1', scaleBarStart[0])
            .attr('y1', scaleBarStart[1])
            .attr('x2', scaleBarEnd[0])
            .attr('y2', scaleBarEnd[1]);

        d3.select('.scale-bar')
            .append('text')
            .attr('x', scaleBarEnd[0] + 5)
            .attr('y', scaleBarEnd[1] + 3)
            .text(scaleBarDistance + ' miles');
    }

    extractMapData();
    createProjection();
    createSVG();
    createFilters();
    renderCountries();
    renderRivers();
    renderLakes();
    renderPrimaryCities();
    renderNeighboringCities();
    renderCountryLabels();
    renderCityLabels();
    renderScaleBar();
}

var positionLabel = function(adjustments, id, attribute) {
    if (adjustments[id]) {
        if (adjustments[id][attribute]) {
            return adjustments[id][attribute];
        } else {
            return LABEL_DEFAULTS[attribute];
        }
    } else {
        return LABEL_DEFAULTS[attribute];
    }
}

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};

/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
