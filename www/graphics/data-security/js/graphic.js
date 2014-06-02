var $graphic;
var graphic_aspect_width = 1;
var graphic_aspect_height = 1;
var mobile_threshold = 625;
var pymChild = null;
var col = 12;
var container_width = 600;
var col_width = 10;
var t0 = Date.now();
var moved = 1;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};


var circleSizes = 
 [{ "id": "location",    "x_axis": 75, "y_axis": 300, "speed" : 6, "move": 0, "radius": 50, "stroke" : "#D8472B", "fill" : "#B39429" },
 { "id": "apps",         "x_axis": 75, "y_axis": 300, "speed" : 5, "move": 75, "radius": 50, "stroke" : "#E27560", "fill" : "#EFC637"},
 { "id": "web services", "x_axis": 75, "y_axis": 300, "speed" : 4, "move": 150, "radius": 50, "stroke" : "#ECA395", "fill" : "#F3D469"},
 { "id": "Vestibulum",        "x_axis": 75, "y_axis": 300, "speed" : 1, "move": 225, "radius": 50, "stroke" : "#F5D1CA", "fill" : "#F7E39B"}];

function getRand(min, max) {
  return Math.random() * (max - min) + min;
}
/*
 * Render the graphic
 */
function draw_graphic(width) {
    
render_chart();

}

function render_chart() {
    // var graphic_data = data;
    var is_mobile = false;
    // var last_data_point = graphic_data.length - 1;
    var margin = { top: 3, right: 3, bottom: 3, left: 3 };
    var num_ticks = 5;
    var width = container_width;

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
        width = Math.floor(((width - 11)) - margin.left - margin.right);
//        width = width - margin.left - margin.right;
    } else {
        width = Math.floor(((width - 44)) - margin.left - margin.right);
    }

    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;


var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);
x.domain([0, 400]);
y.domain([0, 400]);


var svg = d3.select('#graphic')
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", "2000px")
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var circles = svg.selectAll("circle")
                        .data(circleSizes)
                        .enter()
                        .append("circle")
                        .attr('class','circle');


                    circles
                       .attr("cx", function (d) { return x(d.x_axis); })
                       .attr("cy", function (d) { return y(d.y_axis); })
                       .attr("r", function (d) { return d.radius; })
                       .style("fill", function(d) { return d.fill; })
                       // .style("stroke", function(d) { return d.stroke; })
                       .on("click",clicked);


var signalcase = svg.selectAll("signalcase")
                        .data(circleSizes)
                        .enter()
                        .append("g")
                        .attr('class','signalcase');


var signals  = signalcase.append("circle")
                       .attr('class','signals')                    
                       .attr("cx", function (d) { return x(d.x_axis); })
                       .attr("cy", function (d) { return y(d.y_axis); })
                       .attr("r", function (d) { return d.radius; });

var header = svg.append('text')
             .attr('class','header')
             .attr("x", x(5))
             .attr("y", y(350))
             .text("How Your Phone Sends Unencrypted Data");

var how = signalcase.append("text")
            .attr('class',"signal-labels")
            // .attr("transform", function(d) { return "translate(" + x(d.x_axis) + "," + y(d.y_axis) + ")"; })
            .attr("x", function (d) { return x(d.x_axis); })
            .attr("y", y(269))
            .attr("dy", ".15em")
            .text(function(d) { return d.id; })
            .style("opacity", 0);             

    circles
    .transition()
    .duration(400)
    .attr('cy', function (d) { return y(d.y_axis - d.move); });    
    signals
    .transition()
    .duration(400)
    .attr('cy', function (d) { return y(d.y_axis - d.move); });
    d3.selectAll(".signal-labels")
    .transition()
    .duration(400)
    .attr('y', function (d) { return y(d.y_axis - d.move); })
    .style('opacity',"1");

    
    d3.select(".section1")
    .style('visibility',"visibile");


function clicked(d) {
   circles
    .transition()
    .duration(150)   
    .style('opacity', '0');    
    signals
    .transition()
    .duration(150)
    .style('opacity', '0');    
    d3.selectAll(".signal-labels")
    .transition()
    .duration(150)
    .style('opacity', '0'); 
    // .style('opacity',"1");
    d3.selectAll('#section2')
    .transition()
    .duration(150)
    .style('visibility', 'visible'); 



// this.select
// find id and text    

}                       


var centerx = x(200);
var centery = y(200);


console.log(Date.now());

var count = 0;

d3.timer(function() {
    ++count;
    svg.selectAll(".signals")
    .attr("r", function(d) {return count % d.radius;});


});


// var boxViewTemplate = d3.select(".box-view").remove().node(),
//     boxView = d3.select("#graphic").selectAll(".box-view"),
//     box = boxView.select(".box");

// var output = d3.select("output"),
//     input = d3.select("input").on("change", changed).each(changed),
//     count = 0;


// d3.timer(function() {
//   ++count;

//   circles
//       .attr("dx", Math.sin(count / 10) * 10 + "px")
//       .attr("dy", Math.cos(count / 10) * 10 + "px")
//       .style("background-color", "rgb(0,0," + count % 255 + ")")
//       .text(count % 100)
// });

// function changed() {
//   var n = +this.value;
//   output.text(n);
//   boxView = boxView.data(d3.range(n));
//   boxView.exit().remove();
//   boxView.enter().append(function() { return boxViewTemplate.cloneNode(true); });
//   box = boxView.select(".box");

// }

// function clicked() {
//      what = $('#graphic .box').length
//      for (i <= what) {
//         if (i%7)
//      }

//  }

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
        // setup pym
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    } else {
        pymChild = new pym.Child();
    }
})
