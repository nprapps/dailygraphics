
var graphic_aspect_width = 3;
var graphic_aspect_height = 6;
var mobile_threshold = 625;
var pymChild = null;


// var colors = {
//     ['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
//     '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
//      '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
//      '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
//      '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']
// };

var $graphic = $('#graphic');
    var graphic_data_url = 'grad-level2.csv';
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
        var formatPercent =  d3.format(".0%");



        // var color = d3.scale.category20();
        var color = d3.scale.ordinal()
                     .range(['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
                    '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
                    '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
                    '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
                    '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']); // colors

        var svg = d3.select("#graphic")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(5)
            .ticks(num_x_ticks);     

        var xAxis_top = d3.svg.axis()
            .scale(x)
            .orient("top")
            .tickSize(5)
            .ticks(num_x_ticks);

        var x_axis_grid = function() { return xAxis; };

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .tickSize(10)
            .tickFormat(formatPercent);

        var area = d3.svg.area()
            .x(function(d) { return x(d.yr); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });

        var stack = d3.layout.stack()
            .values(function(d) { return d.values; });

        var y_axis_grid = function() { return yAxis; };

        var bodyNode = d3.select('body');
        // var absoluteMousePos = d3.mouse(bodyNode);

        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("visibility", "hidden");
            // .style("top", "30px")
            // .style("left", "55px");

              // tooltip.style({
              //           left: (absoluteMousePos[0] + 5)+'px',
              //           top: (absoluteMousePos[1]) + 'px',
              //           'background-color': '#d8d5e4',
              //           width: '65px',
              //           height: '30px',
              //           padding: '5px',
              //           position: 'absolute',
              //           'z-index': 1001,
              //           'box-shadow': '0 1px 2px 0 #656565'
              //       });
         

        // gives each header a color
        color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== "yr"; }));

        // mapping data from csv file
        // maps into color domain
        var quintiles = stack(color.domain().map(function(name) {
            return {
                name: name,
                values: graphic_data.map(function(d) {
                    return {yr: d.yr, y: +d[name]};
                })
            };
        }));


        // Scale the range of the data
        x.domain(d3.extent(graphic_data, function(d) { return d3.round(d.yr); }));
        // y.domain([
        //     d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.indexed; }); }),
        //     d3.max(quintiles, function(c) { return d3.max(c.values, function(v) { return v.indexed; }); })
        // ]);

                            
        var quint = svg.selectAll(".quint")
            .data(quintiles)
            .enter().append("g")
            .attr("class", "quint");

        quint.append("path")
            .attr('class','layer')
            .attr('id', function(d) { 
                // return  d.indexOf})
                return  d.name})
            .attr("d", function(d) { return area(d.values); })
            .style("fill", function(d) { return color(d.name); })
            .style("opacity", "1")
            .on("mouseover",mouseover)
            .on("mouseout", mouseout);


        svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            // .attr("transform", "translate(0,0)")
            .call(xAxis_top);
    
        svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .attr("transform", "translate("+-width/100+",0)")
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
            .attr("transform", function(d) { return "translate(" + x(d.value.yr) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
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
                    .attr('transform', 'translate(' +  -70 + ',' + height/2.3 + ') rotate(-90)')
                    .text("Share")
                    .style("opacity", .7);


        // var div = svg.append("div")
        //     .attr("class", "tooltip")           
        //     .style("opacity", 0);

// console.log(quintiles);

  quint.selectAll(".layer")
    .data(quintiles)
    .on("mousemove", function(d, i) {
      mousex = d3.mouse(this);
      mousex = mousex[0];
      var invertedx = x.invert(mousex);
      // console.log(mousex);
      var what = d3.select(this).attr("id");
      // var test = 1;
        // console.log(quintiles.length);
        for (var i=0; i<quintiles.length; i++) {

            if(quintiles[i].name==what) {
                var test = quintiles[i].values;
            }
        };



      // console.log("this is " + what)
      var selected = (d);
      // console.log(quintiles);
      // console.log(quintiles.name)
      date = Math.round(invertedx);
      num = date-1971
      // console.log(test);
      // console.log("num is :" + num)
      pro = Math.round(d[name]);

      // console.log(test[num].yr);
      var shareVal = (test[num].y*100);
      var mouseDate = test[num].yr;
      var degree = test[num]

      ////////////////////////////////////////
      // To Do
      // ASK Chris how to extract name in attribute from what
      // var what = d3.select(this).attr("id");

      // console.log(quintiles);
      // console.log(quintiles[1].name);

      // Also need a tooltip

      ////////////////////////////////////////
      // console.log(d.values[num].y);
      // shareVal = (d.values[num].y-d.values[num].y0)*100
      // console.log(y(shareVal.y0 + shareVal.y / 2))

      d3.select(this)
      .classed("hover", true)
      .attr("stroke", "black")
      .attr("stroke-width", "0.5px"); 
      tooltip
        .html( "<h5> Year: " + mouseDate + "<br> Share Of Total Graduates: " + shareVal.toFixed(2) + "%<h5>" )
        // .html( "<h5> " + what + "<br> Year: " + mouseDate + "<br> Share Of Total Graduates: " + shareVal.toFixed(2) + "%<h5>" )
        .style("top", (d3.event.pageY - 6) + "px")
        // .style("top", y(test[num].y0 + test[num].y / 1.8) + "px")
        .style("left", (d3.event.pageX - 6) + "px")
        .style("visibility", "visible");


    })


    function smallGraph(d,i) {
        $graphic.empty();


    }

        
        function mouseover(d, i) {
            d3.selectAll(".layer")
            .transition()
            .duration(200)
            .style("opacity", ".6")
            d3.select(this)
            .transition()
            .duration(200)
            .style("opacity", "1")
            .style("stroke", "#3D352A")
            .style("stroke-width", "1");
            var testname = d3.select(this).attr("id");
            testname = String('.quint-' + testname.replace(/\s+/g, '-').toLowerCase());
            // console.log(testname);
            d3.select(testname)
            .transition()
            .duration(200)
            .style("font-size","14px")
            .style("fill","black")
            .style("opacity",".7");

        }

        function mouseout(d, i) {
            d3.selectAll(".layer")
            .transition()
            .duration(200)
            .style("opacity", ".8")
            .style("stroke", "null");
            d3.selectAll(".ylabel")
            .style("font-size","12px")
            .style("fill","#ccc");
            d3.select(".tooltip")
            .style("visibility", "hidden");





        }
    
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
        d.yr = +d.yr;
    });

    var pymChild = new pym.Child({
        renderCallback: render
        });
    });
    
})
