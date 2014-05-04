
// Poverty%

var $graphic;
var graphic_aspect_width = 3;
var graphic_aspect_height = 3;
var mobile_threshold = 625;
var pymChild = null;
var col = 5;


/*
 * Render the graphic
 */
function draw_graphic(width) {
    var cfill = 20;
    var cnofill = 100-cfill;
    if (Modernizr.svg) {
        // clear out existing graphics
        $graphic.empty();
    
        for (var i=0;i<cfill;i++)
        {
            render_chart( "filled", width, col);
        }
 
        for (var i=0;i<cnofill;i++)
        {
            render_chart( "nofill", width, col);
        }        

        // // load in new graphics
        // render_chart( "filled", width, col);
        // render_chart( "filled", width, col);
        // render_chart( "filled", width, col);
        // render_chart( "filled", width, col);
        // render_chart( "nofill", width, col);
        // render_chart( "nofill", width, col);
        // render_chart( "nofill", width, col);
        // // render_chart(, 'k150', width, col);
        // render_chart( "nofill", width, col);
    }
}


function render_chart(id, container_width,col_width) {
    // var graphic_data = data;
    var is_mobile = false;
    // var last_data_point = graphic_data.length - 1;
    var margin = { top: 3, right: 3, bottom: 3, left: 3 };
    var num_ticks = 5;
    var width = container_width*3/4;

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
        width = Math.floor(((width - 11) / (col_width*1.5) ) - margin.left - margin.right);
//        width = width - margin.left - margin.right;
    } else {
        width = Math.floor(((width - 44) / col_width) - margin.left - margin.right);
    }

    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

    var x = d3.scale.linear()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(num_ticks);
        
    var x_axis_grid = function() { return xAxis; };

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks)
        .tickFormat(function(d,i) {
            return d + '%';
        });
    
    var y_axis_grid = function() { return yAxis; };
    
    // var line = d3.svg.line()
    //     .interpolate('monotone')
    //     .x(function(d) { return x(d.yr); })
    //     .y(function(d) { return y(d.amt); });
    
    // parse data into columns
    // var lines = {};
    // for (var column in graphic_data[0]) {
    //     if (column == 'yr') continue;
    //     lines[column] = graphic_data.map(function(d) {
    //         return {
    //             'yr': d.yr,
    //             'amt': d[column]
    //         };
    //     });
    // }
   
    var container = d3.select('#graphic')
        .append('div')
            .attr('id', 'graph-' + id)
            .attr('class', 'graph')
            .attr('style', function(d) {
                if (!is_mobile) {
                    return 'width: ' + (width + margin.left + margin.right) + 'px';
                }
            });
    
    var meta = container.append('div')
        .attr('class', 'meta')
        .attr('style', function(d) {
            if (is_mobile) {
                return 'width: ' + ((width - 11) / (col_width*1.5)  ) + 'px';
            }
        });
    
    // var headline = meta.append('h3')
    //     .html(labels[id]);

    // var legend = meta.append('ul')
    //         .attr('class', 'key')
    //         .selectAll('g')
    //             .data(d3.entries(lines))
    //         .enter().append('li')
    //             .attr('class', function(d, i) { return 'key-item key-' + i + ' ' + d.key.replace(' ', '-').toLowerCase(); });
    // legend.append('b')
    // legend.append('label')
    //     .text(function(d) {
    //         return d.key
    //     });


    var svg = container.append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    // x.domain(d3.extent(graphic_data_4, function(d) { return d.yr; }));
    // y.domain([0,100]);
    

    // var rect = svg.append("rect")
    // .attr("class", "day")
    // .attr("width", width)
    // .attr("height", width)
    // .style("fill", function(d) {
    //     if (id == "filled") {
    //         return "dodgerblue";
    //         } else {
    //         return "#CCC";
    //        }
    //     });

    // var dot = svg.append("circle")
    // .attr("class", "day")
    // // .attr("width", width)
    // .attr("r", width/2)
    // .style("fill", function(d) {
    //     if (id == "filled") {
    //         return "dodgerblue";
    //         } else {
    //         return "#CCC";
    //        }
    //     });


    // svg.append("use").attr("xlink:href","#usa");



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
