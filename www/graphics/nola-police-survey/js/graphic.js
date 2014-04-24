var $graphic;
var graphic_aspect_width = 4;
var graphic_aspect_height = 3;
var mobile_threshold = 625;
var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var graphic_data_4 = [
    { "date": "Aug-09", "satisfied": 33, "unsatisfied": 60 },
    { "date": "Aug-10", "satisfied": 50, "unsatisfied": 42 },
    { "date": "Feb-11", "satisfied": 60, "unsatisfied": 34 },
    { "date": "Aug-11", "satisfied": 47, "unsatisfied": 46 },
    { "date": "Feb-12", "satisfied": 61, "unsatisfied": 33 },
    { "date": "Aug-12", "satisfied": 56, "unsatisfied": 35 },
    { "date": "Mar-13", "satisfied": 58, "unsatisfied": 33 },
    { "date": "Aug-13", "satisfied": 58, "unsatisfied": 36 },
    { "date": "Mar-14", "satisfied": 60, "unsatisfied": 30 }
];

var graphic_data_5 = [
    { "date": "Mar-13", "satisfied": 66, "unsatisfied": 26 },
    { "date": "Aug-13", "satisfied": 74, "unsatisfied": 20 },
    { "date": "Mar-14", "satisfied": 72, "unsatisfied": 21 }
];

var graphic_data_15 = [
    { "date": "Aug-09", "agree": 69, "disagree": 29 },
    { "date": "Aug-10", "agree": 76, "disagree": 23 },
    { "date": "Feb-11", "agree": 74, "disagree": 25 },
    { "date": "Aug-11", "agree": 77, "disagree": 20 },
    { "date": "Feb-12", "agree": 81, "disagree": 17 },
    { "date": "Aug-12", "agree": 79, "disagree": 21 },
    { "date": "Mar-13", "agree": 79, "disagree": 19 },
    { "date": "Aug-13", "agree": 85, "disagree": 14 },
    { "date": "Mar-14", "agree": 81, "disagree": 18 }
];

var labels = {
    "satisfaction": "Would you say that you are satisfied or unsatisfied with the New Orleans Police Department overall?",
    "neighborhood": "Would you say that you are satisfied or unsatisfied with police performance in your neighborhood overall?",
    "safety": "Tell me if you agree or disagree with the following statement: &ldquo;I feel safe in my own neighborhood.&rdquo;"
};

/*
 * Render the graphic
 */
function draw_graphic(width) {
    if (Modernizr.svg) {
        // clear out existing graphics
        $graphic.empty();
    
        // load in new graphics
        render_chart(graphic_data_4, 'satisfaction', width)
        render_chart(graphic_data_5, 'neighborhood', width)
        render_chart(graphic_data_15, 'safety', width)
    }
}
function render_chart(data, id, container_width) {
    var graphic_data = data;
    var is_mobile = false;
    var last_data_point = graphic_data.length - 1;
    var margin = { top: 10, right: 30, bottom: 25, left: 40 };
    var num_ticks = 3;
    var width = container_width;

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
        width = Math.floor(((container_width - 11) * 2/3) - margin.left - margin.right);
//        width = container_width - margin.left - margin.right;
    } else {
        width = Math.floor(((container_width - 44) / 3) - margin.left - margin.right);
    }

    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    var formatAsPercentage = d3.formatPrefix('%',0);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(num_ticks);
        
    var x_axis_grid = function() { return xAxis; }

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks)
        .tickFormat(function(d,i) {
            return d + '%';
        });
    
    var y_axis_grid = function() { return yAxis; }
    
    var line = d3.svg.line()
        .interpolate('monotone')
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.amt); });
    
    // parse data into columns
    var lines = {};
    for (var column in graphic_data[0]) {
        if (column == 'date') continue;
        lines[column] = graphic_data.map(function(d) {
            return { 
                'date': d.date, 
                'amt': d[column]
            };
        });
    }
   
    var container = d3.select('#graphic')
        .append('div')
            .attr('id', 'graph-' + id)
            .attr('class', 'graph')
            .attr('style', function(d) {
                if (!is_mobile) {
                    return 'width: ' + (width + margin.left + margin.right) + 'px';
                }
            });
    
    var meta = container.append('div')
        .attr('class', 'meta')
        .attr('style', function(d) {
            if (is_mobile) {
                return 'width: ' + ((container_width - 11) / 3) + 'px';
            }
        });
    
    var headline = meta.append('h3')
        .html(labels[id]);

    var legend = meta.append('ul')
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


    var svg = container.append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    x.domain(d3.extent(graphic_data_4, function(d) { return d.date; }));
    y.domain([0,100]);
    
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

    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(d3.entries(lines))
        .enter()
        .append('text')
            .attr('x', function(d) { 
                return x(d['value'][last_data_point]['date']) + 6;
            })
            .attr('y', function(d) { 
                return y(d['value'][last_data_point]['amt'] - 1);
            })
            .attr('text-anchor', 'left')
            .text(function(d) { 
                return d['value'][last_data_point]['amt'] + '%' 
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
        // format datestamps
        graphic_data_4.forEach(function(d) {
            d.date = d3.time.format('%b-%y').parse(d.date);
        });
        graphic_data_5.forEach(function(d) {
            d.date = d3.time.format('%b-%y').parse(d.date);
        });
        graphic_data_15.forEach(function(d) {
            d.date = d3.time.format('%b-%y').parse(d.date);
        });
        
        // setup pym
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    } else {
        pymChild = new pym.Child();
    }
})
