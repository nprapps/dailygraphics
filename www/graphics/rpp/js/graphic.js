var $graphic;
var graphic_data;
var graphic_data_url = 'rpp.csv';
var IS_MOBILE;
var mobile_threshold = 480;
var num_ticks;
var pymChild = null;
var min_height = 610;
var graphic_aspect_width = 1;
var graphic_aspect_height = 2;

var msaKeep = [
"Danville IL ",
"Jefferson City MO ",
"Jackson TN ",
"Rome GA ",
"Morristown TN ",
"Cleveland TN ",
"New HavenMilford CT ",
"BostonCambridgeQuincy MANH ",
"San DiegoCarlsbadSan Marcos CA ",
"VallejoFairfield CA ",
"Napa CA ",
"New YorkNorthern New JerseyLong Island NYNJPA ",
"BridgeportStamfordNorwalk CT ",
"San FranciscoOaklandFremont CA ",
"San JoseSunnyvaleSanta Clara CA ",
"WashingtonArlingtonAlexandria DCVAMDWV "]

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
   });
};


/*
 * Render the graphic
 */
function render(width) {
    // console.log(graphic_data)
    // if (Modernizr.svg) {
        var margin = {top: 100, right: 350, bottom: 100, left: 350};

        if (width < mobile_threshold) {
            var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
            num_ticks = 5;
            margin.left = 350;
            margin.right = 350;
            IS_MOBILE = true;
        } else {
            var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
            num_ticks = 10;
            margin.left = 200;
            margin.right = 200;
            IS_MOBILE = false;
        }

        var width = width - margin.left - margin.right;

        // clear out existing graphics
        $graphic.empty();

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);
        
        var line = d3.svg.line()
            .x(function(d) { return x(d.msa); })
            .y(function(d) { return y(d.amt); });

        var xMap = function(d) { return d.msa;}; 
        var yMap = function(d) { return d.amt;}; 

            // var xVal = function(d) { return d.size;};

        var color = d3.scale.ordinal()
                     .range(['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
                    '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
                    '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
                    '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
                    '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']); // colors


      // color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== "msa"; }));

        // mapping data from csv file
        // maps into color domain
        // var lines = color.domain().map(function(name) {
        //     return {
        //         name: name,
        //         values: graphic_data.map(function(d) {
        //             return {msa: d.msa, indexed: +d[name]};
        //         })
        //     };
        // });

        var lines = {};
        for (var column in graphic_data[0]) {
            if (column == 'msa') continue;
            lines[column] = graphic_data.map(function(d) {
                return { 
                    'msa': d.msa, 
                    'amt': d[column]
                };
            });
        }

var entry = d3.entries(lines);
var values2 =  d3.values(lines);
var keys =  d3.keys(lines);
var numberFormat = d3.format("d")
// console.log(graphic_data)


// console.log(values2[0])
// console.log(values2[0][0])
// console.log(values2[0][0]["msa"])
       
        var svg = d3.select('#graphic').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(d3.extent(graphic_data, function(d) { return d.msa; }));

        y.domain([15000,45000])

        // y.domain([0,
        //     d3.max(d3.entries(lines), function(c) { 
        //         return d3.max(c.value, function(v) { 
        //             var n = v.amt;
        //             return Math.ceil(n);
        //             return Math.ceil(n/10) * 10; // round to next 10
        //         }); 
        //     })
        // ]);
        
        svg.append('g').selectAll('path')
            .data(d3.entries(lines))
            .enter()
            .append('path')
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-path';
                } else {
                    return 'nonblank-path';
                }
            })            
            .attr('class','line')
                // .attr('class', function(d, i) {
                //     return 'line line-' + i + ' ' + d[name];
                // })
                .attr('d', function(d) {
                    return line(d.value);
                });

// console.log(lines)

console.log(entry)
console.log(entry[0]["key"])
// console.log(entry[0][key][0])

console.log(keys[0])


// left side labels
        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            // console.log(d.key)
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-label';
                } else {
                    return 'nonblank-label';
                }
            })
            .attr('class', function(d) { 
                return 'ylabel ' + d.key
            })
            .attr("x",function(d) {
                return x(d['value'][0]['msa']);
                })
            .attr("y",function(d) {
                return y(d['value'][0]['amt']);
                })
            .attr("dy", ".3em")
            .attr("dx", "-4.5em")
            .attr("text-anchor", "end")
            .text(function(d) {return d.key;});
            // .text(values2[0][0]["msa"])
            // .style('font-size',"9px");

// left side values
        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            // console.log(d.key)
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-label';
                } else {
                    return 'nonblank-label';
                }
            })
            .attr('class', function(d) { 
                return 'yvalues ' + d.key
            })
            .attr("x",function(d) {
                return x(d['value'][0]['msa']);
                })
            .attr("y",function(d) {
                return y(d['value'][0]['amt']);
                })
            .attr("dy", ".3em")
            .attr("dx", "-.5em")
            .attr("text-anchor", "end")
            .text(function(d) {return "$" + d['value'][0]['amt'];});
            // .text(values2[0][0]["msa"])
            // .style('font-size',"9px");


        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-label';
                } else {
                    return 'nonblank-label';
                }
            })
            .attr('class', function(d) { 
                return 'ylabel ' + d.key
            })
            .attr("x",function(d) {
                return x(d['value'][1]['msa']);
                })
            .attr("y",function(d) {
                return y(d['value'][1]['amt']);
                })
            .attr("dy", ".3em")
            .attr("dx", "4.5em")
            .attr("text-anchor", "start")
            .text(function(d) {return d.key;});
            // .text(values2[0][0]["msa"])
            // .style("fill", function(d) { return color(d.key); })
            // .style('font-size', function(d) {
            //     if (is_mobile) {
            //         return "9px";
            //     } else {
            //         return "12px";
            //     }
            // }); 

// right side values
        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
            .append('text')
            // console.log(d.key)
            .attr('id', function(d) {
                var found = $.inArray(d.key, msaKeep)
                if (found == -1 ) {
                    return 'blank-label';
                } else {
                    return 'nonblank-label';
                }
            })
            .attr('class', function(d) { 
                return 'yvalues ' + d.key
            })
            .attr("x",function(d) {
                return x(d['value'][1]['msa']);
                })
            .attr("y",function(d) {
                return y(d['value'][1]['amt']);
                })
            .attr("dy", ".3em")
            .attr("dx", ".5em")
            .attr("text-anchor", "start")
            .text(function(d) {return "$" + d['value'][1]['amt'];});
            // .text(values2[0][0]["msa"])

            svg.append('text')
            .attr('id', 'x-label')
            .attr("x", x(1))
            .attr("y", y(46000))
            .attr("dy", ".3em")
            .attr("dx", "-1.5em")
            .attr("text-anchor", "end")
            .text("Nominal")
  
            svg.append('text')
            .attr('id', 'x-label')
            .attr("x", x(2))
            .attr("y", y(46500))
            .attr("dy", ".3em")
            .attr("dx", "-1.5em")
            .attr("text-anchor", "start")
            .text("Adjusted For")
            // .st
            svg.append('text')
            .attr('id', 'x-label')
            .attr("x", x(2))
            .attr("y", y(46000))
            .attr("dy", ".3em")
            .attr("dx", "-1.5em")
            .attr("text-anchor", "start")
            .text("How Much It Can Buy You");

            // svg.append('text')
            // .attr('id', 'x-label')
            // .attr("x", x(2))
            // .attr("y", y(45500))
            // .attr("dy", ".3em")
            // .attr("dx", "-1.5em")
            // .attr("text-anchor", "start")
            // .text("Parity");

    
d3.selectAll("#nonblank-path").moveToFront();
        // svg.append('g')
        //     .attr('class', 'value begin')
        //     .selectAll('text')
        //         .data(lines)
        //     .enter().append('text')
        //         .attr('x', function(d, i) { 
        //             return x(d['value'][0]['year']);
        //         })
        //         .attr('y', function(d) { 
        //             var ypos = y(d['value'][0]['amt']);
        //             if (d.key == 'oceania') {
        //                 ypos -= 12;
        //             }
        //             if (d.key == 'n_africa') {
        //                 ypos -= 4;
        //             }
        //             if (d.key == 'c_asia') {
        //                 ypos += 6;
        //             }
        //             if (d.key == 'e_asia') {
        //                 ypos += 10;
        //             }
        //             if (d.key == 'se_asia') {
        //                 ypos += 11;
        //             }
        //             if (d.key == 'w_asia') {
        //                 ypos += 3;
        //             }
        //             return ypos;
        //         })
        //         .attr('dx', -6)
        //         .attr('dy', 4)
        //         .attr('text-anchor', 'end')
        //         .attr('class', function(d) { return 'l-' + d.key; })
        //         .text(function(d) { 
        //             if (IS_MOBILE) {
        //                 return d['value'][0]['amt'];
        //             } else {
        //                 return d['value'][0]['amt'];
        //             }
        //         });

        // svg.append('g')
        //     .attr('class', 'label begin')
        //     .selectAll('text')
        //         .data(d3.entries(lines))
        //     .enter().append('text')
        //         .attr('x', function(d, i) { 
        //             return x(d['value'][0]['year']);
        //         })
        //         .attr('y', function(d) { 
        //             var ypos = y(d['value'][0]['amt']);
        //             if (d.key == 'oceania') {
        //                 ypos -= 12;
        //             }
        //             if (d.key == 'n_africa') {
        //                 ypos -= 4;
        //             }
        //             if (d.key == 'c_asia') {
        //                 ypos += 6;
        //             }
        //             if (d.key == 'e_asia') {
        //                 ypos += 10;
        //             }
        //             if (d.key == 'se_asia') {
        //                 ypos += 11;
        //             }
        //             if (d.key == 'w_asia') {
        //                 ypos += 3;
        //             }
        //             return ypos;
        //         })
        //         .attr('dx', -35)
        //         .attr('dy', 4)
        //         .attr('text-anchor', 'end')
        //         .attr('class', function(d) { return 'l-' + d.key; })
        //         .text(function(d) { 
        //             if (IS_MOBILE) {
        //                 return labels[d.key]['short'];
        //             } else {
        //                 return labels[d.key]['full'];
        //             }
        //         });

        // svg.append('g')
        //     .attr('class', 'value end')
        //     .selectAll('text')
        //         .data(d3.entries(lines))
        //     .enter().append('text')
        //         .attr('x', function(d, i) { 
        //             return x(d['value'][1]['year']);
        //         })
        //         .attr('y', function(d) { 
        //             var ypos = y(d['value'][1]['amt']);
        //             if (d.key == 's_asia') {
        //                 ypos -= 3;
        //             }
        //             if (d.key == 'developing') {
        //                 ypos += 7;
        //             }
        //             if (d.key == 'world') {
        //                 ypos += 5;
        //             }
        //             if (d.key == 'n_africa') {
        //                 ypos += 4;
        //             }
        //             if (d.key == 'lat_america') {
        //                 ypos += 8;
        //             }
        //             if (d.key == 'e_asia') {
        //                 ypos += 5;
        //             }
        //             return ypos;
        //         })
        //         .attr('dx', 6)
        //         .attr('dy', 4)
        //         .attr('text-anchor', 'start')
        //         .attr('class', function(d) { return 'l-' + d.key; })
        //         .text(function(d) { 
        //             if (IS_MOBILE) {
        //                 return d['value'][1]['amt'];
        //             } else {
        //                 return d['value'][1]['amt'];
        //             }
        //         });

        // svg.append('g')
        //     .attr('class', 'label end')
        //     .selectAll('text')
        //         .data(d3.entries(lines))
        //     .enter().append('text')
        //         .attr('x', function(d, i) { 
        //             return x(d['value'][1]['year']);
        //         })
        //         .attr('y', function(d) { 
        //             var ypos = y(d['value'][1]['amt']);
        //             if (d.key == 's_asia') {
        //                 ypos -= 3;
        //             }
        //             if (d.key == 'developing') {
        //                 ypos += 7;
        //             }
        //             if (d.key == 'world') {
        //                 ypos += 5;
        //             }
        //             if (d.key == 'n_africa') {
        //                 ypos += 4;
        //             }
        //             if (d.key == 'lat_america') {
        //                 ypos += 8;
        //             }
        //             if (d.key == 'e_asia') {
        //                 ypos += 5;
        //             }
        //             return ypos;
        //         })
        //         .attr('dx', 35)
        //         .attr('dy', 4)
        //         .attr('text-anchor', 'start')
        //         .attr('class', function(d) { return 'l-' + d.key; })
        //         .text(function(d) { 
        //             if (IS_MOBILE) {
        //                 return labels[d.key]['short'];
        //             } else {
        //                 return labels[d.key]['full'];
        //             }
        //         });
        
        // axis year labels
        // svg.append('text')
        //     .attr('class', 'axis label begin')
        //     .attr('x', function() {
        //         return x(graphic_data[0]['year']) - 6;
        //     })
        //     .attr('y', -22)
        //     .attr('text-anchor', 'end')
        //     .text(year_fmt(graphic_data[0]['year']));

        // svg.append('text')
        //     .attr('class', 'axis label begin')
        //     .attr('x', function() {
        //         return x(graphic_data[0]['year']) - 6;
        //     })
        //     .attr('y', height + 11)
        //     .attr('text-anchor', 'end')
        //     .text(year_fmt(graphic_data[0]['year']));

        // svg.append('text')
        //     .attr('class', 'axis label end')
        //     .attr('x', function() {
        //         return x(graphic_data[1]['year']) + 6;
        //     })
        //     .attr('y', -22)
        //     .attr('text-anchor', 'start')
        //     .text(year_fmt(graphic_data[1]['year']));

        // svg.append('text')
        //     .attr('class', 'axis label end')
        //     .attr('x', function() {
        //         return x(graphic_data[1]['year']) + 6;
        //     })
        //     .attr('y', height + 11)
        //     .attr('text-anchor', 'start')
        //     .text(year_fmt(graphic_data[1]['year']));
    
    
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
        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;

            graphic_data.forEach(function(d) {
                d.msa = d.msa
            });

            pymChild = new pym.Child({
                renderCallback: render
            });
        });
    } else {
        // responsive iframe
        pymChild = new pym.Child();
    }
})
