var EARTH_RADIUS = 6371000;

/*
 * Convert degreest to radians.
 */
var degToRad = function(degrees) {
    return degrees * Math.PI / 180;
}

/*
 * Convert radians to degrees.
 */
var radToDeg = function(radians) {
    return radians * 180 / Math.PI;
}

/*
 * Convert kilometers to miles.
 */
var kmToMiles = function(km) {
    return km * 0.621371;
}

/*
 * Convert miles to kilometers.
 */
var milesToKm = function(miles) {
    return miles * 1.60934;
}

/*
 * Calculate the distance between two points.
 */
var distance = function(a, b) {
     var lat1Rad = degToRad(a[1]), lng1Rad = degToRad(a[0]);
     var lat2Rad = degToRad(b[1]), lng2Rad = degToRad(b[0]);
     var latDelta = lat2Rad - lat1Rad;
     var lngDelta = lng2Rad - lng1Rad;

     var a = Math.sin(latDelta / 2) * Math.sin(latDelta / 2) +
             Math.cos(lat1Rad) * Math.cos(lat2Rad) *
             Math.sin(lngDelta / 2) * Math.sin(lngDelta / 2);
     var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
     var d = EARTH_RADIUS * c;

     return kmToMiles(d / 1000);
 };

/*
 * Calculate an end point given a starting point, bearing and distance.
 * Adapted from http://www.movable-type.co.uk/scripts/latlong.html
 */
var calculateDestinationPoint = function(lat, lon, distance, bearing) {
    var distanceFraction = distance / EARTH_RADIUS;
    var bearingRad = degToRad(bearing);

    var lat1Rad = degToRad(lat);
    var lng1Rad = degToRad(lon);

    var lat2Rad = Math.asin(
        Math.sin(lat1Rad) * Math.cos(distanceFraction) +
        Math.cos(lat1Rad) * Math.sin(distanceFraction) * Math.cos(bearingRad)
    );

    var lng2Rad = lng1Rad + Math.atan2(
        Math.sin(bearingRad) * Math.sin(distanceFraction) * Math.cos(lat1Rad),
        Math.cos(distanceFraction) - Math.sin(lat1Rad) * Math.sin(lat2Rad)
    );

    lng2Rad = (lng2Rad + 3 * Math.PI) % (2 * Math.PI) - Math.PI; // normalise to -180..+180°

    return [radToDeg(lng2Rad), radToDeg(lat2Rad)];
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

    var meters = milesToKm(miles) * 1000;

    var endGeo = calculateDestinationPoint(startGeo[1], startGeo[0], meters, 90);
    var end = projection([endGeo[0], endGeo[1]])

    var distance = Math.sqrt(Math.pow(end[0] - start[0], 2) + Math.pow(end[1] - start[1], 2));

    return [start[0] + distance, start[1]];
}

/*
 * Calculate an optimal scale bar length by taking a fraction of the distance
 * covered by the map.
 */
var calculateOptimalScaleBarDistance = function(bbox, divisor) {
    var mapDistance = distance([bbox[0], bbox[1]], [bbox[2], bbox[3]]);
    var fraction = mapDistance / divisor;
    var factor = Math.pow(10, Math.floor(Math.log10(fraction)));

    return scaleLength = Math.round(fraction / factor) * factor;
}
