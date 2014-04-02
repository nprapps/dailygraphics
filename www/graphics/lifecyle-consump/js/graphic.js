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
    var graphic_data_url = 'biglevel2.csv';
	var graphic_data;
d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


function render(width) {


	    var margin = { top: 0, right: 120, bottom:70, left: 70 };
        var width = width - margin.left - margin.right;
        var height = 650 - margin.top - margin.bottom;
    	
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
        
        var xAxis2 = d3.svg.axis().scale(x)
            .orient("top")
            .tickSize(6)
            .ticks(num_x_ticks);

        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .ticks(12);

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
        // y.domain([
        //     d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.indexed; }); }),
        //     2.3
        // ]);
        y.domain([
            0,
            2.3
        ]);


        var rectangle = svg.append("rect")
                            .attr("x", x(51))
                            .attr("y", y(2.2))
                            .attr("width", width/30)
                            .attr("height", height-35)
                            .style('fill',colors["yellow6"]);
        var max = svg.append("rect")
                            .attr("x", x(25))
                            .attr("y", y(1))
                            .attr("width", width)
                            .attr("height", 1)
                            .style('fill',"black");
                    
                            
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
            .attr("transform", function(d) { return "translate(" + x(d.value.age) + "," + y(d.value.indexed) + ")"; })
            .attr("x", 7)
            .attr("dy", ".3em")
            .text(function(d) { return d.name; })
            .style("fill", "#ccc");


        // var labels = d3.select('#graphic').append('ul')
        //     .attr('class', 'labels')
        //     .attr('style', 'width: ' + margin.left + 'px; top: ' + margin.top + 'px;')
        //     .selectAll('li')
        //         .data(quintiles)
        //     .enter().append('li')
        //         .attr('style', function(d,i) {
        //             var s = '';
        //             s += 'width: ' + (margin.left - 5) + 'px; ';
        //             s += 'height: ' + 5 + 'px; ';
        //             s += 'left: ' + 0 + 'px; ';
        //             return s;
        //         })
        //         .attr('class', function(d) { return 'l-' + d.label.replace(/\s+/g, '-').toLowerCase() })
        //         .append('span')
        //             .text(function(d) { return d.label });


      svg.append("text")
                    .attr("class", "y label")
                    .attr("text-anchor", "end")
                    .attr("y", 6)
                    .attr("dy", ".75em")
                    .attr("transform", "rotate(-90)")
                    // .attr('transform', 'translate(' + -width/36 + ',' + height/6 + ') rotate(-90)')
                    .attr('transform', 'translate(' +  -70 + ',' + height/2.3 + ') rotate(-90)')
                    .text("Index, Age 25 = 1")
                    .style("opacity", .7);
      
      svg.append("text")
                    .attr("class", "x label")
                    .attr("text-anchor", "end")
                    .attr("x", 6)
                    .attr("dx", ".75em")
                    // .attr('transform', 'translate(' + -width/36 + ',' + height/6 + ') rotate(-90)')
                    .attr('transform', 'translate(' + width/2 + ' ,' + (49/46)*height + ')')
                    .text("Age")
                    .style("opacity", .7);



        // d3.select(".quint-clothes").style("stroke",colors["yellow1"]).attr("id","personal")
        // d3.select(".quint-jewelry").style("stroke",colors["yellow1"]).attr("id","personal")
        // d3.select(".quint-tailor").style("stroke",colors["yellow1"]).attr("id","personal")
        // d3.select(".quint-health-and-beauty").style("stroke",colors["yellow1"]).attr("id","personal")
        // d3.select(".quint-rent").style("stroke",colors["red4"]).attr("id","rent")
        // d3.select(".quint-food-at-home").style("stroke",colors["blue1"]).attr("id","food")
        // d3.select(".quint-food-away-from-home").style("stroke",colors["blue1"]).attr("id","food")
        // d3.select(".quint-gasoline").style("stroke",colors["orange1"]).attr("id","travel")
        // d3.select(".quint-mass-transit").style("stroke",colors["orange3"]).attr("id","travel")
        // d3.select(".quint-airfare").style("stroke",colors["orange2"]).attr("id","travel")
        // d3.select(".quint-auto-insurance").style("stroke",colors["orange2"]).attr("id","travel")
        // d3.select(".quint-alcohol").style("stroke",colors["blue1"]).attr("id","food")
        // d3.select(".quint-tobacco").style("stroke",colors["blue1"]).attr("id","food")
        // d3.select(".quint-entertainment-and-gambling").style("stroke",colors["teal3"]).attr("id","fun")
        // d3.select(".quint-night-clubs").style("stroke",colors["teal3"]).attr("id","fun")

        // d3.select(".quint-non-durables")
        // 	.style("font-weight","500")
        // 	.style("opacity",1)
        // 	.style('stroke-width',6)
        // 	.style('stroke',"black");


            
        d3.select(".box1").on("click", function() {
            d3.selectAll(".line").style("stroke","#CCC").style("stroke-width","2").style("opacity",".5");
            d3.selectAll(".buttonlabel").style("opacity","0");
            d3.selectAll(".ylabel").style("fill","#ccc").style("opacity",".8");
            d3.selectAll("#all-label").style("opacity","1").style("fill", colors["blue2"]);
            d3.select(".quint-non-durables").style("stroke",colors["blue2"]).style("opacity",".8").style("stroke-width","3").attr("id","personal").moveToFront();
            d3.select(".ylabel.quint-non-durables").style("fill",colors["blue2"]).moveToFront();

        });
              	
        d3.select(".box2").on("click", function() {
            d3.selectAll(".line").style("stroke-width","2").style("stroke","#ccc").style("opacity",".7");
            d3.selectAll(".buttonlabel").style("opacity","0");
            d3.selectAll(".ylabel").style("fill","#ccc").style("opacity",".8");
            d3.selectAll("#personal-label").style("opacity","1").style("fill", colors["yellow3"]).moveToFront();
            d3.select(".quint-clothes").style("stroke",colors["yellow1"]).style("opacity",".8").style("stroke-width","3").attr("id","personal").moveToFront();
            d3.select(".quint-jewerly").style("stroke",colors["yellow4"]).style("opacity",".8").style("stroke-width","3").attr("id","personal").moveToFront();
            d3.select(".quint-tailor").style("stroke",colors["yellow3"]).style("opacity",".8").style("stroke-width","3").attr("id","personal").moveToFront();
            d3.select(".quint-health-and-beauty").style("stroke",colors["yellow2"]).style("opacity",".8").style("stroke-width","3").attr("id","personal").moveToFront();
            d3.select(".ylabel.quint-clothes").style("fill",colors["yellow1"]).style("opacity",".8").moveToFront();
            d3.select(".ylabel.quint-jewerly").style("fill",colors["yellow4"]).style("opacity",".8").moveToFront();
            d3.select(".ylabel.quint-tailor").style("fill",colors["yellow3"]).style("opacity",".8").moveToFront();
            d3.select(".ylabel.quint-health-and-beauty").style("fill",colors["yellow2"]).style("opacity",".8").moveToFront();
// 
        });
        
        d3.select(".box3").on("click", function() {
            d3.selectAll(".line").style("stroke-width","2").style("stroke","#ccc").style("opacity",".7");
            d3.selectAll(".buttonlabel").style("opacity","0");
            d3.selectAll(".ylabel").style("fill","#ccc").style("opacity",".8");
            d3.selectAll("#rent-label").style("opacity","1").style("fill", colors["red4"]).moveToFront();
            d3.select(".quint-rent").style("stroke",colors["red4"]).style("opacity",".8").style("stroke-width","3").attr("id","rent").moveToFront();
            d3.select(".quint-utilities").style("stroke",colors["red2"]).style("opacity",".8").style("stroke-width","3").attr("id","rent").moveToFront();
            d3.select(".ylabel.quint-rent").style("fill",colors["red4"]).style("opacity",".8").moveToFront();
            d3.select(".ylabel.quint-utilities").style("fill",colors["red2"]).style("opacity",".8").moveToFront();
        });

        d3.select(".box4").on("click", function() {
            d3.selectAll(".line").style("stroke-width","2").style("stroke","#ccc").style("opacity",".7");
            d3.selectAll(".buttonlabel").style("opacity","0");
            d3.selectAll(".ylabel").style("fill","#ccc").style("opacity",".8");
            d3.selectAll("#food-label").style("opacity","1").style("fill", colors["orange4"]);
            d3.select(".quint-food-at-home").style("stroke",colors["orange1"]).style("stroke-width", "3").style("opacity",".8").attr("id","food").moveToFront();
            d3.select(".quint-food-away-from-home").style("stroke",colors["orange3"]).style("stroke-width", "3").style("opacity",".8").attr("id","food").moveToFront();
            d3.select(".quint-alcohol").style("stroke",colors["orange2"]).style("stroke-width", "3").style("opacity",".8").attr("id","food").moveToFront();
            d3.select(".quint-tobacco").style("stroke",colors["orange5"]).style("stroke-width", "3").style("opacity",".8").attr("id","food").moveToFront();
            d3.select(".ylabel.quint-food-at-home").style("fill",colors["orange1"]).style("opacity",".8").moveToFront();
            d3.select(".ylabel.quint-food-away-from-home").style("fill",colors["orange3"]).style("opacity",".8").moveToFront();
            d3.select(".ylabel.quint-alcohol").style("fill",colors["orange2"]).style("opacity",".8").moveToFront();
            d3.select(".ylabel.quint-tobacco").style("fill",colors["orange5"]).style("opacity",".8").moveToFront();
        });

        d3.select(".box5").on("click", function() {
            d3.selectAll(".line").style("stroke-width","2").style("stroke","#ccc").style("opacity",".7");
            d3.selectAll(".buttonlabel").style("opacity","0");
            d3.selectAll(".ylabel").style("fill","#ccc").style("opacity",".8");
            d3.selectAll("#transport-label").style("opacity","1").style("fill", colors["blue3"]);;
            d3.select(".quint-gasoline").style("stroke",colors["blue1"]).style("stroke-width", "3").style("opacity",".8").attr("id","travel").moveToFront();
            d3.select(".quint-mass-transit").style("stroke",colors["blue3"]).style("stroke-width", "3").style("opacity",".8").attr("id","travel").moveToFront();
            d3.select(".quint-airfare").style("stroke",colors["blue2"]).style("stroke-width", "3").style("opacity",".8").attr("id","travel").moveToFront();
            d3.select(".quint-auto-insurance").style("stroke",colors["blue4"]).style("stroke-width", "3").style("opacity",".8").attr("id","travel").moveToFront();
            d3.select(".ylabel.quint-gasoline").style("fill",colors["blue1"]).style("opacity",".8").moveToFront();  
            d3.select(".ylabel.quint-mass-transit").style("fill",colors["blue3"]).style("opacity",".8").moveToFront();  
            d3.select(".ylabel.quint-airfare").style("fill",colors["blue2"]).style("opacity",".8").moveToFront();  
            d3.select(".ylabel.quint-auto-insurance").style("fill",colors["blue4"]).style("opacity",".8").moveToFront();  
        });

        d3.select(".box6").on("click", function() {
            d3.selectAll(".line").style("stroke-width","2").style("stroke","#ccc").style("opacity",".7");
            d3.selectAll(".buttonlabel").style("opacity","0");
            d3.selectAll(".ylabel").style("fill","#ccc").style("opacity",".8");
            d3.selectAll("#entertainment-label").style("opacity","1").style("fill", colors["teal3"]);;
            d3.select(".quint-entertainment-and-gambling").style("stroke",colors["teal1"]).style("stroke-width", "3").style("opacity",".8").attr("id","travel").moveToFront();
            d3.select(".quint-night-clubs").style("stroke",colors["teal3"]).style("stroke-width", "3").style("opacity",".8").attr("id","travel").moveToFront();
            d3.select(".ylabel.quint-entertainment-and-gambling").style("fill",colors["teal1"]).style("opacity",".8").moveToFront();  
            d3.select("#entertainment-and-gambling2").style("fill",colors["teal1"]).style("opacity",".8").moveToFront();  
            d3.select(".ylabel.quint-night-clubs").style("fill",colors["teal3"]).style("opacity",".8").moveToFront();  
        });

        // d3.select(".box6").on("click", function() {
        //     d3.selectAll(".line").style("stroke","#CCC").style("stroke-width","3");
        //     d3.select(".quint-gasoline").style("stroke",colors["blue3"]).style("stroke-width", "3").style("opacity",".8").attr("id","travel")
        //     d3.select(".quint-mass-transit").style("stroke",colors["blue3"]).style("stroke-width", "4").attr("id","travel")
        //     d3.select(".quint-airfare").style("stroke",colors["blue3"]).style("stroke-width", "4").attr("id","travel")
        //     d3.select(".quint-auto-insurance").style("stroke",colors["blue3"]).style("stroke-width", "4").attr("id","travel")
        // });

    d3.select(".ylabel.quint-non-durables").style("fill",colors["blue2"]).text("Overall");
    d3.select(".ylabel.quint-rent").text("Housing");
    d3.select(".ylabel.quint-entertainment-and-gambling").text("Sports, Movies");
    d3.select(".ylabel.quint-food-away-from-home").text("Restaurants");
    d3.select(".ylabel.quint-health-and-beauty").text("Gym, Hair Salons");
    d3.select(".ylabel.quint-airfare").text("Plane Tickets");
    d3.select(".ylabel.quint-alcohol").text("Drinking At Home");
    d3.select(".ylabel.quint-night-clubs").text("Bars And Clubs");
    d3.select(".ylabel.quint-food-at-home").attr("dy",".5em")
    
    d3.select(".ylabel.quint-auto-insurance")
                .attr("dy", "-.1em");



    var annotebox = svg.append("text")
                            .attr("x", x(76))
                            .attr("y", y(.96))
                            .attr("id","entertainment-and-gambling2")
                            .attr("class","ylabel")
                            .text("Travel, etc.")
                            .style("fill","#ccc");

    // var annotebox = svg.append("text")
    //                         .attr("x", x(25))
    //                         .attr("y", y(2.25))
    //                         .attr("class","directions")
    //                         .text("Click on the different buttons above to highlight how spending breaks down.")
    //                         .style("font-size","16px");
    var annotebox = svg.append("text")
                            .attr("x", x(54))
                            .attr("y", y(1.9))
                            .attr("class","annote")
                            .text("This is where overall spending"); 

    var annotebox = svg.append("text")
                            .attr("x", x(54))
                            .attr("y", y(1.85))
                            .attr("class","annote")
                            .text("typically peaks in a lifetime.");
    
    var label = svg.append("text")
                            .attr("x", x(27))
                            .attr("y", y(2.1))
                            .attr("class","buttonlabel")
                            .attr("id","all-label")
                            .text("Overall Spending")
                            .style("fill",colors["blue2"]);

    var label = svg.append("text")
                            .attr("x", x(27))
                            .attr("y", y(2.1))
                            .attr("class","buttonlabel")
                            .attr("id","rent-label")
                            .text("Housing")
                            .style("opacity","0");

    var label = svg.append("text")
                            .attr("x", x(27))
                            .attr("y", y(2.1))
                            .attr("class","buttonlabel")
                            .attr("id","personal-label")
                            .text("Personal Spending")
                            .style("opacity","0");

    var label = svg.append("text")
                            .attr("x", x(27))
                            .attr("y", y(2.1))
                            .attr("class","buttonlabel")
                            .attr("id","food-label")
                            .text("Food And Alcohol")
                            .style("opacity","0");
    var label = svg.append("text")
                            .attr("x", x(27))
                            .attr("y", y(2.1))
                            .attr("class","buttonlabel")
                            .attr("id","transport-label")
                            .text("Transportation")
                            .style("opacity","0");
    var label = svg.append("text")
                            .attr("x", x(27))
                            .attr("y", y(2.1))
                            .attr("class","buttonlabel")
                            .attr("id","entertainment-label")
                            .text("Entertainment")
                            .style("opacity","0");

        function rescale() {
            y.domain([0,3]); 
            d3.select(".y.axis")
                    .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(yAxis); 
            d3.select(".grid")
                    .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(y_axis_grid()
                    .tickSize(-width, 0, 0)
                    .tickFormat("")
            );    
 
        }

        function rescale2() {
        // y.domain([
        //     d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.indexed; }); }),
        //     2.1
        // ]);
        y.domain([
            0,
            2.1
        ]);
            d3.select(".y.axis")
                    .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(yAxis); 
            d3.select(".grid")
                    .transition().duration(1500).ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease
                    .call(y_axis_grid()
                    .tickSize(-width, 0, 0)
                    .tickFormat("")
            );    
 
        }
            
        function mouseover(d, i) {
            d3.select(this).style("opacity", "1");
        };

        function mouseout(d, i) {
            d3.select(this).style("opacity", ".8");
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
