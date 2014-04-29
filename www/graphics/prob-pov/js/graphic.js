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
    { "yr": 5, "chance": 40.8 },
    { "yr": 10, "chance": 23  },

];
// top 10 percent
var graphic_data_5 = [
    { "yr": 1, "chance": 56.4},
    { "yr": 2, "chance": 39.4},
    { "yr": 3, "chance": 32},
    { "yr": 4, "chance": 27.1},
    { "yr": 5, "chance": 20.8},
    { "yr": 10, "chance":9.7},

];
// top 5 percent
var graphic_data_6 = [
    { "yr": 1, "chance": 39.3 },
    { "yr": 2, "chance": 24.8 },
    { "yr": 3, "chance": 17.7 },
    { "yr": 4, "chance": 13.2 },
    { "yr": 5, "chance": 9.1 },
    { "yr": 10, "chance":4.5 },

];
// top 1 percent
var graphic_data_7 = [
    { "yr": 1, "chance": 12.4 },
    { "yr": 2, "chance": 5.3 },
    { "yr": 3, "chance": 3.3 },
    { "yr": 4, "chance": 2.5 },
    { "yr": 5, "chance":1.6 },
    { "yr": 10, "chance":0.6 },

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
    "top20": "What are the chances you break into the top 20 percent?",
    "top10": "What are the chances you break into the top 10 percent?",
    "top5": "What are the chances you break into the top 5 percent?",
};

/*
 * Render the graphic
 */
<<<<<<< HEAD
function draw_graphic(width) {
    if (Modernizr.svg) {
        // clear out existing graphics
        $graphic.empty();
=======
function render(width) {
    // TODO: draw your graphic
//        console.log(graphic_data);

        var margin = { top: 0, right: 100, bottom: 20, left: 75 };
        var width = width/1.3 - margin.left - margin.right;
        var height = 400 - margin.top - margin.bottom;
>>>>>>> 091457ce59f99948d5f9db9a6ba5785e36de9517
    
        // load in new graphics
        render_chart(graphic_data_4, 'top20', width)
        render_chart(graphic_data_5, 'top10', width)
        render_chart(graphic_data_6, 'top5', width)
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

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
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
<<<<<<< HEAD
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
=======
//        console.log(quintiles);

        // Scale the range of the data
        x.domain(d3.extent(graphic_data, function(d) { return d3.round(d.yr); }));
        y.domain([
            d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.indexed; }); }),
            d3.max(quintiles, function(c) { return d3.max(c.values, function(v) { return v.indexed; }); })
        ]);

        var quint = svg.selectAll(".quint")
            .data(quintiles)
            .enter().append("g")
            .attr("class", "quint");

        svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .call(yAxis);           
            
        svg.append("g")        
            .attr("class", "y grid")
            .call(y_axis_grid()
                .tickSize(-width, 0, 0)
                .tickFormat("")); 
>>>>>>> 091457ce59f99948d5f9db9a6ba5785e36de9517
    
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


<<<<<<< HEAD
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
=======
        quint.append("path")
            .attr('class', function(d) { 
                return 'line quint-' + d.name.replace(/\s+/g, '-').toLowerCase();
            })
            .style("opacity", .2)
            .attr("d", function(d) { return line(d.values); });

            // .style("stroke", function(d) { 
            //                 if (d.name.toLowerCase() == 'all industries') {
            //                     return '#333';
            //                 } else {
            //                     return color(d.name);
            //                 }
            //             });

        quint.append("circle")
              .attr("class", "point")
              .attr("r", 3.5)
              .attr("cx", function(d, i) { if (d.values[i] != undefined) { return xMap(d.values[i]); }})
              .attr("cy", function(d, i) { if (d.values[i] != undefined) { return yMap(d.values[i]); }});
              // .style("fill", function(d) { return color(cValue(d));}) 
              // .on("mouseover", function(d) {
              //     tooltip.transition()
              //          .duration(200)
              //          .style("opacity", .9);
              //     tooltip.html(d["Cereal Name"] + "<br/> (" + xValue(d) 
              //       + ", " + yValue(d) + ")")
              //          .style("left", (d3.event.pageX + 5) + "px")
              //          .style("top", (d3.event.pageY - 28) + "px");
              // })


        // svg.append('g')
        //     .attr('class', 'x grid')
        //     .attr('transform', 'translate(0,' + height + ')')
        //     .call(x_axis_grid()
        //         .tickSize(-height, 0, 0)
        //         .tickFormat('')
        //     );

        quint.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr('class', function(d) {
                return 'text quint-' + d.name.replace(/\s+/g, '-').toLowerCase();
>>>>>>> 091457ce59f99948d5f9db9a6ba5785e36de9517
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
                return x(d['value'][last_data_point]['yr']) + 6;
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
            d.yr = +d.yr
        });
        graphic_data_5.forEach(function(d) {
            d.yr = +d.yr
        });
        graphic_data_6.forEach(function(d) {
            d.yr = +d.yr
        });
        
        // setup pym
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    } else {
        pymChild = new pym.Child();
    }
})
