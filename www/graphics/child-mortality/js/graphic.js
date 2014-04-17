var $graphic;
var mobile_threshold = 480;
var pymChild = null;
var height_ratio = 9;
var width_ratio = 16;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};
var graphic_data = {
    "world": { "title": "World", "1990": 90, "2012": 48 },
    "developed": { "title": "Developed regions", "1990": 15, "2012": 6 },
    "developing": { "title": "Developing regions", "1990": 99, "2012": 53 },
    "northern_africa": { "title": "Northern Africa", "1990": 73, "2012": 22 },
    "sub_saharan_africa": { "title": "Sub-Saharan Africa", "1990": 177, "2012": 98 },
    "latin_america": { "title": "Latin America and the Caribbean", "1990": 54, "2012": 19 },
    "caucasus": { "title": "Caucasus and Central Asia", "1990": 73, "2012": 36 },
    "eastern_asia": { "title": "Eastern Asia", "1990": 53, "2012": 14 },
    "southern_asia": { "title": "Southern Asia", "1990": 126, "2012": 58 },
    "southeast_asia": { "title": "South-eastern Asia", "1990": 71, "2012": 30 },
    "western_asia": { "title": "Western Asia", "1990": 65, "2012": 25 },
    "oceania": { "title": "Oceania", "1990": 74, "2012": 55 }
};


/*
 * Render the graphic
 */
function render(width) {
    // TODO: draw your graphic
    if (Modernizr.svg) {
        var margin = {top: 10, right: 15, bottom: 25, left: 35};
        var width = width - margin.left - margin.right;
        var height = Math.ceil((width * height_ratio) / width_ratio) - margin.top - margin.bottom;
        var num_ticks = 13;
        if (width < mobile_threshold) {
            num_ticks = 5;
        }

        // clear out existing graphics
        $graphic.empty();

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickFormat(function(d,i) {
                if (width <= mobile_threshold) {
                    var fmt = d3.time.format('%y');
                    return '\u2019' + fmt(d);
                } else {
                    var fmt = d3.time.format('%Y');
                    return fmt(d);
                }
            });
            
        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(num_ticks);
        
        var y_axis_grid = function() { return yAxis; }
        
        var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.amt); });
        
        // parse data into columns
        var lines = {};
        for (var column in graphic_data[0]) {
            if (column == 'date') continue;
            lines[column] = graphic_data.map(function(d) {
                return { 
                    'date': d.date, 
                    'amt': d[column]
                };
            });
        }
       
        var svg = d3.select('#graphic').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(d3.extent(graphic_data, function(d) { return d.date; }));

        y.domain([
            d3.min(d3.entries(lines), function(c) { 
                return d3.min(c.value, function(v) { 
                    var n = v.amt;
                    return Math.floor(n);
//                    return Math.floor(n/10) * 10; // round to next 10
                }); 
            }),
            d3.max(d3.entries(lines), function(c) { 
                return d3.max(c.value, function(v) { 
                    var n = v.amt;
                    return Math.ceil(n);
//                    return Math.ceil(n/10) * 10; // round to next 10
                }); 
            })
        ]);
        
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
    $graphic = $('#graphic');

    console.log(graphic_data);

    // responsive iframe
    var pymChild = new pym.Child({
        renderCallback: render
    });
})
