$(document).ready(function() {
    var colors = {
        'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
        'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
        'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
        'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
        'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
    };

	var $graphic = $('#graphic');
    var graphic_data_url = 'mtcars.csv';
	var graphic_data;

    function loadData() {
        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;

           graphic_data.forEach(function(d) {
           		// d = +d
                d.mpg = +d.mpg;
                d.cyl = +d.cyl;
                d.disp = +d.disp;
                d.hp = +d.hp;
                d.drat = +d.drat;
	           console.log(d)

            });

            drawGraphic();
            $(window).on('resize', onResize);
        });
    }

    function drawGraphic() {
        var margin = {top: 0, right: 100, bottom: 20, left: 50};
//        var width = $(top).width() - margin.left - margin.right;
        var width = $graphic.width() - margin.left - margin.right;
        var height = 350 - margin.top - margin.bottom;
    
        var num_x_ticks = 8;
        if (width <= 480) {
            num_x_ticks = 4;
        }

        // clear out existing graphics
        $graphic.empty();

        var color = d3.scale.ordinal()
        .range(["#D8472B", "#17807E", "#51AADE", "#EFC637", "#E38D2C", "#E27560", "#981E24"]); // colors

        var xVal = function(d) { return d.date;};
        var x = d3.scale.linear().range([0, width]);
		var xMap = function(d) { return x(xVal(d));}; 

		var yVal = function(d) { return d.income;};
        var y = d3.scale.linear().range([height, 0]);
	    var yMap = function(d) { return y(yVal(d));}; // data -> display

        // var xValue = function(d) { return d.Calories;}
        // var xMap = function(d) { return x(xValue(d));}, // data -> display


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


        color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== "date"; }));


        // mapping data from csv file
        // maps into color domain
        var quintiles = color.domain().map(function(name) {
            return {
                name: name,
                values: graphic_data.map(function(d) {
                    return {date: d.mpg, income: +d[name]};
                })
            };

          	
            // console.log(function(d) { return x(d.date); });  

        });

		console.log(quintiles);

        var quint = svg.selectAll(".quint")
            .data(quintiles)
            .enter().append("g")
            .attr("class", "quint");

        quint.append("path")
            .attr('class', function(d) { 
                return 'dot quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
            })
			.attr("r", 3.5)
			.attr("cx", xMap)
			.attr("cy", yMap)
	        .style("opacity", .7)
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
    
        svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .call(yAxis);
    
        svg.append("g")         
            .attr("class", "y grid")
            .call(y_axis_grid()
                .tickSize(-width, 0, 0)
                .tickFormat("")
            );


        sendHeightToParent();

        // function to highlight lines: http://bl.ocks.org/AlexanderGraf/5416979#indfundbyregbytime.js
        function mouseover(d, i) {
            d3.select(this).style("opacity", "1");
        };

        function mouseout(d, i) {
            d3.select(this).style("opacity", ".3");
        };
    }

    function onResize() {
        drawGraphic();
    }
    
    function setup() {
    setupResponsiveChild();

      if (Modernizr.svg) {
            loadData();
        }
    }

    setup();

})














