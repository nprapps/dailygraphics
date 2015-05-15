// global vars
var $graphic = null;
var pymChild = null;

var MAP_DEFAULT_WIDTH = 624;
var MAP_DEFAULT_HEIGHT = 350;
var MAP_DEFAULT_SCALE = 3000;
var CITY_DOT_RADIUS = 3;
var QUAKE_DOT_RADIUS = 15;
var MOBILE_THRESHOLD = 500;
var PRIMARY_COUNTRY = 'Nepal';

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
 * Calculate an end point given a starting point, bearing and distance.
 * Adapted from http://www.movable-type.co.uk/scripts/latlong.html
 */
var calculateDestinationPoint = function(lat, lon, distance, bearing) {
    var radius = 6371000;

    var distanceFraction = distance / radius; // angular distance in radians
    var bearingR = bearing * Math.PI / 180;

    var lat1r = lat * Math.PI / 180;
    var lng1r = lon * Math.PI / 180;

    var lat2r = Math.asin(
        Math.sin(lat1r) * Math.cos(distanceFraction) +
        Math.cos(lat1r) * Math.sin(distanceFraction) * Math.cos(bearingR)
    );

    var lng2r = lng1r + Math.atan2(
        Math.sin(bearingR) * Math.sin(distanceFraction) * Math.cos(lat1r),
        Math.cos(distanceFraction) - Math.sin(lat1r) * Math.sin(lat2r)
    );

    lng2r = (lng2r + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180°

    return [lng2r * 180 / Math.PI, lat2r * 180 / Math.PI];
};

/*
 * Calculate a scale bar, as follows:
 * - Select a starting pixel coordinate
 * - Convert coordinate to map space
 * - Calculate a fixed distance end coordinate *east* of the start coordinate
 * - Convert end coordinate back to pixel space
 * - Calculate geometric distance between start and end pixel coordinates.
 * - Set end coordinate's x value to start coordinate + distance. Y coords hold constant.
 */
var calculateScaleBarEndPoint = function(projection, start, miles) {
    var startGeo = projection.invert(start);

    var km = miles * 1.60934;
    var meters = km * 1000;

    var endGeo = calculateDestinationPoint(startGeo[1], startGeo[0], meters, 90);
    var end = projection([endGeo[0], endGeo[1]])

    var distance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));

    return [start[0] + distance, start[1]];
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
    textFilter = defs.append('filter')
        .attr('id', 'textshadow');
    textFilter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('result', 'blurOut')
        .attr('stdDeviation', '.25');
    landFilter = defs.append('filter')
        .attr('id', 'landshadow');
    landFilter.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('result', 'blurOut')
        .attr('stdDeviation', '10');

    var projection = d3.geo.mercator()
        .center(mapCentroid)
        .scale(mapScale)
        .translate([ mapWidth/2, mapHeight/2 ]);

    var path = d3.geo.path()
        .projection(projection)
        .pointRadius(CITY_DOT_RADIUS * scaleFactor);

    svg.append('path')
        .attr('class', 'landmass')
        .datum(geoCountries)
        .attr('filter', 'url(#landshadow)')
        .attr('d', path);

    svg.append('g')
        .attr('class', 'countries')
        .selectAll('path')
            .data(geoCountries['features'])
        .enter().append('path')
            .attr('class', function(d) {
                return classify(d['id']);
            })
            .attr('d', path);
    d3.select('.countries path.' + classify(PRIMARY_COUNTRY))
        .moveToFront()
        .attr('class', 'primary ' + classify(PRIMARY_COUNTRY));

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
        .attr('class', 'cities primary')
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
                return COUNTRIES[d['properties']['country']] || d['properties']['country'];
            });
    d3.select('.country-labels text.' + classify(PRIMARY_COUNTRY))
        .attr('class', 'label primary ' + classify(PRIMARY_COUNTRY));

    var cityLabels = [ 'city-labels shadow',
                       'city-labels',
                       'city-labels shadow primary',
                       'city-labels primary' ];
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
                    return CITIES[d['properties']['city']] || d['properties']['city'];
                });
    });
    d3.selectAll('.shadow')
        .attr('filter', 'url(#textshadow)');

    var scaleBarStart = [10, mapHeight - 20];
    var scaleBarEnd = calculateScaleBarEndPoint(projection, scaleBarStart, 100);

    svg.append('g')
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
        .text('100 miles');

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
$(window).load(onWindowLoaded);
