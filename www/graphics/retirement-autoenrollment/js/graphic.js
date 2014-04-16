var $graphic;
var width_ratio = 16;
var height_ratio = 9;
var mobile_threshold = 500;
var num_bars;
var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};
var graphic_data = [
    { "year": '2001', "amt": 14 },
    { "year": '2003', "amt": 14 },
    { "year": '2005', "amt": 19 },
    { "year": '2007', "amt": 34 },
    { "year": '2009', "amt": 58 },
    { "year": '2011', "amt": 56 },
    { "year": '2013', "amt": 59 }
];


/*
 * Render the graphic
 */
function render(width) {
    if (Modernizr.svg) {
        var margin = { top: 10, right: 0, bottom: 35, left: 35 };
        var height = (width * height_ratio) / width_ratio;
        var width = width - margin.left - margin.right;
    
        $graphic.empty();

        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1)
            .domain(graphic_data.map(function(d) { return d.year; }));

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, d3.max(graphic_data, function(d) { 
                var n = parseInt(d.amt);
                return Math.ceil(n/5) * 5; // round to next 5
            })]);
    
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
            .ticks(5)
            .tickFormat(function(d, i) {
                if (i == 6) {
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
                .attr("y", function(d) { return y(d.amt); })
                .attr("width", x.rangeBand())
                .attr("height", function(d){ return height - y(d.amt); })
                .attr('class', function(d) { 
                    var fmt = d3.time.format('%Y');
                    return 'year-' + fmt(d.year);
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
                    return y(d.amt) + 22;
                })
                .attr('text-anchor', 'middle')
                .attr('class', function(d) { 
                    var fmt = d3.time.format('%Y');
                    return 'l-' + fmt(d.year);
                })
                .text(function(d) { return d.amt + '%' });
    }

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
    num_bars = graphic_data.length;

    graphic_data.forEach(function(d) {
        d.year = d3.time.format('%Y').parse(d.year);
    });

    var pymChild = new pym.Child({
        renderCallback: render
    });
})
