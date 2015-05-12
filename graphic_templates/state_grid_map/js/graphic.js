// global vars
var $graphic = null;
var $mapTemplate = null;
var pymChild = null;
var stateLabels = d3.selectAll('svg text');

var MOBILE_THRESHOLD = 500;
var GRAPHIC_DEFAULT_WIDTH = 600;

var COLORS = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var STATE_COORDINATES = {"Alaska":{"x":0,"y":0},"Maine":{"x":11,"y":0},"Vermont":{"x":10,"y":1},"New Hampshire":{"x":11,"y":1},"Washington":{"x":1,"y":2},"Idaho":{"x":2,"y":2},"Montana":{"x":3,"y":2},"North Dakota":{"x":4,"y":2},"Minnesota":{"x":5,"y":2},"Illinois":{"x":6,"y":2},"Wisconsin":{"x":7,"y":2},"Michigan":{"x":8,"y":2},"New York":{"x":9,"y":2},"Rhode Island":{"x":10,"y":2},"Massachusetts":{"x":11,"y":2},"Oregon":{"x":1,"y":3},"Nevada":{"x":2,"y":3},"Wyoming":{"x":3,"y":3},"South Dakota":{"x":4,"y":3},"Iowa":{"x":5,"y":3},"Indiana":{"x":6,"y":3},"Ohio":{"x":7,"y":3},"Pennsylvania":{"x":8,"y":3},"New Jersey":{"x":9,"y":3},"Connecticut":{"x":10,"y":3},"California":{"x":1,"y":4},"Utah":{"x":2,"y":4},"Colorado":{"x":3,"y":4},"Nebraska":{"x":4,"y":4},"Missouri":{"x":5,"y":4},"Kentucky":{"x":6,"y":4},"West Virginia":{"x":7,"y":4},"Virginia":{"x":8,"y":4},"Maryland":{"x":9,"y":4},"Delaware":{"x":10,"y":4},"Arizona":{"x":2,"y":5},"New Mexico":{"x":3,"y":5},"Kansas":{"x":4,"y":5},"Arkansas":{"x":5,"y":5},"Tennessee":{"x":6,"y":5},"North Carolina":{"x":7,"y":5},"South Carolina":{"x":8,"y":5},"District of Columbia":{"x":9,"y":5},"Oklahoma":{"x":4,"y":6},"Louisiana":{"x":5,"y":6},"Mississippi":{"x":6,"y":6},"Alabama":{"x":7,"y":6},"Georgia":{"x":8,"y":6},"Hawaii":{"x":0,"y":7},"Texas":{"x":4,"y":7},"Florida":{"x":9,"y":7}};
var GRID = {
    'x': 12,
    'y': 8
};

/*
 * Initialize
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');
        $mapTemplate = $('#map-template');

        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({ });
    }
}


/*
 * RENDER THE GRAPHIC
 */
var render = function(containerWidth) {
    var graphicWidth;

    // fallback if page is loaded outside of an iframe
    if (!containerWidth) {
        containerWidth = GRAPHIC_DEFAULT_WIDTH;
    }

    // check the container width; set mobile flag if applicable
    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // draw the new graphic
    // (this is a separate function in case I want to be able to draw multiple charts later.)
    var categories = makeCategories(MAPS[0]);
    drawMap($('#graphic'), MAPS[0], categories);

    // update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Assign colors to categories in the map data
 */
var makeCategories = function(mapData) {
    var categoryColors = [
        COLORS['red4'],
        COLORS['orange4'],
        COLORS['teal4'],
        COLORS['yellow4'],
        COLORS['blue4']
    ];

    var categories = {};
    var color;

    _.each(mapData, function(state) {
        if (state['category'] !== null) {
            if (_.has(categories, state['category'])) {
                color = categories[state['category']];
            } else {
                color = categoryColors.pop();
                categories[state['category']] = color;
            }
        }
    });

    return categories;
}

/*
 * Build and render a legend from map categories
 */
var renderLegend = function($el, categories) {
    _.each(categories, function(color, key) {
        var $item = $('<li class="key-item"><label>' + key + '</label></li>')
        var $color = $('<b style="background:' + color + '"></b>');
        $color.prependTo($item);
        $item.prependTo($el);
    });
}

/*
 * DRAW THE GRAPH
 */
var drawMap = function($el, mapData, categories) {
    $el.empty();

    if ($el.attr('id') === 'graphic') {
        $el.append($mapTemplate.html());
    } else {
        $el.append($('#map-template-river').html());
    }

    var $legend = $el.find('.key');
    renderLegend($legend, categories);

    var svg = d3.select('#' + $el.attr('id') + ' svg');

    _.each(mapData, function(state) {
        var color;

        if (state['category'] !== null) {
            var color = categories[state['category']];
            var stateClass = 'state-' + classify(state['state_name']);
            $el.find('.' + stateClass)
                .attr('class', stateClass + ' state-active')
                .attr('fill', color);
        }
    });

    // Draw labels
    stateLabels =  svg.append('g')
        .selectAll('text')
            .data(mapData)
        .enter().append('text')
            .attr('text-anchor', 'middle')
            .text(function(d) {
                var state = _.findWhere(STATE_NAMES, { 'name': d['state_name'] });
                var name = state['name'];
                var postalCode = state['usps'];
                var ap = state['ap'];

                return isMobile ? postalCode : ap;
            })
            .attr('class', function(d) {
                return d['category'] !== null ? 'label label-active' : 'label';
            })
            .attr('x', function(d) {
                var className = '.state-' + classify(d['state_name']);
                console.log(className);
                var tileBox = svg.select(className)[0][0].getBBox();

                return tileBox['x'] + tileBox['width'] * 0.52;
            })
            .attr('y', function(d) {
                var className = '.state-' + classify(d['state_name']);
                var tileBox = svg.select(className)[0][0].getBBox();
                var textBox = d3.select(this)[0][0].getBBox();
                var textOffset = textBox['height'] / 2;

                return (tileBox['y'] + tileBox['height'] * 0.5) + textOffset;
            });
}

/*
 * HELPER FUNCTIONS
 */
var classify = function(str) { // clean up strings to use as CSS classes
    return str.replace(/\s+/g, '-').toLowerCase();
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
$(window).load(onWindowLoaded);
