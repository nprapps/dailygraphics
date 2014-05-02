var graphic_aspect_width = 3;
var graphic_aspect_height = 4;
var mobile_threshold = 625;
var pymChild = null;
var yearFormat = d3.time.format("%Y");


var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var $graphic = $('#graphic');
    var graphic_data_url = 'grad-index.csv';
    var graphic_data;
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};

/*
 * Render the graphic
 */
function render(width) {

    // var graphic_data = data;
    var is_mobile = false;
    // var last_data_point = graphic_data.length - 1;
    var margin = { top: 30, right: 100, bottom: 60, left: 80 };
    var num_ticks = 5;

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
        width = Math.floor(((width - 11) ) - margin.left - margin.right);

//        width = width - margin.left - margin.right;
    } else {
        width = Math.floor((width - 44) - margin.left - margin.right);
    }

    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

        
        var num_x_ticks = 12;
        if (width <= 480) {
            num_x_ticks = 6;
        }
        
        var num_y_ticks = 26;
        if (width <= 480) {
            num_y_ticks = 13;
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
        
        var xAxis2 = d3.svg.axis().scale(x)
            .orient("top")
            .tickSize(6)
            .ticks(num_x_ticks);

        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .ticks(num_y_ticks);

        var y_axis_grid = function() { return yAxis; }

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.yr); })
            .y(function(d) { return y(d.indexed); });
 

        // finds the first header that is not 'age' 
        // gives each header a color
        color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== "yr"; }));

        // mapping data from csv file
        // maps into color domain
        var quintiles = color.domain().map(function(name) {
            return {
                name: name,
                values: graphic_data.map(function(d) {
                    return {yr: d.yr, indexed: +d[name]};
                })
            };
        });


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

        quint.append("path")
            .attr('class', function(d) { 
                return 'line quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
            })
            .style("opacity", .8)
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { 
                            if (d.name.toLowerCase() == 'non durables') {
                                return colors["blue2"];
                            } else {
                                return "#CCC";
                            }
                        })
            .style("stroke-width", function(d) { 
                            if (d.name.toLowerCase() == 'non durables') {
                                return "3";
                            } else {
                                return "2";
                            }
                        });

        svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        // svg.append("g") // Add the X Axis
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(0," + 10 + ")")
        //     .call(xAxis2);
    
        svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .attr("transform", "translate("+-width/50+",0)")
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
                return 'ylabel quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
            })
            .attr("transform", function(d) { return "translate(" + x(d.value.yr) + "," + y(d.value.indexed) + ")"; })
            .attr("x", 7)
            .attr("dy", ".3em")
            .text(function(d) { return d.name; })
            .style("fill", "#ccc");



      svg.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("y", 6)
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    // .attr('transform', 'translate(' + -width/36 + ',' + height/6 + ') rotate(-90)')
                    .attr('transform', 'translate(' +  -70 + ',' + height/2.3 + ') rotate(-90)')
                    .text("Index, 1970 = 1")
                    .style("opacity", .7);
      
      // svg.append("text")
      //               .attr("class", "x label")
      //               .attr("text-anchor", "end")
      //               .attr("x", 6)
      //               .attr("dx", ".75em")
      //               // .attr('transform', 'translate(' + -width/36 + ',' + height/6 + ') rotate(-90)')
      //               .attr('transform', 'translate(' + width/2 + ' ,' + (49/46)*height + ')')
      //               .text("Age")
      //               .style("opacity", .7);


      



    // var annotebox = svg.append("text")
    //                         .attr("x", x(76))
    //                         .attr("y", y(.96))
    //                         .attr("id","entertainment-and-gambling2")
    //                         .attr("class","ylabel")
    //                         .text("Travel, etc.")
    //                         .style("fill","#ccc");

    // // var annotebox = svg.append("text")
    // //                         .attr("x", x(25))
    // //                         .attr("y", y(2.25))
    // //                         .attr("class","directions")
    // //                         .text("Click on the different buttons above to highlight how spending breaks down.")
    // //                         .style("font-size","16px");
    // var annotebox = svg.append("text")
    //                         .attr("x", x(54))
    //                         .attr("y", y(1.9))
    //                         .attr("class","annote")
    //                         .text("This is where overall spending"); 

    // var annotebox = svg.append("text")
    //                         .attr("x", x(54))
    //                         .attr("y", y(1.85))
    //                         .attr("class","annote")
    //                         .text("typically peaks in a lifetime.");
    
    // var label = svg.append("text")
    //                         .attr("x", x(27))
    //                         .attr("y", y(2.1))
    //                         .attr("class","buttonlabel")
    //                         .attr("id","all-label")
    //                         .text("Overall Spending")
    //                         .style("fill",colors["blue2"]);

    // var label = svg.append("text")
    //                         .attr("x", x(27))
    //                         .attr("y", y(2.1))
    //                         .attr("class","buttonlabel")
    //                         .attr("id","rent-label")
    //                         .text("Housing")
    //                         .style("opacity","0");

    // var label = svg.append("text")
    //                         .attr("x", x(27))
    //                         .attr("y", y(2.1))
    //                         .attr("class","buttonlabel")
    //                         .attr("id","personal-label")
    //                         .text("Personal Spending")
    //                         .style("opacity","0");

    // var label = svg.append("text")
    //                         .attr("x", x(27))
    //                         .attr("y", y(2.1))
    //                         .attr("class","buttonlabel")
    //                         .attr("id","food-label")
    //                         .text("Food And Alcohol")
    //                         .style("opacity","0");
    // var label = svg.append("text")
    //                         .attr("x", x(27))
    //                         .attr("y", y(2.1))
    //                         .attr("class","buttonlabel")
    //                         .attr("id","transport-label")
    //                         .text("Transportation")
    //                         .style("opacity","0");
    // var label = svg.append("text")
    //                         .attr("x", x(27))
    //                         .attr("y", y(2.1))
    //                         .attr("class","buttonlabel")
    //                         .attr("id","entertainment-label")
    //                         .text("Entertainment")
    //                         .style("opacity","0");



        // function rescale() {
        //     y.domain([0,3]); 
        //     d3.select(".y.axis")
        //             .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
        //             .call(yAxis); 
        //     d3.select(".grid")
        //             .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
        //             .call(y_axis_grid()
        //             .tickSize(-width, 0, 0)
        //             .tickFormat("")
        //     );    
 
        // }

        // function rescale2() {
        // // y.domain([
        // //     d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.indexed; }); }),
        // //     2.1
        // // ]);
        // y.domain([
        //     0,
        //     2.1
        // ]);
        //     d3.select(".y.axis")
        //             .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
        //             .call(yAxis); 
        //     d3.select(".grid")
        //             .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
        //             .call(y_axis_grid()
        //             .tickSize(-width, 0, 0)
        //             .tickFormat("")
        //     );    
 
        // }
            
        function group(d, i) {
            d3.select(this).style("opacity", "1");
        };

        function mouseout(d, i) {
            d3.select(this).style("opacity", ".8");
        };
    
    if (pymChild) {
        pymChild.sendHeightToParent();
    }
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    d3.csv(graphic_data_url, function(error, data) {
    graphic_data = data;

    graphic_data.forEach(function(d) {
        d.yr = d3.round(+d.yr,0);
    });

    var pymChild = new pym.Child({
        renderCallback: render
        });
    });
    
})
