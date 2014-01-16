$(document).ready(function() {
	var $graphic = $('#graphic');
	var graphic_data;
    var parseDate = d3.time.format("%m/%d/%y").parse; // parsing date data
    var formatTime = d3.time.format("%B %Y"); // display date format 
	
    function loadData() {
        d3.csv("quits2.csv", function(error, data) {
            graphic_data = data;

            graphic_data.forEach(function(d) {
                d.date = parseDate(d.date);
            });

            drawGraphic();
            $(window).on('resize', onResize);
        });
    }

    function drawGraphic() {
        console.log('drawGraphic');

        var margin = {top: 0, right: 10, bottom: 20, left: 20};
        var width = $graphic.width() - margin.left - margin.right;
        var height = 350 - margin.top - margin.bottom;
    
        var num_x_ticks = 20;
        if (width <= 480) {
            num_x_ticks = 8;
        }

        // clear out existing graphics
        $graphic.empty();

        var x = d3.time.scale().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);

        var color = d3.scale.category10();
        
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
        //     .x(function(d) { return x(d.date); })
        //     .y(function(d) { return y(d.close); });

        var line = d3.svg.line()
            .interpolate("basis")
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.income); });


        // finds the first header that is not 'date' 
        // gives each header a color
        color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== "date"; }));

        // mapping data from csv file
        // maps into color domain
        var quintiles = color.domain().map(function(name) {
            return {
                name: name,
                values: graphic_data.map(function(d) {
                    return {date: d.date, income: +d[name]};
                })
            };
        });

        // Scale the range of the data
        x.domain(d3.extent(graphic_data, function(d) { return d.date; }));
        y.domain([
            d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.income; }); }),
            d3.max(quintiles, function(c) { return d3.max(c.values, function(v) { return v.income; }); })
        ]);

        var quint = svg.selectAll(".quint")
            .data(quintiles)
            .enter().append("g")
            .attr("class", "quint");

        quint.append("path")
            .attr("class", "line")
            .style("opacity", .3)
            .attr("d", function(d) { return line(d.values); })
            .style("stroke", function(d) { return color(d.name); })
            .on("mouseover", mouseover)
            .on("mouseout", mouseout);

        svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    
        svg.append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(x_axis_grid()
                .tickSize(-height, 0, 0)
                .tickFormat('')
            );

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
});