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

// top20 percent
var graphic_data_4 = [
    { "yr": 1, "chance": 73.4 },
    { "yr": 2, "chance": 60.5 },
    { "yr": 3, "chance": 53   },
    { "yr": 4, "chance": 46.5 },
    { "yr": 5, "chance": 40.8 }

];
// top 10 percent
var graphic_data_5 = [
    { "yr": 1, "chance": 56.4},
    { "yr": 2, "chance": 39.4},
    { "yr": 3, "chance": 32},
    { "yr": 4, "chance": 27.1},
    { "yr": 5, "chance": 20.8}

];
// top 5 percent
var graphic_data_6 = [
    { "yr": 1, "chance": 39.3 },
    { "yr": 2, "chance": 24.8 },
    { "yr": 3, "chance": 17.7 },
    { "yr": 4, "chance": 13.2 },
    { "yr": 5, "chance": 9.1 }

];
// top 1 percent
var graphic_data_7 = [
    { "yr": 1, "chance": 12.4 },
    { "yr": 2, "chance": 5.3 },
    { "yr": 3, "chance": 3.3 },
    { "yr": 4, "chance": 2.5 },
    { "yr": 5, "chance":1.6 }

];

// poverty
var graphic_data_8 = [
    { "yr": 1, "chance": 38.9 },
    { "yr": 2, "chance": 19.9 },
    { "yr": 3, "chance": 12.9 },
    { "yr": 4, "chance": 8.7  },
    { "yr": 5, "chance": 6.1  }

];

// 1.25*poverty
var graphic_data_9 = [
    { "yr": 1, "chance": 46.8 },
    { "yr": 2, "chance": 24.9 },
    { "yr": 3, "chance": 17.1 },
    { "yr": 4, "chance": 12.7 },
    { "yr": 5, "chance": 9.1  }

];

// 1.5*poverty
var graphic_data_10 = [
    { "yr": 1, "chance": 54.1 },
    { "yr": 2, "chance": 32.2 },
    { "yr": 3, "chance": 22.2 },
    { "yr": 4, "chance": 16.5 },
    { "yr": 5, "chance": 12.4 }

];
// 100k
var graphic_data_11 = [
    { "yr": 1, "chance": 76.8 },
    { "yr": 2, "chance": 62.5 },
    { "yr": 3, "chance": 53.0 },
    { "yr": 4, "chance": 46.6 },
    { "yr": 5, "chance": 41.3 }

];
// 150k
var graphic_data_12 = [
    { "yr": 1, "chance": 50.9 },
    { "yr": 2, "chance": 35.1 },
    { "yr": 3, "chance": 23.3 },
    { "yr": 4, "chance": 19.3 },
    { "yr": 5, "chance": 15.9 }

];
// 200k
var graphic_data_13 = [
    { "yr": 1, "chance": 32.2 },
    { "yr": 2, "chance": 19.4 },
    { "yr": 3, "chance": 13.0 },
    { "yr": 4, "chance": 9.4 },
    { "yr": 5, "chance": 6.8 }

];

// var graphic_data_5 = [
//     { "date": "Mar-13", "satisfied": 66, "unsatisfied": 26 },
//     { "date": "Aug-13", "satisfied": 74, "unsatisfied": 20 },
//     { "date": "Mar-14", "satisfied": 72, "unsatisfied": 21 }
// ];

// var graphic_data_15 = [
//     { "date": "Aug-09", "agree": 69, "disagree": 29 },
//     { "date": "Aug-10", "agree": 76, "disagree": 23 },
//     { "date": "Feb-11", "agree": 74, "disagree": 25 },
//     { "date": "Aug-11", "agree": 77, "disagree": 20 },
//     { "date": "Feb-12", "agree": 81, "disagree": 17 },
//     { "date": "Aug-12", "agree": 79, "disagree": 21 },
//     { "date": "Mar-13", "agree": 79, "disagree": 19 },
//     { "date": "Aug-13", "agree": 85, "disagree": 14 },
//     { "date": "Mar-14", "agree": 81, "disagree": 18 }
// ];

var labels = {
    "top20": "...break into the top 20 percent of income?",
    "top10": "...break into the top 10 percent of income?",
    "top5": "...break into the top 5 percent of income?",
    "top1": "...break into the top 1 percent of income?",
    "p1": "...fall into poverty?",
    "p125": "...fall into near poverty and below?",
    "k100": "...make over $100,000 (in 2009 dollars)?",
    "k150": "...make over $150,000 (in 2009 dollars)?",
    "k200": "...make over $200,000 (in 2009 dollars)?",
    // "p15": "...into the top 1 percent of income?",
};

/*
 * Render the graphic
 */
function draw_graphic(width) {
    if (Modernizr.svg) {
        // clear out existing graphics
        $graphic.empty();
    
        // load in new graphics
        render_chart(graphic_data_4, 'top20', width);
        render_chart(graphic_data_5, 'top10', width);
        render_chart(graphic_data_6, 'top5', width);
        render_chart(graphic_data_7, 'top1', width);
        render_chart(graphic_data_9, 'p125', width);
        render_chart(graphic_data_8, 'p1', width);
        render_chart(graphic_data_11, 'k100', width);
        // render_chart(graphic_data_12, 'k150', width);
        render_chart(graphic_data_13, 'k200', width);
    }
}
function render_chart(data, id, container_width) {
    var graphic_data = data;
    var is_mobile = false;
    var last_data_point = graphic_data.length - 1;
    var margin = { top: 10, right: 30, bottom: 35, left: 40 };
    var num_ticks = 5;
    var width = container_width;

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
        width = Math.floor(((container_width - 11) ) - margin.left - margin.right);
//        width = container_width - margin.left - margin.right;
    } else {
        width = Math.floor(((container_width - 44) / 2) - margin.left - margin.right);
    }

    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(num_ticks);
        
    var x_axis_grid = function() { return xAxis; };

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks)
        .tickFormat(function(d,i) {
            return d + '%';
        });
    
    var y_axis_grid = function() { return yAxis; };
    
    var line = d3.svg.line()
        .interpolate('monotone')
        .x(function(d) { return x(d.yr); })
        .y(function(d) { return y(d.amt); });
    
    // parse data into columns
    var lines = {};
    for (var column in graphic_data[0]) {
        if (column == 'yr') continue;
        lines[column] = graphic_data.map(function(d) {
            return {
                'yr': d.yr,
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
                return 'width: ' + ((container_width - 11) ) + 'px';
            }
        });
    
    var headline = meta.append('h3')
        .html(labels[id]);

    // var legend = meta.append('ul')
    //         .attr('class', 'key')
    //         .selectAll('g')
    //             .data(d3.entries(lines))
    //         .enter().append('li')
    //             .attr('class', function(d, i) { return 'key-item key-' + i + ' ' + d.key.replace(' ', '-').toLowerCase(); });
    // legend.append('b')
    // legend.append('label')
    //     .text(function(d) {
    //         return d.key
    //     });


    var svg = container.append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    x.domain(d3.extent(graphic_data_4, function(d) { return d.yr; }));
    y.domain([0,100]);
    
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    // svg.append('g')
    //     .attr('class', 'x grid')
    //     .attr('transform', 'translate(0,' + height + ')')
    //     .call(x_axis_grid()
    //         .tickSize(-height, 0, 0)
    //         .tickFormat('')
    //     );

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

// x axis label
    // svg.append('text')
    //     .text("Number Of Consecutive Years")
    //     .attr("x", width/10)
    //     .attr("y",y(-35));

// last value
    svg.append('g')
        .attr('class', 'end-value')
        .selectAll('text')
            .data(d3.entries(lines))
        .enter()
        .append('text')
            .attr('x', function(d) {
                return x(d['value'][last_data_point]['yr']) - 4;
            })
            .attr('y', function(d) {
                return y(d['value'][last_data_point]['amt'] + 6);
            })
            .attr('text-anchor', 'left')
            .text(function(d) {
                return d['value'][last_data_point]['amt'] + '%';
            });

// first value
    svg.append('g')
        .attr('class', 'start-value')
        .selectAll('text')
            .data(d3.entries(lines))
        .enter()
        .append('text')
            .attr('x', function(d) {
                return x(d['value'][0]['yr']) - 4;
            })
            .attr('y', function(d) {
                return y(d['value'][0]['amt'] + 6);
            })
            .attr('text-anchor', 'left')
            .text(function(d) {
                return d['value'][0]['amt'] + '%' ;
            });

var xaxis_label = meta.append('p')
        .html("For How Many Consecutive Years");

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
            d.yr = +d.yr;
        });
        graphic_data_5.forEach(function(d) {
            d.yr = +d.yr;
        });
        graphic_data_6.forEach(function(d) {
            d.yr = +d.yr;
        });
        
        // setup pym
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    } else {
        pymChild = new pym.Child();
    }
})
