var $graphic = $('#graphic');

var  graphic_aspect_width = 3;
var graphic_aspect_height = 3.4;
var graphic_data_url = 'data.csv';
var graphic_data;
var mobile_threshold = 540;
var pymChild = null;
var is_mobile = false;



var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};


/*
 * Render the graphic
 */
function render(width) {
    var graphic_width;
    var margin = { top: 30, right: 20, bottom: 30, left: 30 };

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
             graphic_aspect_width = 3;
             graphic_aspect_height = 4;
             margin = { top: 30, right: 35, bottom: 30, left: 30 };
             
            graphic_width = Math.floor(((width - 11) ) - margin.left - margin.right);
        } else {
            graphic_width = Math.floor((width - 10) - margin.left - margin.right);
    }

    drawGraph(graphic_width, is_mobile);

    if (pymChild) {
        pymChild.sendHeightToParent();
    }
}


function drawGraph(width, is_mobile) {
 var color = d3.scale.ordinal()
                 .range(['#6C2315', '#A23520', '#D8472B', '#E27560', '#ECA395', '#F5D1CA',
                '#714616', '#AA6A21', '#E38D2C', '#EAAA61', '#F1C696', '#F8E2CA',
                '#77631B',  '#B39429',  '#EFC637',  '#F3D469',  '#F7E39B',  '#FBF1CD',
                '#0B403F',  '#11605E',  '#17807E',  '#51A09E',  '#8BC0BF',  '#C5DFDF',
                '#28556F',  '#3D7FA6',  '#51AADE',  '#7DBFE6',  '#A8D5EF',  '#D3EAF7']); // colors


    if (is_mobile) {
        var margin = { top: -30, right: 130, bottom: 30, left: 40 };
        var num_x_ticks = 5;
        var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width*1.7) - margin.top - margin.bottom;        
    } else {
        var margin = { top: -30, right: 40, bottom: 30, left: 40 };            
        var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        
        // var num_ticks = 5;
        var num_x_ticks = 10;
    }

    // clear out existing graphics
    $graphic.empty();

    x = d3.time.scale().range([0, width]);
    y = d3.scale.linear().range([height, 0]);
    // // var formatPercent =  d3.format("d");
    // var fmt = d3.time.format('%m/%Y');

    svg = d3.select('#graphic')
        .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
        .append('g')
            .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom')
        .ticks(num_x_ticks)            
        .tickSize(5);

    var x_axis_grid = function() { return xAxis; };

    var yAxis = d3.svg.axis()
        .orient('left')
        .scale(y)
        .tickSize(3);
        // .tickFormat(formatPercent);
    var y_axis_grid = function() { return yAxis; };

    var line = d3.svg.line()
        .interpolate('basis')
        .x(function(d) { return x(d.date); })
        .y(function(d) { return y(d.indexed); });
    color.domain(d3.keys(graphic_data[0]).filter(function(key) { return key !== 'date'; }));

    var formatted_data = color.domain().map(function(name) {
        return {
            name: name,
            values: graphic_data.map(function(d) {
                return {date: d.date, indexed: +d[name]};
            })
        };
    });

    // Scale the range of the data
    x.domain(d3.extent(graphic_data, function(d) { return d3.round(d.date); }));
    y.domain([0,7]);

    var lines = svg.selectAll('path')
        .data(formatted_data)
        .enter().append('path')
        .attr('class', "lines")      
        .attr("d", function(d) { return line(d.values); });

    var xBottom = svg.append('g') // Add the X Axis
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    var yTop = svg.append('g') // Add the Y Axis
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + -width/100 + ',0)')
        .call(yAxis);

    var yGrid = svg.append('g')         
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        );
  


}


/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');

        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;

            graphic_data.forEach(function(d) {
                // d.date = +d.date;
                d.date = d3.time.format('%m/%d/%y').parse(d.date);
            });

           var pymChild = new pym.Child({
                renderCallback: render
            });
        });
    } else {
        pymChild = new pym.Child({ });
    }
})