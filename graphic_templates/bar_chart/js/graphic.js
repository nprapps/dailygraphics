// global vars
var $graphic = null;
var pymChild = null;

var BAR_HEIGHT = 30;
var BAR_GAP = 5;
var GRAPHIC_DATA_URL = 'data.csv';
var GRAPHIC_DEFAULT_WIDTH = 600;
var LABEL_MARGIN = 6;
var LABEL_WIDTH = 85;
var MOBILE_THRESHOLD = 500;
var VALUE_MIN_WIDTH = 30;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};
var graphicData;
var isMobile = false;

// D3 formatters
var fmtComma = d3.format(',');
var fmtYearAbbrev = d3.time.format('%y');
var fmtYearFull = d3.time.format('%Y');


/*
 * Initialize
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');

        d3.csv(GRAPHIC_DATA_URL, function(error, data) {
            graphicData = data;

            graphicData.forEach(function(d) {
                d['amt'] = +d['amt'];
            });

            pymChild = new pym.Child({
                renderCallback: render
            });
        });
    } else {
        pymChild = new pym.Child({ });
    }
}


/*
 * RENDER THE GRAPHIC
 */
var render = function(containerWidth) {
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

    // clear out existing graphics
    $graphic.empty();

    // draw the new graphic
    // (this is a separate function in case I want to be able to draw multiple charts later.)
    drawGraph(containerWidth);

    // update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}


/*
 * DRAW THE GRAPH
 */
var drawGraph = function(graphicWidth) {
    var graph = d3.select('#graphic');
    var margin = {
        top: 0,
        right: 15,
        bottom: 20,
        left: (LABEL_WIDTH + LABEL_MARGIN)
    };
    var numBars = graphicData.length;
    var ticksX = 4;

    // define chart dimensions
    var width = graphicWidth - margin['left'] - margin['right'];
    var height = ((BAR_HEIGHT + BAR_GAP) * numBars);

    var x = d3.scale.linear()
        .domain([ 0, d3.max(graphicData, function(d) {
            return Math.ceil(d['amt']/5) * 5; // round to next 5
        }) ])
        .range([0, width]);

    var y = d3.scale.linear()
        .range([ height, 0 ]);

    // define axis and grid
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(ticksX)
        .tickFormat(function(d) {
            return d.toFixed(0) + '%';
        });

    var xAxisGrid = function() {
        return xAxis;
    }

    // draw the chart
    var svg = graph.append('svg')
        .attr('width', width + margin['left'] + margin['right'])
        .attr('height', height + margin['top'] + margin['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margin['left'] + ',' + margin['top'] + ')');

    // x-axis (bottom)
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    // x-axis gridlines
    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxisGrid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );

    // draw the bars
    svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
            .data(graphicData)
        .enter().append('rect')
            .attr('y', function(d, i) {
                return i * (BAR_HEIGHT + BAR_GAP);
            })
            .attr('width', function(d){
                return x(d['amt']);
            })
            .attr('height', BAR_HEIGHT)
            .attr('class', function(d, i) {
                return 'bar-' + i + ' ' + classify(d['label']);
            });

    // show the values for each bar
    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(graphicData)
        .enter().append('text')
            .attr('x', function(d) {
                return x(d['amt']);
            })
            .attr('y', function(d, i) {
                return i * (BAR_HEIGHT + BAR_GAP);
            })
            .attr('dx', function(d) {
                if (x(d['amt']) > VALUE_MIN_WIDTH) {
                    return -6;
                } else {
                    return 6;
                }
            })
            .attr('dy', (BAR_HEIGHT / 2) + 3)
            .attr('text-anchor', function(d) {
                if (x(d['amt']) > VALUE_MIN_WIDTH) {
                    return 'end';
                } else {
                    return 'begin';
                }
            })
            .attr('class', function(d) {
                var c = classify(d['label']);
                if (x(d['amt']) > VALUE_MIN_WIDTH) {
                    c += ' in';
                } else {
                    c += ' out';
                }
                return c;
            })
            .text(function(d) {
                return d['amt'].toFixed(0) + '%';
            });

    // draw labels for each bar
    var labels = d3.select('#graphic').append('ul')
        .attr('class', 'labels')
        .attr('style', 'width: ' + LABEL_WIDTH + 'px; top: ' + margin['top'] + 'px; left: 0;')
        .selectAll('li')
            .data(graphicData)
        .enter().append('li')
            .attr('style', function(d,i) {
                var s = '';
                s += 'width: ' + LABEL_WIDTH + 'px; ';
                s += 'height: ' + BAR_HEIGHT + 'px; ';
                s += 'left: ' + 0 + 'px; ';
                s += 'top: ' + (i * (BAR_HEIGHT + BAR_GAP)) + 'px; ';
                return s;
            })
            .attr('class', function(d) {
                return classify(d['label']);
            })
            .append('span')
                .text(function(d) {
                    return d['label'];
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