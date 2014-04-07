var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * TODO: draw your graphic
 */

var $graphic = $('#graphic');
    var graphic_data_url = 'smalllevel_indexed.csv';
	var graphic_data;

function render(width) {

	    var margin = { top: 0, right: 100, bottom: 20, left: 75 };
        var width = width - margin.left - margin.right;
        var height = 600 - margin.top - margin.bottom;
    
        var num_x_ticks = 16;
        if (width <= 480) {
            num_x_ticks = 8;
        }

           // clear out existing graphics
        $graphic.empty();

        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        // var color = d3.scale.category10();
        var color = d3.scale.ordinal()
        .range(["#D8472B", "#17807E", "#51AADE", "#EFC637", "#E38D2C", "#E27560", "#981E24"]); // colors

        var svg = d3.select("#graphic")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxis = d3.svg.axis().scale(x)
            .orient("bottom")
            .tickSize(6)
            .ticks(num_x_ticks);

        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .ticks(7);

        var y_axis_grid = function() { return yAxis; }

        // var line = d3.svg.line()
        //     .interpolate("basis")
        //     .x(function(d) { return x(d.age); })
        //     .y(function(d) { return y(d.close); });

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.age); })
            .y(function(d) { return y(d.indexed); });



        // finds the first header that is not 'age' 
        // gives each header a color
        color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== "age"; }));

        // mapping data from csv file
        // maps into color domain
        var quintiles = color.domain().map(function(name) {
            return {
                name: name,
                values: graphic_data.map(function(d) {
                    return {age: d.age, indexed: +d[name]};
                })
            };
        });


        // Scale the range of the data
        x.domain(d3.extent(graphic_data, function(d) { return d3.round(d.age); }));
        y.domain([
            d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.indexed; }); }),
            d3.max(quintiles, function(c) { return d3.max(c.values, function(v) { return v.indexed; }); })
        ]);

        var quint = svg.selectAll(".quint")
            .data(quintiles)
            .enter().append("g")
            .attr("class", "quint");

        quint.append("path")
            .attr('class', function(d) { 
                return 'line quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
            })
            .style("opacity", .4)
            .attr("d", function(d) { return line(d.values); })
            .on("mouseover", mouseover)
	        .on("mouseout", mouseout)
            .style("stroke", function(d) { 
                            if (d.name.toLowerCase() == 'all industries') {
                                return '#333';
                            } else {
                                return color(d.name);
                            }
                        });
        svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    
        // svg.append('g')
        //     .attr('class', 'x grid')
        //     .attr('transform', 'translate(0,' + height + ')')
        //     .call(x_axis_grid()
        //         .tickSize(-height, 0, 0)
        //         .tickFormat('')
        //     );

        svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .call(yAxis);
    
        svg.append("g")         
            .attr("class", "y grid")
            .call(y_axis_grid()
                .tickSize(-width, 0, 0)
                .tickFormat("")
            );    

        quint.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr('class', function(d) { 
                return 'text quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
            })
            .attr("transform", function(d) { return "translate(" + x(d.value.age) + "," + y(d.value.indexed) + ")"; })
            .attr("x", 3)
            .attr("dy", ".15em")
            .text(function(d) { return d.name; })
            .style("opacity", .7);


      svg.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("y", 6)
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    // .attr('transform', 'translate(' + -width/36 + ',' + height/6 + ') rotate(-90)')
                    .attr('transform', 'translate( -70 ,' + height/3 + ') rotate(-90)')
                    .text("Index, Age 25 = 1")
                    .style("opacity", .7);

        // function to highlight lines: http://bl.ocks.org/AlexanderGraf/5416979#indfundbyregbytime.js
        function mouseover(d, i) {
            d3.select(this).style("opacity", "1");
        };

        function mouseout(d, i) {
            d3.select(this).style("opacity", ".5");
        };

}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
            d3.csv(graphic_data_url, function(error, data) {
                graphic_data = data;

                graphic_data.forEach(function(d) {
                    d.age = +d.age;
                });

                setupResponsiveChild({
                    renderCallback: render
                });
            });
    
})
