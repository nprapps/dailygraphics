
var graphic_aspect_width = 3;
var graphic_aspect_height = 6;
var mobile_threshold = 600;
var pymChild = null;
var blankDegrees = ["Consumer Sciences", "Other", "Physics","Public Administration", "Theology", "Zoology", "Microbiology","Library Science","Legal Studies", "Cultural Studies", "Geology And Earth Sciences" ]
var levelFormat = d3.format("0,000");

var gradTotal = [801391,
                    847005,
                    882130,
                    907146,
                    887932,
                    891218,
                    886304,
                    887072,
                    888721,
                    898461,
                    905630,
                    923292,
                    943109,
                    949949,
                    954866,
                    963246,
                    965555,
                    967215,
                    989878,
                    1019269,
                    1050077,
                    1095595,
                    1123245,
                    1127816,
                    1119755,
                    1121812,
                    1125411,
                    1139467,
                    1156173,
                    1191088,
                    1198584,
                    1245723,
                    1299923,
                    1349279,
                    1386332,
                    1428784,
                    1464868,
                    1500770,
                    1536863,
                    1582412,
                    1644696,
                    1715843]


// function scrollGraphic(id) {
//     $('html, body').animate({
//             scrollTop: $(id).offset().top;
//         }, 1000);
// }

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
   });
};


// var colors = {
//     ['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
//     '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
//      '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
//      '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
//      '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']
// };

var $graphic = $('#graphic');
var $graphicSmall = $('#graphicSmall');
    var graphic_data_url = 'grad-level4.csv';
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

    var margin = { top: 30, right: 120, bottom: 30, left: 60 };

  // var graphic_data = data;
    var is_mobile = false;
    // var last_data_point = graphic_data.length - 1;
    var num_ticks = 5;

    if (width <= mobile_threshold) {
        is_mobile = true;

    }

    if (is_mobile) {
            width = Math.floor(((width - 11) ) - margin.left - margin.right);
            d3.select("#backButton").style("margin-left","0");
        } else {
            width = Math.floor((width - 10) - margin.left - margin.right);
            d3.select("#backButton").style("margin-left","12%");

    }
    var graphic_width = width;
    drawBigGraph(graphic_width, is_mobile);

}



function drawBigGraph(width, is_mobile) {
        if (is_mobile) {
        var margin = { top: 30, right: 80, bottom: 30, left: 50 };
        var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width*1.5) - margin.top - margin.bottom;        
        blankDegrees.push("Economics", "Security Studies", "Agriculture", "Chemistry", "Philosophy", "Interdisciplinary", "Fitness Studies", "Architecture","Interdisciplinary Studies","Family And Consumer Science", "Foreign Languages");

        } else {
        var margin = { top: 30, right: 120, bottom: 30, left: 60 };            
        var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
        blankDegrees = ["Consumer Sciences", "Other", "Physics","Public Administration", "Theology", "Zoology", "Recreation And Fitness Studies", "Microbiology","Library Science","Legal Studies", "Cultural Studies", "Geology And Earth Sciences" ];        
        }

        d3.select("#backButton")
        .style("visibility","hidden");

        
        var num_x_ticks = 8;
        if (width <= 480) {
            num_x_ticks = 6;
        } 
        
        var num_y_ticks = 26;
        if (width <= 480) {
            num_y_ticks = 13;
        }

           // clear out existing graphics

        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);
        var formatPercent =  d3.format(".0%");

    $graphic.empty();


        // var color = d3.scale.category20();
        var color = d3.scale.ordinal()
                     .range(['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
                    '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
                    '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
                    '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
                    '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']); // colors

        var svg = d3.select("#graphic")
            .append("svg")
                .attr("class","bigpicture")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .on("mouseout",mouseoutSVG);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(5)
            .ticks(num_x_ticks)
            .tickFormat(d3.format("d"));

        var yearLine = svg.append("rect") 
          .attr("class", "yearLine")
          .attr("height", height)
          .attr("width", "3")
          .style("opacity", .5)     
          .style("z-index", "100");

        var xAxis_top = d3.svg.axis()
            .scale(x)
            .orient("top")
            .tickSize(9)
            .ticks(num_x_ticks)
            .tickFormat(d3.format("d"));

        var x_axis_grid = function() { return xAxis; };

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .tickSize(10)
            .tickFormat(formatPercent);
        var y_axis_grid = function() { return yAxis; };

        var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x(d.yr); })
        .y(function(d) { return y(d.y); });


        var area = d3.svg.area()
            .x(function(d) { return x(d.yr); })
            .y0(function(d) { return y(d.y0); })
            .y1(function(d) { return y(d.y0 + d.y); });        

        var area2 = d3.svg.area()
            .x(function(d) { return x(d.yr); })
            .y0(function(d) { return y(0); })
            .y1(function(d) { return y(d.y); });        


        var stack = d3.layout.stack()
            .values(function(d) { return d.values; });


        var tooltip = d3.select("#graphic")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity","0");

        var tooltipText = d3.select("#graphic")
            .append("div")
            .attr("class", "tooltipText")
            .style("opacity","0");


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

        // console.log(quintiles)             
        var quint = svg.selectAll(".quint")
            .data(quintiles)
            .enter().append("g")
            .attr("class", "quint");

        quint.append("path")
            .attr('class','layer')
            .attr('id', function(d) { 
                return  d.name})
            .attr("d", function(d) { return area(d.values); })
            .style("fill", function(d) { return color(d.name); })
            .style("opacity", "1")
            .on("mouseover",mouseover)
            .on("mouseout", mouseout)
            // .transition()
            // .duration(200)
            .on("click", smallGraph);

        var xBottom = svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)

            xBottom
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            });            

        var xTop = svg.append("g") // Add the X Axis
            .attr("class", "x axis")
            // .attr("transform", "translate(0,0)")
            .call(xAxis_top);

            xTop
             .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            });         
    
        var yTop = svg.append("g") // Add the Y Axis
            .attr("class", "y axis")
            .attr("transform", "translate("+-width/100+",0)")
            .call(yAxis);

            yTop
             .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            });   

    
        var yGrid = svg.append("g")         
            .attr("class", "y grid")
            .call(y_axis_grid()
                .tickSize(-width, 0, 0)
                .tickFormat("")
            );    

        var ylabelText =  quint.append("text")
            .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
            .attr('id', function(d) {
                var found = $.inArray(d.name, blankDegrees)
                if (found != -1 ) {
                    return 'blank-label';
                } else {
                    return 'nonblank-label';
                }
            })
            .attr('class', function(d) { 
                return 'ylabel quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
            })
            .attr("transform", function(d) { return "translate(" + x(d.value.yr) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
            .attr("x",3)
            .attr("dy", ".3em")
            .text(function(d) { return d.name; })
            .style("fill", function(d) { return color(d.name); })
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            });   


           // var yAxisLabel = svg.append("text")
           //              .attr("class", "y label")
           //              .attr("text-anchor", "end")
           //              .attr("y", 6)
           //              .attr("dy", ".75em")
           //              .attr("transform", "rotate(-90)")
           //              .attr('transform', 'translate(' +  -75 + ',' + height/2.3 + ') rotate(-90)')
           //              .text("Share")
           //              .style("opacity", .7);



quint.selectAll(".layer")
    .data(quintiles)
    .on("mousemove", function(d, i) {
      var mousex = d3.mouse(this);
          mousex = mousex[0];
      var invertedx = x.invert(mousex);
      var what = d3.select(this).attr("id");
      // var test = 1;
        // console.log(quintiles.length);
        for (var i=0; i<quintiles.length; i++) {

            if(quintiles[i].name==what) {
                var test = quintiles[i].values;
                var countryData = quintiles[i];
            }
        };

      var date = Math.round(invertedx);
           num = date-1970,
           pro = Math.round(d[name]),
           shareVal = (test[num].y*100),
           shareVal2 = (test[num].y0*100),
           mouseDate = test[num].yr,
           total = levelFormat(d3.round(gradTotal[num],-3)),
           shareLevel = d3.round((gradTotal[num]*test[num].y),-3),
           shareLevel = levelFormat(shareLevel)

      tooltipText
        .html( "<h3>" + what + "</h3>  <br><h4> Year: " + mouseDate +  "<br> Share: " + shareVal.toFixed(2) +  "% <br> Graduates: " + shareLevel + " <h5>" )
        .style("opacity","1");
      tooltip
        .style("opacity",".7");
       
        if (date <=1981) {
            if (shareVal2 <80) {
            tooltip.attr("class","tooltip2")
            .style("top", (d3.event.pageY - 105) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX -18) + "px");
            tooltipText
            .style("top", (d3.event.pageY - 105) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX -18) + "px");
                }
            else
                {
            tooltip.attr("class","tooltip3")
            .style("top", (d3.event.pageY + 25) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX -18) + "px");
            tooltipText
            .style("top", (d3.event.pageY + 25) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX -18) + "px");                    
                }                

            // tooltip.style("left", (d3.event.pageX -4) + "px");
        } else {
            if (shareVal2 < 80) {
            tooltip.attr("class","tooltip")
            .style("top", (d3.event.pageY - 105) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX - 129) + "px");
            tooltipText
            .style("top", (d3.event.pageY - 105) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX - 129) + "px");
                }
            else 
                {
            tooltip.attr("class","tooltip4")
            .style("top", (d3.event.pageY + 25) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX - 129) + "px");
            tooltipText
            .style("top", (d3.event.pageY + 25) + "px")
            .transition().ease("easeInOutCirc").duration(10)
            .style("left", (d3.event.pageX - 129) + "px");
                }
        }

        // if (shareVal2 > 90)
        // {
        //     tooltip.attr("class","tooltip2")
        //     .transition().ease("easeInOutCirc").duration(10)
        //     .style("top", (d3.event.pageY + 90) + "px")
        //     .style("left", (d3.event.pageX -18) + "px");
        // } else {
        //     tooltip.attr("class","tooltip")
        //     .style("top", (d3.event.pageY - 90) + "px")
        //     .transition().ease("easeInOutCirc").duration(10)
        //     .style("left", (d3.event.pageX - 129) + "px");

        // }

       yearLine.attr("x",x(invertedx));

    })
        
        function mouseover(d, i) {

            d3.selectAll("#blank-label")
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            })               // .style("fill","#ccc")
            .style("opacity","0");

            d3.selectAll("#nonblank-label")
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            })               // .style("fill","#ccc")
            .style("opacity",".1");


            d3.selectAll(".layer")
            .transition()
            .ease('easeInOutElastic')
            .duration(200)
            .style("opacity", ".6")
            d3.select(this)
            .transition()
            .ease('easeInOutElastic')
            .duration(200)
            .style("opacity", "1")
            .style("stroke", "#3D352A")
            .style("stroke-width", "1");
            
            var testname = d3.select(this).attr("id");
            testname = String('.quint-' + testname.replace(/\s+/g, '-').toLowerCase());

            d3.select(testname)
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "12px";
                } else {
                    return "14px";
                }
            })               // .style("fill","black")
            .style("opacity","1");

        }

        d3.select(".quint-health-professions").style("fill","#EFC637");
        d3.select(".quint-geology-and-earth-sciences").style("fill","#EFC637");
        d3.select(".quint-economics").style("fill","#17807E");
        d3.select(".quint-education").style("fill","#17807E");
        d3.select(".quint-chemistry").style("fill","#51AADE");
        d3.select(".quint-political-science").style("fill","#D8472B");

        // Chemistry   Economics   Education

        function smallGraph(d,i) {

        d3.select(".bigpicture")
            .attr("height",height/1.8);

        var yaxisSmall = d3.svg.axis()
            .orient("left")
            .scale(y)
            .tickSize(10)
            .ticks(5)
            .tickFormat(formatPercent);

        var y_axis_gridSmall = function() { return yaxisSmall; };


            x.range([0, width+80]);
            y.range([height/3, 0]);
            y.domain([
                d3.min(quintiles, function(c) { return d3.min(c.values, function(v) { return v.y; }); }),
                d3.max(quintiles, function(c) { return d3.max(c.values, function(v) { return v.y; }); })
            ]);
            


             var smallWhat = d3.select(this).attr("id");

             // var chosenOne = d3.select(smallWhat)
                // .attr("class", "chosen");
                // .attr("", "chosen");



              // var test = 1;
                // console.log(quintiles.length);
                for (var i=0; i<quintiles.length; i++) {

                    if(quintiles[i].name==smallWhat) {
                        var test = quintiles[i].values;
                        var countryData = quintiles[i];
                    }
                };


            // x.domain(d3.extent(test, function(d) { return d.yr; }));
            // y.domain(d3.extent(test, function(d) { return d.y; }));
            d3.selectAll(".yearLine").remove();
            d3.selectAll(".tooltip").remove();
            d3.selectAll(".tooltipText").remove();
            d3.selectAll(".tooltip2").remove();
            d3.selectAll(".tooltip3").remove();
            d3.selectAll(".tooltip4").remove();
            d3.selectAll(".quint").transition().duration(200).style("opacity","0").remove();
            d3.selectAll(".ylabel").transition().duration(200).style("opacity","0").remove();
            d3.selectAll(".layer").transition().duration(500).style("opacity","0").remove();
      
            xTop.remove();

            xBottom 
                .attr("class", "x axis")
                .attr("transform", "translate(0," + height/3 + ")")
                .call(xAxis)


                // .selectAll("text")  
                //     .style('font-size', function(d) {
                //         if (is_mobile) {
                //             return 10px;
                //         } else {
                //             return 12px;
                //         }
                //     });

            yTop
                .transition().duration(250).ease("quad")
                .attr("transform", "translate(" + -width/50+ ",0)")
                .call(yaxisSmall);

            yGrid
                .transition().duration(250)            
                .call(y_axis_gridSmall()
                    .tickSize(-width-80, 0, 0)
                    .tickFormat("")
                );    
      
        // var backButton = d3.select("#graphic")
        //     .append("div")
        //     .attr("class", "backButton")
        //     .style("background","#ccc")
        //     .style("opacity","1")
        //     .style("top",y(20))
        //     .style("left",x(1990));

// multiple lines
            var small = svg.selectAll(".small-line")
            .data(quintiles)
            .enter().append("g")
            .attr('class',"small-line")
            
            small.append("path")
            .attr("id","small-area")
            .attr('class', function(d) { 
                return 'area quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
            })
            .transition().duration(500)
            .attr("d", function(d) { 
                if(d.name==smallWhat) {
                    return area2(d.values);
                }
            })
            .style("fill", function(d) { return color(d.name); })
            .style("opacity", "1")
            .style("stroke", "#a0a0a0")
            .style("stroke-width", "1")


            console.log(y(20))

            small.append("text")
            .attr('class',"small-graph-degree")
            .text(function(d) { 
                if(d.name==smallWhat) {
                    return d.name;
                }
            })            
            .attr("x",width*.01)
            .attr("y","-6")
            .style("fill", "#black")
            .style("background", "white")
            .style("font-size", function(d) {
               if (is_mobile) {
                return "12px";
                } else {
                return "18px";
                }
            })
            .style("font-weight", "thin");


            var lastNum = 41;
            var firstNum = 0;

            small.append("text")
            .attr('class',"last-val")
            // .attr('x',x(2011))
            .attr('x', function(d) { 
                if(d.name==smallWhat) {
                    console.log(d.values[lastNum]['yr'])
                       if (is_mobile) {
                        return x(d.values[lastNum]['yr']) ;
                        } else {
                        return x(d.values[lastNum]['yr']) ;
                        }
                    }
            })
            .attr('y', function(d) { 
                if(d.name==smallWhat) {
                    console.log(d.values[lastNum]['y']*100)
                    return y(d.values[lastNum]['y']) - 9;
                    // return y(d.values[lastNum]['y']*100);
                }
            })
            .text(function(d) { 
                if(d.name==smallWhat) {
                    var smallval = d.values[lastNum]['y']*100;
                    console.log(d.values[lastNum]['y'])
                    console.log(d3.round(smallval))

                    return d3.round(smallval) + '%' 
                }

            })
            .style("fill", "black")
            .style("font-weight", "bold")
            .style('text-anchor',"end")
            .style('opacity',"1")
            .style("font-size", function(d) {
            if (is_mobile) {
                return "10px";
                } else {
                return "12px";                
                }
            });

          small.append("text")
            .attr('class',"first-val")
            // .attr('x',x(2011))
            .attr('x', function(d) { 
                if(d.name==smallWhat) {
                    console.log(d.values[firstNum]['yr'])
                       if (is_mobile) {
                        return x(d.values[firstNum]['yr']) ;
                        } else {
                        return x(d.values[firstNum]['yr']) ;
                        }
                    }
            })
            .attr('y', function(d) { 
                if(d.name==smallWhat) {
                    console.log(d.values[firstNum]['y']*100)
                    return y(d.values[firstNum]['y']) - 9;
                    // return y(d.values[firstNum]['y']*100);
                }
            })
            .text(function(d) { 
                if(d.name==smallWhat) {
                    var smallval = d.values[firstNum]['y']*100;
                    console.log(d.values[firstNum]['y'])
                    console.log(d3.round(smallval))

                    return d3.round(smallval) + '%' 
                }

            })
            .style("fill", "black")
            .style('opacity',"1")
            .style('font-weight',"bold")
            .style('text-anchor',"start")
            .style("font-size", function(d) {
            if (is_mobile) {
                return "10px";
                } else {
                return "12px";                
                }
            });






            if (is_mobile) {
            small.append("rect")
            .attr('class',"bb")
            .attr('width','30px')
            .attr('height', '15px')
            .text("Back")  
            .attr("x",width*1.2)
            .attr("y","-18")
            .style('opacity',".2")
            .style("fill", "white")
            .style("stroke-width", "1px")
            .style("stroke", "black")
            .style("opacity", ".8")
            .on("mouseover",backMouseover)
            .on("mouseout",backMouseout);


            small.append("text")
            .attr('class',"bb")
            .text("Back")  
            .attr("x",width*1.22)
            .attr("y","-7")
            .style("fill", "black")
            .style('opacity',"1")
            .style("font-size", "10px")
            .style("text-align", "center")
            .style("font-weight", "thin")
            .on("mouseover",backMouseover)
            .on("mouseout",backMouseout);

            }
            
            else {


            small.append("rect")
            .attr('class',"bb")
            .attr('width','65px')
            .attr('height', '20px')
            .text("Back")  
            .attr("x",width)
            .attr("y","-24")
            .style("fill", "white")
            .style("stroke-width", "1px")
            .style("stroke", "black")
            .style("opacity", ".5")
            .on("mouseover",backMouseover)
            .on("mouseout",backMouseout);
            // .style("box-shadow", "10px 10px 5px #888888");

            small.append("text")
            .attr('class',"bb")
            .text("Back")  
            .attr("x",width*1.02)
            .attr("y","-8")
            .style("fill", "black")
            .style('opacity',"1")
            .style("font-size", "16px")
            .style("text-align", "center")
            .style("font-weight", "thin")
            .on("mouseover",backMouseover)
            .on("mouseout",backMouseout);
      

            }


            // small.append("rect")
            // .attr('class',"backButton")
            // .attr('width',"150")
            // .attr('height',"50")
            // .attr("x",width*.8)
            // .attr("y","5")
            // .style("fill", "#ccc");
    

            // small.append("text")
            // .attr('class',"backButton")
            // .text("Back To Full Graphic")     
            // .attr("x",width*.8)
            // .attr("y","15")
            // .style("fill", "black")
            // .style('opacity',".7");

// add first and last value

        // svg.append('g')
        // .attr('class', 'value')
        // .selectAll('text')
        //     .data(d3.entries(lines))
        // .enter()
        // .append('text')
        //     .attr('x', function(d) { 
        //         if(d.name==smallWhat) {
        //         return x(d.values.yr[last_data_point]) + 6;
        //     })
        //     .attr('y', function(d) { 
        //         return y(d['value'][last_data_point]['amt'] - 1);
        //     })
        //     .attr('text-anchor', 'left')
        //     .text(function(d) { 
        //         return d['value'][last_data_point]['amt'] + '%' 
        //     });


           // num = 1
           // pro = Math.round(d[name]),
           // shareVal = (test[num].y*100),
           // shareVal2 = (test[num].y0*100),
           // mouseDate = test[num].yr,
           // total = levelFormat(d3.round(gradTotal[num],-3)),
           // shareLevel = d3.round((gradTotal[num]*test[num].y),-3),
           // shareLevel = levelFormat(shareLevel)


       // var ylabelText =  quint.append("text")
       //      .datum(function(d) { return {name: d.name, value: d.values[d.values.length - 1]}; })
       //      .attr('id', function(d) {
       //          var found = $.inArray(d.name, blankDegrees)
       //          if (found != -1 ) {
       //              return 'blank-label';
       //          } else {
       //              return 'nonblank-label';
       //          }
       //      })
       //      .attr('class', function(d) { 
       //          return 'ylabel quint-' + d.name.replace(/\s+/g, '-').toLowerCase()
       //      })
       //      .attr("transform", function(d) { return "translate(" + x(d.value.yr) + "," + y(d.value.y0 + d.value.y / 2) + ")"; })
       //      .attr("x",3)
       //      .attr("dy", ".3em")
       //      .text(function(d) { return d.name; })
       //      .style("fill", function(d) { return color(d.name); })
       //      .style("font-size", "12px")
       //      .style("font-weight", "300");


            d3.selectAll(".bb")
            .on("click",function(d) {
                        delete quintiles;
                        quint.remove();
                        drawBigGraph(width,is_mobile);
                    }
                );

        }


        function backMouseover(d, i) {
            d3.selectAll(".bb")
            .transition()
            .duration(100)
            .style("opacity", ".01");

        }

        function backMouseout(d, i) {
            d3.selectAll(".bb")
            .transition()
            .duration(100)
            .style("opacity", ".5");

        }

        function mouseout(d, i) {
            // d3.selectAll("#blank-label")
            // .style("opacity","0");
            // d3.selectAll("#nonblank-label")
            // .style("font-size","12px")
            // .style("fill","#ccc")
            // .style("opacity","1");
            d3.selectAll(".layer")
            .transition()
            .duration(200)
            .style("opacity", "1")
            .style("stroke", "null")
            d3.select(".tooltip")
            .style("opacity","0");
            // .style("visibility", "hidden");

        }

        function mouseoutSVG(d, i) {
            d3.selectAll("#blank-label")
            .style("opacity","0");
            d3.selectAll("#nonblank-label")
            .style('font-size', function(d) {
                if (is_mobile) {
                    return "10px";
                } else {
                    return "12px";
                }
            })               // .style("fill","#ccc")
            .style("opacity","1")
            d3.select(".tooltip")
            .style("opacity","0");
            d3.select(".tooltip2")
            .style("opacity","0");
            d3.select(".tooltip3")
            .style("opacity","0");
            d3.select(".tooltip4")
            .style("opacity","0");
            d3.select(".tooltipText")
            .style("opacity","0");


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
