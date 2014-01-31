var $graphic;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};
var graphic_data_url = 'data.csv';
var num_bars;


// render the graphic
function render(width) {
    console.log('render');
    $graphic.empty();
    
//    draw_chart('mentions', width);
    draw_chart('deficit_gdp', width);
//    draw_chart('deficit_amt', width);
}

function draw_chart(chart, width) {
    var margin = { top: 10, right: 0, bottom: 35, left: 30 };
    var width = width - margin.left - margin.right;
    var height = 150;
    
    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(graphic_data.map(function(d) { return d.month; }));

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([
            d3.min(graphic_data, function(d) { 
                var n = d[chart];
                console.log(Math.ceil(n/5) * 5);
                return Math.ceil(n/5) * 5; // round to next 5
            }),
            d3.max(graphic_data, function(d) { 
                var n = parseInt(d[chart]);
                return Math.ceil(n/5) * 5; // round to next 5
            })
        ]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .tickSize(6,0);
        
    var num_ticks = num_bars / 2;
        
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks)
        .tickFormat(function(d, i) {
            if (i == num_ticks) {
                return '$' + d;
            } else {
                return d;
            }
        });

    var y_axis_grid = function() { return yAxis; }
    
    var svg = d3.select('#graphic').append('svg')
        .attr('class', 'svg-' + chart)
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

/*    svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0)
            .tickFormat('')
        ); */

    svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
            .data(graphic_data)
        .enter().append('rect')
            .attr("x", function(d) { return x(d.month); })
            .attr("y", function(d) { return y(d[chart]); })
            .attr("width", x.rangeBand())
            .attr("height", function(d){ 
                return height - y(d[chart]);
            })
            .attr('class', function(d) { 
                var fmt = d3.time.format('%Y-%m');
                return 'bar-' + fmt(d.month);
            });
/*
    svg.append('text')
        .attr('class', 'x axis-label')
        .attr('x', width / 2)
        .attr('y', height + margin.top + margin.bottom - 12)
        .attr('text-anchor', 'middle')
        .text('Year of ownership'); */


    /* update responsive iframe */
    sendHeightToParent();
}


/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    $graphic = $('#graphic');
    
    if (Modernizr.svg) {
        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;
            graphic_data.forEach(function(d) {
                d.month = d3.time.format('%Y%m').parse(d.month);
            });

            num_bars = graphic_data.length;

            setupResponsiveChild({
                renderCallback: render 
            });
        });
    } else {
        setupResponsiveChild();
    }
})
