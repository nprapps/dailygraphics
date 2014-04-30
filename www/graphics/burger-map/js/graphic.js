var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * Render the graphic
 */


var IS_MOBILE = Modernizr.touch; // disable certain features for touch devices
var WINDOW_WIDTH = $('body').width();
var ZOOM_LENS_THRESHOLD = 16;

var show_overlay = true;

$(document).ready(function(){
    
    if (WINDOW_WIDTH < 768) {
        IS_MOBILE = true;
    }

    var southWest = new L.LatLng(41, 74);
    var northEast = new L.LatLng(40.8, 74.1);
    var bounds = new L.LatLngBounds(southWest, northEast);
    
    var map = L.mapbox.map('map',null,{
        minZoom:11, 
        maxZoom:14,
        maxBounds: bounds
    });
    L.control.scale().addTo(map);
        
    //var base_layer = L.mapbox.tileLayer('npr.map-g7ewv5af');
    var base_layer = L.tileLayer('npr.i0idjhhm')
    var info_layer = L.mapbox.tileLayer('npr.ok-moore-tornado-satellite');
    var info_grid = L.mapbox.gridLayer('npr.ok-moore-tornado-satellite');
    var zoom_layer = L.mapbox.tileLayer('npr.ok-moore-tornado-zoomlens');
    
    map.addLayer(base_layer);
    map.addLayer(info_layer);
    map.addLayer(info_grid);
    

});

