var $graphic;
var graphic_aspect_width = 4;
var graphic_aspect_height = 3;
var mobile_threshold = 550;
var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var graphic_data_donors = [
    { "year": "2008", "men": 59.6, "women": 31.1 },
    { "year": "2010", "men": 64.3, "women": 26.4 },
    { "year": "2012", "men": 60.4, "women": 30.3 }
];

var graphic_data_donations = [
    { "year": "2008", "men": 64.6, "women": 29.2 },
    { "year": "2010", "men": 69.7, "women": 24.4 },
    { "year": "2012", "men": 68, "women": 27.1 }
];

var graphic_mega_donors = [
    { "year": "2008", "men": 72, "women": 27 },
    { "year": "2010", "men": 75, "women": 24 },
    { "year": "2012", "men": 74, "women": 24 }
];

var labels = {
    "donors": "All Donors, By Gender<br />($200&nbsp;And&nbsp;Up)",
    "donations": "All Donations, By Gender<br />($200&nbsp;And&nbsp;Up)",
    "mega-donors": "Mega Donors, By Gender<br />($95,000&nbsp;And&nbsp;Up)"
};

/*
 * Render the graphic
 */
function draw_graphic(width) {
    if (Modernizr.svg) {
        // clear out existing graphics
        $graphic.empty();
    
        // load in new graphics
        render_chart(graphic_data_donors, 'donors', width)
//        render_chart(graphic_data_donations, 'donations', width)
        render_chart(graphic_mega_donors, 'mega-donors', width)
    }
}
function render_chart(data, id, container_width) {
    var graphic_data = data;
    var is_mobile = false;
    var last_data_point = graphic_data.length - 1;
    var margin = { top: 10, right: 30, bottom: 25, left: 40 };
    var num_ticks = 4;
    var width = container_width;

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
        width = Math.floor(((container_width - 11) * 2/3) - margin.left - margin.right);
        num_ticks = 3;
    } else {
        width = Math.floor(((container_width - 22) / 2) - margin.left - margin.right);
    }

    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

    var x = d3.time.scale()
        .range([0, width]);

    var y = d3.scale.linear()
        .range([height, 0]);
    
    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom")
        .ticks(3);
        
    var x_axis_grid = function() { return xAxis; }

    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks)
        .tickFormat(function(d,i) {
            return d + '%';
        });
    
    var y_axis_grid = function() { return yAxis; }
    
    var line = d3.svg.line()
        .interpolate('monotone')
        .x(function(d) { return x(d.year); })
        .y(function(d) { return y(d.amt); });
    
    // parse data into columns
    var lines = {};
    for (var column in graphic_data[0]) {
        if (column == 'year') continue;
        lines[column] = graphic_data.map(function(d) {
            return { 
                'year': d.year, 
                'amt': d[column]
            };
        });
    }
   
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
                return 'width: ' + ((container_width - 11) / 3) + 'px';
            }
        });
    
    var headline = meta.append('h1')
        .html(labels[id]);

    var legend = meta.append('ul')
            .attr('class', 'key')
            .selectAll('g')
                .data(d3.entries(lines))
            .enter().append('li')
                .attr('class', function(d, i) { return 'key-item key-' + i + ' ' + d.key.replace(' ', '-').toLowerCase(); });
    legend.append('b')
    legend.append('label')
        .text(function(d) {
            return d.key
        });


    var svg = container.append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    x.domain(d3.extent(graphic_data, function(d) { return d.year; }));
    y.domain([0,100]);
    
    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'x grid')
        .attr('transform', 'translate(0,' + height + ')')
        .call(x_axis_grid()
            .tickSize(-height, 0, 0)
            .tickFormat('')
        );

    svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0, 0)
            .tickFormat('')
        );

    svg.append('g').selectAll('path')
        .data(d3.entries(lines))
        .enter()
        .append('path')
            .attr('class', function(d, i) {
                return 'line line-' + i;
            })
            .attr('d', function(d) {
                return line(d.value);
            });

    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(d3.entries(lines))
        .enter()
        .append('text')
            .attr('x', function(d) { 
                return x(d['value'][last_data_point]['year']) + 6;
            })
            .attr('y', function(d) { 
                return y(d['value'][last_data_point]['amt'] - 1);
            })
            .attr('text-anchor', 'left')
            .text(function(d) { 
                return d3.round(d['value'][last_data_point]['amt']) + '%' 
            });

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
        // format datestamps
        graphic_data_donors.forEach(function(d) {
            d.year = d3.time.format('%Y').parse(d.year);
        });
        graphic_data_donations.forEach(function(d) {
            d.year = d3.time.format('%Y').parse(d.year);
        });
        graphic_mega_donors.forEach(function(d) {
            d.year = d3.time.format('%Y').parse(d.year);
        });
        
        // setup pym
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    } else {
        pymChild = new pym.Child();
    }
})
