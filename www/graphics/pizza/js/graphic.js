    var colors = {
        'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
        'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
        'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
        'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
        'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
    };

    book = inputspan;

    /*
     * NB: Use window.load instead of document.ready
     * to ensure all images have loaded
     

    Build 
    regression line
    field to enter data
    calculator + point on graphic




     */
    $(window).load(function() {
    	var $graphic = $('#graphic');
        var graphic_data_url = 'pizza_m.csv';
        var graphic_data_url2 = 'fittedvals_deep_all.csv';
        var graphic_data_url3 = 'fittedvals_regular_all.csv';
        var graphic_data_url4 = 'fittedvals_stuffed_all.csv';
        var graphic_data_url5 = 'fittedvals_thin_all.csv';
    	var graphic_data;
        var graphic_data2;
        var graphic_data3;
        var graphic_data4;
        var graphic_data5;


        function drawGraphic(width,book) {

    // function to move stuff to front
          d3.selection.prototype.moveToFront = function() {
              return this.each(function(){
                this.parentNode.appendChild(this);
              });
            };

            var margin = {top: 100, right: 20, bottom: 40, left: 60};
            var margin2 = {top: 100, right: 20, bottom: 40, left: 0};
            var width = width - margin.left ;
            var height = 1000 - margin.top - margin.bottom;
        
            var num_x_ticks = 20;
            if (width <= 480) {
                num_x_ticks = 5;
            }


            bookltext = book;

            // bookltext = book.toLowerCase();



    	  // xScale.domain([d3.min(data, xVal)-1, d3.max(data, xVal)+1]);
    	  // yScale .domain([d3.min(data, yVal)-1, d3.max(data, yVal)+1]);

            // clear out existing graphics
            $graphic.empty();

            var width1 = 4*width/8
            var height1 = 2*height/3

            var width2 = 5*width/16
            var height2 = 2*height/3

            var xVal = function(d) { return d.size;};
            var x = d3.scale.linear().range([0, width1])
            		.domain([d3.min(graphic_data, xVal)-1, 30])
                    .clamp(true);

    		var xMap = function(d) { return x(xVal(d));}; 

    		var yVal = function(d) { return d.px_inc;};
            var y = d3.scale.linear().range([height1, 0])
            		.domain([0,.5]);
    	    var yMap = function(d) { return y(yVal(d));}; // data -> display


    	    var svg = d3.select("#graphic")
                    .append("svg")
                    .attr("class", "svg1")
                        .attr("width", width1 + margin.left+ margin.right )
                        .attr("height", height1 + margin.top + margin.bottom)
                    .append("g")
                        .attr("transform", "translate(" + margin.left + ",20)");

            var svg2 = d3.select("#graphic")
                        .append("svg")
                        .attr("class", "svg2")
                            .attr("width", width2 )
                        .attr("height", height2 + margin.top + margin.bottom)
                        .append("g")
                        .attr("transform", "translate( 0 ,20)");


            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom")
                .tickSize(10)
                .ticks(num_x_ticks);


            var x_axis_grid = function() { return xAxis; }

            var yAxis = d3.svg.axis()
                .orient("left")
                .scale(y)
                .ticks(10);

            var y_axis_grid = function() { return yAxis; }

// fitlines
            var line = d3.svg.line()
                .x(function(d) { return x(d.size); })
                .y(function(d) { return y(d.fitted); });
// .interpolate("basis")
// 

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
    //////////////////////////////////1////////////////////////////////
    // init for labels
    //////////////////////////////////////////////////////////////////
            var equal1x = width1*(1/30);
            var equal1y = height1*(9/30);
            var equal2x = width1*(1/30);
            var equal2y = height1*(21/30);
            var label1x = width1*(1/30);
            var label1y = 0;
            var label2x = width1*(1/30);
            var label2y = height2*(11/30);
            var label3x = width1*(1/30);
            var label3y = height2*(23/30);
            var bigpricex = width1*(1/30);
            var bigpricey = height2*(2/30);
            var midpricex = width1*(1/30);
            var midpricey = height2*(12/30);
            var smallpricex = width1*(1/30);
            var smallpricey = height2*(24/30);
            var scalef = width/250;
            var pizzax = 2.5*width/20;
            var pizza = svg2.append("circle")
                        .attr("class", "pizza")
                        .attr("transform", "translate(" + pizzax + " , 70)")
                        .attr("r", 20)
                        .style('opacity', .7);
    //////////////////////////////////////////////////////////////////
    //////////////////////////////////1////////////////////////////////
    // code for slider
    //////////////////////////////////////////////////////////////////

            var handle2 = slider.append("rect") 
              // .attr("y", function() { return height - y(.4); })
              .attr("class", "handle2")
              .attr("height", height)
              .attr("width", width/200)
              .attr("fill", "#ccc")
              .style("opacity", .4);
              // .attr("transform", "translate(0," + height1 + ")");



            var handle = slider.append("circle")
                .attr("class", "handle")
                .attr("transform", "translate(0," + height1 + ")")
                .attr("r", width/50)
                .style("stroke", "gray")
                // .attr("fill", "#ccc")
                .style("opacity", .4);


// labels
            var labelvarpizza = svg2.append("text")
            .attr("x", 0)
            .attr("y", height2*(3/5))

            var bigprice = svg2.append("text")
                        .attr("class", "prices")
                        .attr("x", bigpricex)
                        .attr("y", bigpricey);
            var midprice = svg2.append("text")
                        .attr("class", "prices")
                        .attr("x", midpricex)
                        .attr("y", midpricey);
            var smallprice = svg2.append("text")
                        .attr("class", "prices")
                        .attr("x", smallpricex)
                        .attr("y", smallpricey);
            var bigpizza = svg2.append("text")
                        .attr("class", "pizzalabels")
                        .attr("x", label1x)
                        .attr("y", label1y);
            var midpizza = svg2.append("text")
                        .attr("class", "pizzalabels")
                        .attr("x", label2x)
                        .attr("y", label2y);
            var smallpizza = svg2.append("text")
                        .attr("class", "pizzalabels")
                        .attr("x", label3x)
                        .attr("y", label3y);

            var equal1 = svg2.append("text")
                        .attr("class", "equallab")
                        .attr("x", equal1x)
                        .attr("y", equal1y)
                        .text("Is equal to.. ")
                        .attr("fill", "#ccc");


            var equal2 = svg2.append("text")
                        .attr("class", "equallab")
                        .attr("x", equal2x)
                        .attr("y", equal2y)
                        .text("Or...")
                        .attr("fill", "#ccc");


            // var equal2 = svg2.append("text")
            //             .attr("x", equal1x)
            //             .attr("y", (15*height2/20))
            //             .text("=")
            //             .attr("font-family", "sans-serif")
            //             .attr("font-size", "100px")
            //             .attr("fill", "#ccc");
            // var labelvarpizza = svg2.append("text")
            //             .attr("x", 0)
            //             .attr("y", height2*(2/5))
            //             .text("1")
            //             .attr("font-family", "sans-serif")
            //             .attr("font-size", "60px")
            //             .attr("fill", "#ccc");
            // var label16 = svg2.append("text")
            //             .attr("class", "pizzavar")
            //             .attr("x", label2x)
            //             .attr("y", height2*(15/30))
            //             .text("16 inch pizzas");
            // var label8 = svg2.append("text")
            //             .attr("class", "pizzavar")
            //             .attr("x", label3x)
            //             .attr("y", height2*(24/30))
            //             .text("8 inch pizzas");




            slider
                .call(brush.event)
              .transition() 
                .duration(1000)
                .call(brush.extent([16, 16]))
                .call(brush.event);

            function brushed() {
              var value = brush.extent()[0];

              if (d3.event.sourceEvent) { // not a programmatic event
                value = x.invert(d3.mouse(this)[0]);
                brush.extent([value, value]);
              }

              handle.attr("cx", x(value));
              handle2.attr("x", x(value)-4);


              svg2.selectAll(".pizza")
                    .style("fill","#F7E39B" )
                    .style("opacity",function() { 
                        var cscaled = value/15;
                        return cscaled; } )
                    .attr("r", pies(value)); // attribute = radius
                    // .attr("r", value);

              var sqinch = [];  
              // $(".arcpie").remove();
              $(".arcpie").remove();
              $(".arcpie2").remove();
              $(".pies").remove();
              arc(value); 

              // console.log(value);
            }
    //////////////////////////////////////////////////////////////////
    function bigpizzacall(value) {
        bigpizza
            .text( "A " + value + "    Inch Pizza" )
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("fill", "#ccc");

    }
    function midpizzacall(value) {
        midpizza          
            .text(value + " -- 16 Inch Pizzas")
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("fill", "#ccc");
        }
    function smallpizzacall(value) {
        smallpizza          
            .text(value + " -- 8 Inch Pizzas")
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("fill", "#ccc");
        }
    function bigpricecall(value) {
        bigprice
            .text( "$"  )
            .attr("font-family", "sans-serif")
            .attr("font-size", "16px")
            .attr("fill", "#ccc");

    }
    function midpricecall(value) {
        midprice          
            .text("$" + value )
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("fill", "#ccc");
        }
    function smallpricecall(value) {
        smallprice
            .text("$" + value)
            .attr("font-family", "sans-serif")
            .attr("font-size", "24px")
            .attr("fill", "#ccc");
        }

    function pies(d) { 
        // make multiple pies
        var diam_base_px_for_big_circle = scalef*d/2; // base diameter of pizza express in pixels for graphic
        var diam_val = d3.round(diam_base_px_for_big_circle); // base diameter of pizza express in pixels for graphic

        // var a = graphic_data2.indexOf(diam_val);
        // console.log("this is the value")
        // console.log(a)

        labelvarpizza_act(diam_base_px_for_big_circle);
        return diam_base_px_for_big_circle;
        
                    }

    function labelvarpizza_act(d) {
        // var varpizzaprice = function(d) { return d["mean"]};
        var varpizzaprice = "gonna figure";
        // console.log(varpizzaprice)

        // labelvarpizza
        //     .data(graphic_data2)
        //     .text("$" + varpizzaprice)
        //     .attr("font-family", "sans-serif")
        //     .attr("font-size", "60px")
        //     .attr("fill", "#ccc");

    }


    function arc(diam) {

    // base case = 6 in pizza
    // radius in graphic = 27 px == scale 3x
    var diam_base = 8 // base diameter of pizza
    var diam_base_px = scalef*diam_base/2// base diameter of pizza express in pixels for graphic
    var diam_base2 = 16 // base diameter of pizza
    var diam_base2_px = scalef*diam_base2/2// base diameter of pizza express in pixels for graphic
    var sqinch_max = Math.pow((diam_base/2),2)*Math.PI;
    var sqinch_max2 = Math.pow((diam_base2/2),2)*Math.PI;
    var sqinch_val = Math.pow((diam/2),2)*Math.PI;
    var sqinch_norm = 2*(sqinch_val/sqinch_max); // 2*number of 8" pizzas
    var sqinch_norm2 = 2*(sqinch_val/sqinch_max2); // 2*number of 16" pizzas
    
    var bigpizza_diam = d3.round(diam,1)
    var midpizza_diam = d3.round((sqinch_norm2/2),1)
    var smallpizza_diam = d3.round((sqinch_norm/2),1)
    
    var bigprice_ave = d3.round(diam,1)
    var midprice_ave = d3.round((sqinch_norm2*15.990/2),1)
    var smallprice_ave = d3.round((sqinch_norm*6.990/2),1)

    var piedata = [1];
    var piecount = Math.ceil(sqinch_val/sqinch_max);
    var arc_array = [];
    var width_pie = width/1.2;
    var width_pieb = 15*width1/100 ;
    var width_pieb2 = 12*width1/100 ;;

    var pizzay = 4.7*height2/10;
    var pizza2y = 8.5*height2/10;
    



    for (var i =1; i<piecount; i++)
    {
        var count = i;
        piedata.push(count);
    }

    ///////////////////////////
    // 16 inch pizzas
    ///////////////////////////

    var arcb = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base2_px)
    .startAngle(0)
    .endAngle(sqinch_norm2*Math.PI);
    var arcb2 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base2_px)
    .startAngle(0)
    .endAngle((sqinch_norm2-2)*Math.PI);
    var arcb3 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base2_px)
    .startAngle(0)
    .endAngle((sqinch_norm2-4)*Math.PI);
    var arcb4 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base2_px)
    .startAngle(0)
    .endAngle((sqinch_norm2-6)*Math.PI);

    svg2.append("path")
    .attr("class", "arcpie2")
    .attr("d", arcb)
    .attr("transform", "translate(" + width_pieb  +  "," + pizzay + ")")
    // .style("opacity", sqinch_val/sqinch_max2)
    .style("fill", "#3D7FA6");

    if (sqinch_norm2 > 2) {

        width_pieb = width_pieb + diam_base_px*4;    
        svg2.append("path")
        .attr("class", "arcpie2")
        .attr("d", arcb2)
        .attr("transform", "translate(" + width_pieb  +  "," + pizzay + ")")
        .style("opacity", .8)
        .style("fill", "#3D7FA6");

    }

    if (sqinch_norm2 > 4) {
        
        width_pieb = 15*width1/100 ;
        pizzay = pizzay + diam_base_px*4;        
        svg2.append("path")
        .attr("class", "arcpie2")
        .attr("d", arcb3)
    .attr("transform", "translate(" + width_pieb  +  "," + pizzay + ")")
        .style("opacity", .8)
        .style("fill", "#3D7FA6");

    }


    if (sqinch_norm2 > 6) {
        width_pieb = width_pieb + diam_base_px*4;    
        svg2.append("path")
        .attr("class", "arcpie2")
        .attr("d", arcb4)
    .attr("transform", "translate(" + width_pieb  +  "," + pizzay + ")")
        .style("opacity", .8)
        .style("fill", "#3D7FA6");

    }


    ///////////////////////////
    // 8 inch pizzas
    ///////////////////////////
    var arc = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle(sqinch_norm*Math.PI);
     var arc2 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-2)*Math.PI);
     var arc3 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-4)*Math.PI);
     var arc4 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-6)*Math.PI);
     var arc5 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-8)*Math.PI);
     var arc6 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-10)*Math.PI);
     var arc7 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-12)*Math.PI);
     var arc8 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-14)*Math.PI);
     var arc9 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-16)*Math.PI);
     var arc10 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-18)*Math.PI);
     var arc11 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-20)*Math.PI);
     var arc12 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-22)*Math.PI); 
    var arc13 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-24)*Math.PI);
     var arc14 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-26)*Math.PI);
     var arc15 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-28)*Math.PI);
     var arc16 = d3.svg.arc()
    .innerRadius(0)
    .outerRadius(diam_base_px)
    .startAngle(0)
    .endAngle((sqinch_norm-30)*Math.PI);


    svg2.append("path")
    .attr("class", "arcpie")
    .attr("d", arc)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
    .style("opacity", sqinch_val/sqinch_max)
    .style("fill", "#D8472B");


    if (sqinch_norm > 2) {

        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc2)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 4) {
        
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc3)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }


    if (sqinch_norm > 6) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc4)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 8) {
        width_pieb2 = 12*width1/100 ;
        pizza2y = pizza2y + diam_base_px*2;
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc5)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 10) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc6)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 12) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc7)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 14) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc8)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 16) {
        width_pieb2 = 12*width1/100 ;;
        pizza2y = pizza2y + diam_base_px*2
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc9)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 18) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc10)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 20) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc11)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 22) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc12)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 24) {
        width_pieb2 = 12*width1/100 ;;
        pizza2y = pizza2y + diam_base_px*2
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc13)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 26) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc14)
    .attr("transform", "translate(" + width_pieb2  +  "," + pizza2y + ")")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 28) {
        width_pieb2 = width_pieb2 + diam_base_px*2;    
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc15)
    .attr("transform", "translate(" + width_pie +",250)")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

    if (sqinch_norm > 30) {
        width_pie = width_pie + 50;        
        svg2.append("path")
        .attr("class", "arcpie")
        .attr("d", arc16)
    .attr("transform", "translate(" + width_pie +",250)")
        .style("opacity", sqinch_val/sqinch_max)
        .style("fill", "#D8472B");

    }

////////////////////////////////////////////////////////
// text
////////////////////////////////////////////////////////
    bigpizzacall(bigpizza_diam); 
    midpizzacall(midpizza_diam); 
    smallpizzacall(smallpizza_diam);
    bigpricecall(bigprice_ave); 
    midpricecall(midprice_ave); 
    smallpricecall(smallprice_ave); 

    }


    ////////////////////////////////////////////
    // scatter starts here
    ////////////////////////////////////////////
            svg.attr('class', 'scatter')
    	        .selectAll('circle')
    	            .data(graphic_data)
    	        .enter().append('circle')
                    // .filter(function(d) { return d.variable == "one_pxin" })        // <== This line
                    .attr('class', function(d) { return d.crust + "_circle"})				
                    .attr("r", width/150)
    				.attr("cx", xMap)
    				.attr("cy", yMap);
                    // .style("color", "#666")

        d3.select('.stage1')
            .on("mouseover", function() {
                    d3.select('.stage1').style("opacity",1);
            })
            .on("click", stage1_act); 
        d3.select('.deep')
            .on("click", deep_act); 
        d3.select('.thin')
            .on("click", thin_act); 
        d3.select('.hand')
            .on("click", hand_act); 
        d3.select('.all')
            .on("click", all_act); 

        console.log("graphic_data2");
        console.log(graphic_data2);

// deeplines

            // svg.append("path")
            //     .data(graphic_data2)
            //     .attr("class", "line")
            //     .attr("d", line );


                // .style("stroke", function(d) { return color(d.name); })
                // .on("mouseover", mouseover)
                // .on("mouseout", mouseout);


        // d3.select('.deep')
            // .on("click", deep_act); 
        // d3.select('.toppings0')
        //     .on("click", zero_pxin_act); 
        // d3.select('.toppings1')
        //     .on("click", one_pxin_act); 
        // d3.select('.toppings2')
        //     .on("click", two_pxin_act); 
        // d3.select('.toppings3')
        //     .on("click", three_pxin_act); 
        // d3.select('.toppings4')
        //     .on("click", four_pxin_act); 

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
    var colors = {
        'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
        'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
        'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
        'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
        'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
    };
      

            // update responsive iframe
            sendHeightToParent();
        }

            function mouseover(d, i) {
                d3.select(this).style("opacity", "1");
            };

            function mouseout(d, i) {
                d3.select(this).style("opacity", ".3");
            };

            function stage1_act() {
                    slider.call(brush.extent([0, 0]))
            }


            function deep_act() 
            {
                d3.selectAll(".deep.dish_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".thin_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".hand-tossed_circle")
                .style("opacity", 0);    
                                        // <== and this one
                                   
                d3.selectAll(".deep.dish_circle")
                .moveToFront()                                                                                                     
                .transition() 
                .duration(500)
                .style("fill", "#E27560")                            // <== and this one
                .style("opacity", .3)  
                .attr("r", 14);
            }

            function thin_act() 
            {
                d3.selectAll(".deep.dish_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".thin_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".hand-tossed_circle")
                .style("opacity", 0);    
                                        // <== and this one
                                   
                d3.selectAll(".thin_circle")
                .moveToFront()                                                                                                     
                .transition() 
                .duration(500)
                .style("fill", "#E27560")                            // <== and this one
                .style("opacity", .3)  
                .attr("r", 14);
            }

            function hand_act() 
            {
                d3.selectAll(".deep.dish_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".thin_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".hand-tossed_circle")
                .style("opacity", 0);    
                                        // <== and this one
                                   
                d3.selectAll(".hand-tossed_circle")
                .moveToFront()                                                                                                     
                .transition() 
                .duration(500)
                .style("fill", "#E27560")                            // <== and this one
                .style("opacity", .3)  
                .attr("r", 14);
            }


            function all_act() 
            {

                d3.selectAll(".deep.dish_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".thin_circle")
                .style("opacity", 0)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".hand-tossed_circle")
                .style("opacity", 0);    
                
                console.log(bookltext)               

                d3.selectAll(".deep.dish_circle")
                .transition() 
                .duration(500)
                .attr("r", 14)
                .style("opacity", .2)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".thin_circle")
                .transition() 
                .duration(500)
                .attr("r", 14)
                .style("opacity", .2)    
                .style("fill", "#666");                            // <== and this one
                d3.selectAll(".hand-tossed_circle")
                .transition() 
                .duration(500)
                .attr("r", 14)
                .style("opacity", .2)
                .style("fill", "#666");                            // <== and this one
     
            }

          

        function setup() {
            if (Modernizr.svg) {
                d3.csv(graphic_data_url, function(error, data) {
                    graphic_data = data;

                    graphic_data.forEach(function(d) {
                        d.size = +d.size;
                        d.value = +d.value;
                        d.px_inc = +d.px_inc;
                        d.crust = d.crust;
                        // d.three_pxin = +d.three_pxin;
                        // d.four_pxin = +d.four_pxin;
                        // d.disp = +d.disp;
                        // d.hp = +d.hp;
                        // d.drat = +d.drat;
                        // console.log(d.size)
                        // console.log(d.value)
                    });


                    // console.log(graphic_data);
                });

                // second csv
                for (var i = 2; i <6; i++) {
                var urlname = eval("graphic_data_url" + i)
                var csvname = eval("graphic_data" + i)
                // console.log(urlname);
                d3.csv(urlname, function(error, data) {
                    csvname = data; 

                    csvname.forEach(function(d) {
                        d.size = +d.size;
                        d.fitted = +d.fitted;
                        d.crust = d.crust;

                    });

                    setupResponsiveChild({
                        renderCallback: drawGraphic 
                    });

                    });
                }
            }
        }

        setup();

    })