var $graphic;
var bar_gap = 10;
var bar_height = 25;
var graphic_aspect_width = 16;
var graphic_aspect_height = 9;
var mobile_threshold = 625;
var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var graphic_data_race = [
    { "label": "Black", "deaths": 317 },
    { "label": "Hispanic", "deaths": 15 },
    { "label": "White", "deaths": 11 },
    { "label": "Other", "deaths": 5 }
];

var graphic_data_age = [
    { "label": "0-9", "deaths": 9 },
    { "label": "10-19", "deaths": 49 },
    { "label": "20-29", "deaths": 136 },
    { "label": "30-39", "deaths": 85 },
    { "label": "40-49", "deaths": 39 },
    { "label": "50-59", "deaths": 20 },
    { "label": "60-69", "deaths": 5 },
    { "label": "70+", "deaths": 3 }
];

var labels = {
    "race": "Murder Victims By Race, 2012-13",
    "age": "Murder Victims By Age Group, 2012-13"
};

/*
 * Render the graphic
 */
function draw_graphic(width) {
    if (Modernizr.svg) {
        // clear out existing graphics
        $graphic.empty();
    
        // load in new graphics
        render_chart(graphic_data_race, 'race', width)
        render_chart(graphic_data_age, 'age', width)
    }
}
function render_chart(data, id, container_width) {
    var graphic_data = data;
    var is_mobile = false;
    var last_data_point = graphic_data.length - 1;
    var margin = { top: 10, right: 10, bottom: 35, left: 30 };
    var num_bars = graphic_data.length;
    var num_ticks = 4;
    var width = container_width;

    if (width <= mobile_threshold) {
        is_mobile = true;
        width = container_width - margin.left - margin.right;
    } else {
        width = Math.floor(((container_width - 44) / 2) - margin.left - margin.right);
    }
    
    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;

    var x = d3.scale.ordinal()
        .rangeRoundBands([0, width], .1)
        .domain(graphic_data.map(function(d) { return d.label; }));

    var y = d3.scale.linear()
        .range([height, 0])
        .domain([0, 400]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient('bottom');
    
    var yAxis = d3.svg.axis()
        .scale(y)
        .orient('left')
        .ticks(num_ticks);

    var y_axis_grid = function() { return yAxis; }
    
    var container = d3.select('#graphic').append('div')
        .attr('id', 'graph-' + id)
        .attr('class', 'graph')
        .attr('style', function(d) {
            if (!is_mobile) {
                return 'width: ' + (width + margin.left + margin.right) + 'px';
            }
        });

    var headline = container.append('h3')
            .text(labels[id]);
    
    var svg = container.append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    svg.append('g')
        .attr('class', 'y grid')
        .call(y_axis_grid()
            .tickSize(-width, 0)
            .tickFormat('')
        );

    svg.append('g')
        .attr('class', 'bars')
        .selectAll('rect')
            .data(graphic_data)
        .enter().append('rect')
            .attr("x", function(d) { return x(d.label); })
            .attr("y", function(d) { return y(d.deaths); })
            .attr("width", x.rangeBand())
            .attr("height", function(d){ return height - y(d.deaths); })
            .attr('class', function(d, i) {
                return 'bar bar-' + i;
            });
                
    svg.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(graphic_data)
        .enter().append('text')
            .attr('x', function(d, i) { 
                return x(d.label) + (x.rangeBand() / 2);
            })
            .attr('y', function(d) { 
                return y(d.deaths) - 6;
            })
            .attr('text-anchor', 'middle')
            .text(function(d) { return d.deaths; });

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
