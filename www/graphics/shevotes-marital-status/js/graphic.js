var $graphic;
var graphic_aspect_width = 16;
var graphic_aspect_height = 9;
var graphic_data;
var graphic_data_url = 'data.csv';
var mobile_threshold = 480;
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
function draw_graphic(container_width) {
    var margin = {top: 10, right: 15, bottom: 25, left: 35};
    var width = container_width - margin.left - margin.right;
    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;
    var last_data_point = graphic_data.length - 1;
    var num_ticks = 8;
    if (container_width < mobile_threshold) {
        num_ticks = 4;
    }

    // clear out existing graphics
    $graphic.empty();

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(6)
        .tickFormat(function(d,i) {
            if (container_width <= mobile_threshold) {
                var fmt = d3.time.format('%y');
                return '\u2019' + fmt(d);
            } else {
                var fmt = d3.time.format('%Y');
                return fmt(d);
            }
        });
        
    var x_axis_grid = function() { return xAxis; }

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks)
        .tickFormat(function(d) {
            return d + '%';
        });
    
    var y_axis_grid = function() { return yAxis; }

    var line = d3.svg.line()
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.amt); });
    
    // parse data into columns
    var lines = {};
    for (var column in graphic_data[0]) {
        if (column == 'year') continue;
        lines[column] = graphic_data.map(function(d) {
            return { 'year': d.year, 'amt': d[column] };
        }).filter(function(d) {
            return d.amt.length;
        });
    }
   
    var legend = d3.select('#graphic').append('ul')
            .attr('class', 'key')
            .selectAll('g')
                .data(d3.entries(lines))
            .enter().append('li')
                .attr('class', function(d, i) { return 'key-item key-' + i + ' ' + d.key.replace(' ', '-').toLowerCase(); });
    legend.append('b')
    legend.append('label')
        .text(function(d) {
            return d.key
        });

    var svg = d3.select('#graphic').append('svg')
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    x.domain(d3.extent(graphic_data, function(d) { return d.year; }));
    y.domain([
        d3.min(d3.entries(lines), function(c) { 
            return d3.min(c.value, function(v) { 
                var n = parseFloat(v.amt);
                return Math.floor(n/20) * 20; // round to next 10
                return n; 
            }); 
        }),
        d3.max(d3.entries(lines), function(c) { 
            return d3.max(c.value, function(v) { 
                var n = parseFloat(v.amt);
                return Math.ceil(n/10) * 10; // round to next 10
                return n; 
            }); 
        })
    ]);
    
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(x_axis_grid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );

    svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        );

    svg.append('g').selectAll('path')
        .data(d3.entries(lines))
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'line line-' + i;
            })
            .attr('d', function(d) {
                return line(d.value);
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
        // load data
        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;

            // format datestamps
            graphic_data.forEach(function(d) {
                d.year = d3.time.format('%Y').parse(d.year);
            });
        
            // setup pym
            pymChild = new pym.Child({
                renderCallback: draw_graphic
            });
        });
    } else {
        pymChild = new pym.Child();
    }
})
