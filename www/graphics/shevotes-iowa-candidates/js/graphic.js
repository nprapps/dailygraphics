var $graphic;
var bar_gap = 10;
var bar_height = 25;
var graphic_aspect_width = 16;
var graphic_aspect_height = 9;
var mobile_threshold = 480;
var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var graphic_data = [
    { "year": "2000", "pct": 18 },
    { "year": "2002", "pct": 24 },
    { "year": "2004", "pct": 19 },
    { "year": "2006", "pct": 24 },
    { "year": "2008", "pct": 22 },
    { "year": "2010", "pct": 20 },
    { "year": "2012", "pct": 23 }
];

/*
 * Render the graphic
 */
function draw_graphic(width) {
    // clear out existing graphics
    $graphic.empty();

    // load in new graphics
    render_chart(graphic_data, width)
}
function render_chart(data, container_width) {
    var graphic_data = data;
    var is_mobile = false;
    var last_data_point = graphic_data.length - 1;
    var margin = { top: 10, right: 10, bottom: 35, left: 40 };
    var num_bars = graphic_data.length;
    var num_ticks = 4;
    var width = width = container_width - margin.left - margin.right;
    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(graphic_data.map(function(d) { return d.year; }));

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 100]);
/*        .domain([0, d3.max(graphic_data, function(d) { 
            var n = parseInt(d.pct);
            return Math.ceil(n/10) * 10; // round to next 10
        })]); */

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickFormat(function(d,i) {
            if (width <= mobile_threshold) {
                var fmt = d3.time.format('%y');
                return '\u2019' + fmt(d);
            } else {
                var fmt = d3.time.format('%Y');
                return fmt(d);
            }
        });
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks)
        .tickFormat(function(d, i) {
            if (i == 5) {
                return d + '%';
            } else {
                return d;
            }
        });

    var y_axis_grid = function() { return yAxis; }
    
    var svg = d3.select('#graphic').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0)
            .tickFormat('')
        );

    svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
            .data(graphic_data)
        .enter().append('rect')
            .attr("x", function(d) { return x(d.year); })
            .attr("y", function(d) { return y(d.pct); })
            .attr("width", x.rangeBand())
            .attr("height", function(d){ return height - y(d.pct); })
            .attr('class', function(d, i) {
                return 'bar bar-' + i;
            });
                
    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(graphic_data)
        .enter().append('text')
            .attr('x', function(d, i) { 
                return x(d.year) + (x.rangeBand() / 2);
            })
            .attr('y', function(d) { 
                return y(d.pct) - 6;
            })
            .attr('text-anchor', 'middle')
            .text(function(d) { 
                return d.pct + '%';
            });

    if (pymChild) {
        pymChild.sendHeightToParent();
    }
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    $graphic = $('#graphic');

    if (Modernizr.svg) {
        graphic_data.forEach(function(d) {
            d.year = d3.time.format('%Y').parse(d.year);
        });

        // setup pym
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    } else {
        pymChild = new pym.Child();
    }
})
