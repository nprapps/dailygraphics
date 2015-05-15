// global vars
var $graphic = null;
var pymChild = null;

var MAP_DEFAULT_WIDTH = 624;
var MAP_DEFAULT_HEIGHT = 350;
var MAP_DEFAULT_SCALE = 3000;
var CITY_DOT_RADIUS = 3;
var QUAKE_DOT_RADIUS = 15;
var MOBILE_THRESHOLD = 500;

// geo data
var GEO_DATA_URL = 'data/geodata.json';
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
 * INITIALIZE
 */
var onWindowLoaded = function() {
    d3.json(GEO_DATA_URL, onDataLoaded);
    $graphic = $('#graphic');
}


/*
 * LOAD THE DATA
 */
var onDataLoaded = function(error, data) {
    geoData = data;

    pymChild = new pym.Child({
        renderCallback: drawMap
    });
}


/*
 * DRAW THE MAP
 */
function drawMap(containerWidth) {
    // fallback if page is loaded outside of an iframe
    if (!containerWidth) {
        containerWidth = MAP_DEFAULT_WIDTH;
    }

    // check the container width; set mobile flag if applicable
    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }
    
    // dimensions
    var mapWidth = containerWidth;
    var mapHeight = mapWidth * MAP_DEFAULT_HEIGHT / MAP_DEFAULT_WIDTH;
    var mapScale = (mapWidth / MAP_DEFAULT_WIDTH) * MAP_DEFAULT_SCALE;
    var scaleFactor = mapWidth / MAP_DEFAULT_WIDTH;

    // data vars
    var bbox = geoData['bbox'];
    var mapCentroid = [ ((bbox[0] + bbox[2])/2), ((bbox[1] + bbox[3])/2) ];
    
    var geoCountries = topojson.feature(geoData, geoData['objects']['countries']);
    geoCountries['features'][0]['properties']['country'] = 'Bangla.';
    var geoRivers = topojson.feature(geoData, geoData['objects']['rivers']);
    var geoLakes = topojson.feature(geoData, geoData['objects']['lakes']);
    var geoCities = topojson.feature(geoData, geoData['objects']['cities']);
    var geoNeighbors = topojson.feature(geoData, geoData['objects']['neighbors']);

    // delete existing map
    $graphic.empty();

    // draw the map
    var svg = d3.select('#graphic').append('svg')
        .attr('width', mapWidth)
        .attr('height', mapHeight);

    defs = svg.append('defs');
    filter = defs.append('filter')
        .attr('id', 'dropshadow');
    filter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('result', 'blurOut')
        .attr('stdDeviation', '.25');

    var projection = d3.geo.mercator()
        .center(mapCentroid)
        .scale(mapScale)
        .translate([ mapWidth/2, mapHeight/2 ]);

    var path = d3.geo.path()
        .projection(projection)
        .pointRadius(CITY_DOT_RADIUS * scaleFactor);

    var radius = d3.scale.sqrt()
        .domain([0, 10])
        .range([0, (QUAKE_DOT_RADIUS * scaleFactor)]); // scale max dot size to the map dimensions

    svg.append('g')
        .attr('class', 'countries')
        .selectAll('path')
            .data(geoCountries['features'])
        .enter().append('path')
            .attr('class', function(d) {
                return classify(d['id']);
            })
            .attr('d', path);

    svg.append('g')
        .attr('class', 'rivers')
        .selectAll('path')
            .data(geoRivers['features'])
        .enter().append('path')
            .attr('d', path);

    svg.append('g')
        .attr('class', 'lakes')
        .selectAll('path')
            .data(geoLakes['features'])
        .enter().append('path')
            .attr('d', path);

    svg.append('g')
        .attr('class', 'cities nepal')
        .selectAll('path')
            .data(geoCities['features'])
        .enter().append('path')
            .attr('d', path)
            .attr('class', function(d) {
                var c = 'place';
                c += ' ' + classify(d['properties']['city']);
                c += ' ' + classify(d['properties']['featurecla']);
                c += ' scalerank-' + d['properties']['scalerank'];
                return c;
            });

    svg.append('g')
        .attr('class', 'cities neighbors')
        .selectAll('path')
            .data(geoNeighbors['features'])
        .enter().append('path')
            .attr('d', path)
            .attr('class', function(d) {
                var c = 'place';
                c += ' ' + classify(d['properties']['city']);
                c += ' ' + classify(d['properties']['featurecla']);
                c += ' scalerank-' + d['properties']['scalerank'];
                return c;
            });

    svg.append('g')
        .attr('class', 'country-labels')
        .selectAll('.label')
            .data(geoCountries['features'])
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
                return d['properties']['country'];
            });
            
    var cityLabels = [ 'city-labels shadow', 
                       'city-labels', 
                       'city-labels shadow nepal', 
                       'city-labels nepal' ];
    cityLabels.forEach(function(v, k) {
        var cityData;
        if (v == 'city-labels shadow' || v == 'city-labels') {
            cityData = geoNeighbors['features'];
        } else {
            cityData = geoCities['features'];
        }
    
        svg.append('g')
            .attr('class', v)
            .selectAll('.label')
                .data(cityData)
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
                    return d['properties']['city'];
                });
    });
    d3.selectAll('.shadow')
        .attr('filter', 'url(#dropshadow)');

    // update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
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

/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
$(window).load(onWindowLoaded);