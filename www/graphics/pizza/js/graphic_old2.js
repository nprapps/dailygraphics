var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
	var $graphic = $('#graphic');
    var graphic_data_url = 'pizza_m.csv';
	var graphic_data;

    function drawGraphic(width) {
        var margin = {top: 0, right: 100, bottom: 40, left: 50};
        var width = width - margin.left - margin.right;
        var height = 1000 - margin.top - margin.bottom;
    
        var num_x_ticks = 10;
        if (width <= 480) {
            num_x_ticks = 4;
        }


	  // xScale.domain([d3.min(data, xVal)-1, d3.max(data, xVal)+1]);
	  // yScale .domain([d3.min(data, yVal)-1, d3.max(data, yVal)+1]);

        // clear out existing graphics
        $graphic.empty();

        var width1 = width
        var height1 = 3*height/4

        var width2 = width
        var height2 = 7*height/8

        var xVal = function(d) { return d.size;};
        var x = d3.scale.linear().range([0, width])
        		.domain([d3.min(graphic_data, xVal)-1, d3.max(graphic_data, xVal)+1]);;
		var xMap = function(d) { return x(xVal(d));}; 

		var yVal = function(d) { return d.value;};
        var y = d3.scale.linear().range([height1, 0])
        		.domain([0,.6]);
	    var yMap = function(d) { return y(yVal(d));}; // data -> display



	    var svg = d3.select("#graphic")
                .append("svg")
                    .attr("width", width1 + margin.left + margin.right)
                    .attr("height", height1 + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var svg2 = d3.select("#graphic")
                    .append("svg")
                        .attr("width", width2 + margin.left + margin.right)
                        .attr("height", height2 + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");



        // var xAxis = d3.svg.axis()
        // 	.scale(x)
        //     .orient("bottom")
        //     .tickSize(6)
        //     .ticks(num_x_ticks);

        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .ticks(7);

        var y_axis_grid = function() { return yAxis; }

// Scale Tooltip begin

var jsonCircles = [
  { "x_axis": 30, "y_axis": 30, "radius": 20, "color" : "green" },
  { "x_axis": 70, "y_axis": 70, "radius": 20, "color" : "purple"},
  { "x_axis": 110, "y_axis": 100, "radius": 20, "color" : "red"}];
 
// make pizza
        var color = d3.scale.category10();
        var pie = d3.layout.pie();

        var piedata = []
        var rr = []
        var sqinch = []
        var brush = d3.svg.brush()
            .x(x)
            .extent([0, 0])
            .on("brush", brushed);
            
        svg.append("g")
            .attr("class", "x axis brush")
            .attr("transform", "translate(0," + height1 + ")")
            .call(d3.svg.axis()
              .scale(x)
              .orient("bottom")
              .tickSize(6)
              .tickPadding(12))
          .select(".domain")
          .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
            .attr("class", "halo");


        var slider = svg.append("g")
            .attr("class", "slider")
            .call(brush);

        slider.selectAll(".extent,.resize")
            .remove();

        slider.select(".background")
            .attr("height", height1);



//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////
// arc
//////////////////////////////////////////////////////////////////
// var dataset = [ 5,25 ];
// // var w = 300;
// // var h = 300;

// var outerRadius = width / 4;
// var innerRadius = 0;
// var arc = d3.svg.arc()
//                 .innerRadius(innerRadius)
//                 .outerRadius(outerRadius);


//         var pie = d3.layout.pie();
//         var arcs = svg.selectAll("g.arc")
//         .data(pie(dataset))
//         .enter()
//         .append("g")
//         .attr("class", "arc");

//         arcs.append("path")
//         .attr("fill", function(d, i) {
//             return color(i);
//         })
//         .attr("d", arc)
//         .attr("transform", "translate(" + width/4 + ", " + height/4 + ")");
//////////////////////////////////////////////////////////////////

// var arc = d3.svg.arc()
// .innerRadius(50)
// .outerRadius(100)
// .startAngle(0)
// .endAngle(1.5*Math.PI);

// svg.append("path")
// .attr("d", arc)
// .attr("transform", "translate(300,200)");

// - See more at: http://schoolofdata.org/2013/10/01/pie-and-donut-charts-in-d3-js/#sthash.oEs21fYm.dpuf
// - See more at: http://schoolofdata.org/2013/10/01/pie-and-donut-charts-in-d3-js/#sthash.KsHA33CQ.dpuf



//////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////

// code for slider
//////////////////////////////////////////////////////////////////

        var pizza = svg2.append("circle")
                    .attr("class", "pizza")
                    .attr("transform", "translate(20" + "," + height2/4 + ")")
                    .attr("r", 20)
                    .style('opacity', .7);


        var handle = slider.append("circle")
            .attr("class", "handle")
            .attr("transform", "translate(0," + height1 + ")")
            .attr("r", 20);

        slider
            .call(brush.event)
          // .transition() // gratuitous intro!
            // .duration(750)
            .call(brush.extent([6, 6]))
            .call(brush.event);

        function brushed() {
          var value = brush.extent()[0];
          // console.log(value);

          if (d3.event.sourceEvent) { // not a programmatic event
            value = x.invert(d3.mouse(this)[0]);
            brush.extent([value, value]);
          }

          handle.attr("cx", x(value));


          svg2.selectAll(".pizza")
                .style("fill", d3.hsl(value*(3/2), .8, .8))
                .attr("r", pies(value)); // attribute = radius
                // .attr("r", value);

          var sqinch = [];  
          // $(".arcpie").remove();
          $(".arcpie").remove();
          $(".pies").remove();
          arc(value); 


          // console.log(value);
        }
//////////////////////////////////////////////////////////////////
function pies(d) { 
    // make multiple pies
    var rr = 10*(d/2);
    // counts the area
    // if (sqinch>(Math.pow(4,2)*Math.PI)) {
    // take the mod and remainder
    // call circle of that size
    // then make something of the remainder
    // piedata = [sqinch_b, sqinch];
    // piedata.push(sqinch_b);

    // console.log(piedata);
    // arc data
    // arc(d);   
    return rr;
                }

function arc(diam) {

// base case = 6 in pizza
// radius in graphic = 27 px == scale 3x
    var sqinch_max = 9*Math.PI;
    var sqinch_val = Math.pow((diam/2),2)*Math.PI;
    var sqinch_norm = 2*(sqinch_val/sqinch_max);
    var arc_all = d3.svg.arc()
        .innerRadius(0)
        .outerRadius(27)
        .startAngle(0)
        .endAngle(sqinch_norm*Math.PI);

piedata2 = [];
piecount2 = Math.floor(sqinch_val/sqinch_max);
piedata = [];
piecount = Math.floor(sqinch_val/sqinch_max);


var arc_array = [1];

for (var i =1; i<piecount; i++)
{
    var count = 1;
    piedata.push(count);
}

    
console.log('piedata');
console.log(piedata);

for (var i =1; i<=piedata.length; i++) {
     arc_array[i] = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(27)
    .startAngle(0)
    .endAngle(sqinch_norm*Math.PI);

    svg2.data(piedata)
    .enter().append("path")
    .attr("class", "arcpie")
    .attr("d", arc[i])
    .attr("transform", "translate(300,200)")
    .style("opacity", sqinch_val/sqinch_max)
    .style("fill", "#CCC");   
}

console.log("arc_array");
console.log(arc_array);
///////////////////////////////////////////////////////////////////////////

for (var i =1; i<piecount; i++)
{
    var count = i;
    piedata.push(count);
}


svg.selectAll("pies")
.data(piedata)
.enter().append('circle')
.attr("class", "pies")
.attr('r', 27)
.attr('cx', function(d) {return d*50})
.style("fill","#FBF1CD")
.attr("transform", "translate(500" + "," + height2/2 + ")");


///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
    // console.log(sqinch_norm);
    // var arc = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle(sqinch_norm*Math.PI);

    //  var arc2 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-2)*Math.PI);
    //  var arc3 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-4)*Math.PI);
    //  var arc4 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-6)*Math.PI);
    //  var arc5 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-8)*Math.PI);
    //  var arc6 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-10)*Math.PI);
    //  var arc7 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-12)*Math.PI);
    //  var arc8 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-14)*Math.PI);
    //  var arc9 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-16)*Math.PI);
    //  var arc10 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-18)*Math.PI);
    //  var arc11 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-20)*Math.PI);
    //  var arc12 = d3.svg.arc()
    // .innerRadius(0)
    // .outerRadius(27)
    // .startAngle(0)
    // .endAngle((sqinch_norm-22)*Math.PI);

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

//     svg2.append("path")
//     .attr("class", "arcpie")
//     .attr("d", arc)
//       // .transition()
//       // .duration(50)
//     // .ease("quad")
//     // .attr("transform", "translate("  + width + " ," + height+ ")")
//     .attr("transform", "translate(250,200)")
//     .style("opacity", sqinch_val/sqinch_max)
//     .style("fill", "#CCC");

    


//     if (sqinch_norm > 2) {
//         // console.log("hey");
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc2)
//         .attr("transform", "translate(300,200)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 4) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc3)
//         .attr("transform", "translate(350,200)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }



//     if (sqinch_norm > 6) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc4)
//         .attr("transform", "translate(400,200)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 8) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc5)
//         .attr("transform", "translate(450,200)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 10) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc6)
//         .attr("transform", "translate(500,200)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 12) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc7)
//         .attr("transform", "translate(250,250)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 14) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc8)
//         .attr("transform", "translate(300,250)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 16) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc9)
//         .attr("transform", "translate(350,250)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 18) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc10)
//         .attr("transform", "translate(400,250)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 20) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc11)
//         .attr("transform", "translate(450,250)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }

//     if (sqinch_norm > 22) {
        
//         svg2.append("path")
//         .attr("class", "arcpie")
//         .attr("d", arc12)
//         .attr("transform", "translate(500,250)")
//         .style("opacity", sqinch_val/sqinch_max)
//         .style("fill", "#CCC");


//     }


}

///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////

// function arc(data) {
//     var outerRadius = width / 20;
//     var innerRadius = 0;
//     var arc = d3.svg.arc()
//                 .innerRadius(innerRadius)
//                 .outerRadius(outerRadius);


//         var pie = d3.layout.pie();
//         var arcs = svg.selectAll("g.arc")
//         .data(pie(data))
//         .enter()
//         .append("g")
//         .attr("class", "arc");

//         arcs.append("path")
//         .attr("fill", function(d, i) {
//             return color(i);
//         })
//         .attr("d", arc)
//         .attr("transform", "translate(" + width/2 + ", " + height/4 + ")");

// }

//////////////////////////////////////////////////////////////////

// Tooltip end

        // color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== "size"; }));


        // mapping data from csv file
        // maps into color domain
        // var quintiles = color.domain().map(function(name) {
        //     return {
        //         name: name,
        //         values: graphic_data.map(function(d) {
        //             return {date: d.size, income: +d[name]};
        //         })
        //     };

          	
        //     // console.log(function(d) { return x(d.date); });  

        // });

		// console.log(quintiles);

  // var svg = d3.select('#graphic').append('svg')
  //           .attr('width', width + margin.left + margin.right)
  //           .attr('height', height + margin.top + margin.bottom)
  //           .append('g')
  //           .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
       
        // var quint = svg.selectAll(".quint")
        //     .data(graphic_data)
        //     .enter().append("g")

////////////////////////////////////////////
// scatter starts here
////////////////////////////////////////////
        svg.attr('class', 'scatter')
	        .selectAll('circle')
	            .data(graphic_data)
	        .enter().append('circle')
                .filter(function(d) { return d.variable == "one_pxin" })        // <== This line
                .attr('class', function(d) { return d.variable})				
                .attr("r", 7)
				.attr("cx", xMap)
				.attr("cy", yMap);
                // .style("color", "#666")



    d3.select('#toppings1')
        .on("click", dostuff); 

        // {
        // svg.selectAll("one_pxin")                               
        // .style("fill", "red")                            // <== and this one
        // .attr("r", 12)});


////////////////////////////////////////////
////////////////////////////////////////////                

        // svg.attr('class', 'scatter_two')
        //     .selectAll('circle')
        //         .data(graphic_data)
        //     .enter().append('circle')
        //         .attr('class', "circle")
        //         .attr("r", 3.5)
        //         .attr("cx", xMap2)
        //         .attr("cy", yMap2)
        //         .style("color", "#F00");

        // svg.attr('class', 'scatter_three')
        //     .selectAll('circle')
        //         .data(graphic_data)
        //     .enter().append('circle')
        //         .attr('class', "circle")
        //         .attr("r", 3.5)
        //         .attr("cx", xMap3)
        //         .attr("cy", yMap3)
        //         .style("color", "#666");

        // svg.attr('class', 'scatter_four')
        //     .selectAll('circle')
        //         .data(graphic_data)
        //     .enter().append('circle')
        //         .attr('class', "circle")
        //         .attr("r", 3.5)
        //         .attr("cx", xMap4)
        //         .attr("cy", yMap4)
        //         .style("color", "#666");                

                // .style("fill", "#666");
		        // .style("opacity", 1);
	            // .style("stroke", function(d) { 
            //     if (d.name.toLowerCase() == 'all industries') {
            //         return '#333';
            //     } else {
            //         return color(d.name);
            //     }
            // });

        // svg.append("g") // Add the X Axis
        //     .attr("class", "x axis")
        //     .attr("transform", "translate(0," + height + ")")
        //     .call(xAxis);
    
        svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .call(yAxis);
    
        svg.append("g")         
            .attr("class", "y grid")
            .call(y_axis_grid()
                .tickSize(-width1, 0, 0)
                .tickFormat("")
            );

   
        // function to highlight lines: http://bl.ocks.org/AlexanderGraf/5416979#indfundbyregbytime.js
  

        // update responsive iframe
        sendHeightToParent();
    }

        function mouseover(d, i) {
            d3.select(this).style("opacity", "1");
        };

        function mouseout(d, i) {
            d3.select(this).style("opacity", ".3");
        };

        function dostuff() 
        {
            console.log("fuck"); //considering dot has a title attribute
        }

    function setup() {
        if (Modernizr.svg) {
            d3.csv(graphic_data_url, function(error, data) {
                graphic_data = data;

                graphic_data.forEach(function(d) {
                    // d = +d
                    d.size = +d.size;
                    d.value = +d.value;
                    d.variable = d.variable;
                    // d.three_pxin = +d.three_pxin;
                    // d.four_pxin = +d.four_pxin;
                    // d.disp = +d.disp;
                    // d.hp = +d.hp;
                    // d.drat = +d.drat;
                    // console.log(d.size)
                    // console.log(d.value)
                });
                console.log(graphic_data);
                setupResponsiveChild({
                    renderCallback: drawGraphic 
                });
            });
        }
    }

    setup();

})