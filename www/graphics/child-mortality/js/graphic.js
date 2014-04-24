var $graphic;
var graphic_data;
var graphic_data_url = 'data.csv';
var IS_MOBILE;
var mobile_threshold = 480;
var num_ticks;
var pymChild = null;
var min_height = 610;
var height_ratio = 3;
var width_ratio = 4;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var labels = {
    'world': { 'full': 'World', 'short': 'World' },
    'developed': { 'full': 'Developed regions', 'short': 'Developed' },
    'developing': { 'full': 'Developing regions', 'short': 'Developing' },
    'n_africa': { 'full': 'Northern Africa', 'short': 'N. Africa' },
    'sub_africa': { 'full': 'Sub-Saharan Africa', 'short': 'Sub-Saharan' },
    'lat_america': { 'full': 'Latin America', 'short': 'Lat. America' },
    'c_asia': { 'full': 'Central Asia', 'short': 'Central Asia' },
    'e_asia': { 'full': 'Eastern Asia', 'short': 'E. Asia' },
    's_asia': { 'full': 'Southern Asia', 'short': 'S. Asia' },
    'se_asia': { 'full': 'Southeastern Asia', 'short': 'S.E. Asia' },
    'w_asia': { 'full': 'Western Asia', 'short': 'W. Asia' },
    'oceania': { 'full': 'Oceania', 'short': 'Oceania' }
};


/*
 * Render the graphic
 */
function render(width) {
    if (Modernizr.svg) {
        var margin = {top: 32, right: 150, bottom: 25, left: 150};
        var year_fmt = d3.time.format('%Y');

        if (width < mobile_threshold) {
            num_ticks = 5;
            margin.left = 110;
            margin.right = 110;
            IS_MOBILE = true;
        } else {
            num_ticks = 10;
            margin.left = 150;
            margin.right = 150;
            IS_MOBILE = false;
        }

        var width = width - margin.left - margin.right;
        var height = min_height - margin.top - margin.bottom;

        // clear out existing graphics
        $graphic.empty();

        var x = d3.time.scale()
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);
        
        var line = d3.svg.line()
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
       
        var svg = d3.select('#graphic').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(d3.extent(graphic_data, function(d) { return d.year; }));

        y.domain([0,
            d3.max(d3.entries(lines), function(c) { 
                return d3.max(c.value, function(v) { 
                    var n = v.amt;
                    return Math.ceil(n);
                    return Math.ceil(n/10) * 10; // round to next 10
                }); 
            })
        ]);
        
        svg.append('g').selectAll('path')
            .data(d3.entries(lines))
            .enter()
            .append('path')
                .attr('class', function(d, i) {
                    return 'line line-' + i + ' ' + d.key;
                })
                .attr('d', function(d) {
                    return line(d.value);
                });

        svg.append('g')
            .attr('class', 'value begin')
            .selectAll('text')
                .data(d3.entries(lines))
            .enter().append('text')
                .attr('x', function(d, i) { 
                    return x(d['value'][0]['year']);
                })
                .attr('y', function(d) { 
                    var ypos = y(d['value'][0]['amt']);
                    if (d.key == 'oceania') {
                        ypos -= 12;
                    }
                    if (d.key == 'n_africa') {
                        ypos -= 4;
                    }
                    if (d.key == 'c_asia') {
                        ypos += 6;
                    }
                    if (d.key == 'e_asia') {
                        ypos += 10;
                    }
                    if (d.key == 'se_asia') {
                        ypos += 11;
                    }
                    if (d.key == 'w_asia') {
                        ypos += 3;
                    }
                    return ypos;
                })
                .attr('dx', -6)
                .attr('dy', 4)
                .attr('text-anchor', 'end')
                .attr('class', function(d) { return 'l-' + d.key; })
                .text(function(d) { 
                    if (IS_MOBILE) {
                        return d['value'][0]['amt'];
                    } else {
                        return d['value'][0]['amt'];
                    }
                });

        svg.append('g')
            .attr('class', 'label begin')
            .selectAll('text')
                .data(d3.entries(lines))
            .enter().append('text')
                .attr('x', function(d, i) { 
                    return x(d['value'][0]['year']);
                })
                .attr('y', function(d) { 
                    var ypos = y(d['value'][0]['amt']);
                    if (d.key == 'oceania') {
                        ypos -= 12;
                    }
                    if (d.key == 'n_africa') {
                        ypos -= 4;
                    }
                    if (d.key == 'c_asia') {
                        ypos += 6;
                    }
                    if (d.key == 'e_asia') {
                        ypos += 10;
                    }
                    if (d.key == 'se_asia') {
                        ypos += 11;
                    }
                    if (d.key == 'w_asia') {
                        ypos += 3;
                    }
                    return ypos;
                })
                .attr('dx', -35)
                .attr('dy', 4)
                .attr('text-anchor', 'end')
                .attr('class', function(d) { return 'l-' + d.key; })
                .text(function(d) { 
                    if (IS_MOBILE) {
                        return labels[d.key]['short'];
                    } else {
                        return labels[d.key]['full'];
                    }
                });

        svg.append('g')
            .attr('class', 'value end')
            .selectAll('text')
                .data(d3.entries(lines))
            .enter().append('text')
                .attr('x', function(d, i) { 
                    return x(d['value'][1]['year']);
                })
                .attr('y', function(d) { 
                    var ypos = y(d['value'][1]['amt']);
                    if (d.key == 's_asia') {
                        ypos -= 3;
                    }
                    if (d.key == 'developing') {
                        ypos += 7;
                    }
                    if (d.key == 'world') {
                        ypos += 5;
                    }
                    if (d.key == 'n_africa') {
                        ypos += 4;
                    }
                    if (d.key == 'lat_america') {
                        ypos += 8;
                    }
                    if (d.key == 'e_asia') {
                        ypos += 5;
                    }
                    return ypos;
                })
                .attr('dx', 6)
                .attr('dy', 4)
                .attr('text-anchor', 'start')
                .attr('class', function(d) { return 'l-' + d.key; })
                .text(function(d) { 
                    if (IS_MOBILE) {
                        return d['value'][1]['amt'];
                    } else {
                        return d['value'][1]['amt'];
                    }
                });

        svg.append('g')
            .attr('class', 'label end')
            .selectAll('text')
                .data(d3.entries(lines))
            .enter().append('text')
                .attr('x', function(d, i) { 
                    return x(d['value'][1]['year']);
                })
                .attr('y', function(d) { 
                    var ypos = y(d['value'][1]['amt']);
                    if (d.key == 's_asia') {
                        ypos -= 3;
                    }
                    if (d.key == 'developing') {
                        ypos += 7;
                    }
                    if (d.key == 'world') {
                        ypos += 5;
                    }
                    if (d.key == 'n_africa') {
                        ypos += 4;
                    }
                    if (d.key == 'lat_america') {
                        ypos += 8;
                    }
                    if (d.key == 'e_asia') {
                        ypos += 5;
                    }
                    return ypos;
                })
                .attr('dx', 35)
                .attr('dy', 4)
                .attr('text-anchor', 'start')
                .attr('class', function(d) { return 'l-' + d.key; })
                .text(function(d) { 
                    if (IS_MOBILE) {
                        return labels[d.key]['short'];
                    } else {
                        return labels[d.key]['full'];
                    }
                });
        
        // axis year labels
        svg.append('text')
            .attr('class', 'axis label begin')
            .attr('x', function() {
                return x(graphic_data[0]['year']) - 6;
            })
            .attr('y', -22)
            .attr('text-anchor', 'end')
            .text(year_fmt(graphic_data[0]['year']));

        svg.append('text')
            .attr('class', 'axis label begin')
            .attr('x', function() {
                return x(graphic_data[0]['year']) - 6;
            })
            .attr('y', height + 11)
            .attr('text-anchor', 'end')
            .text(year_fmt(graphic_data[0]['year']));

        svg.append('text')
            .attr('class', 'axis label end')
            .attr('x', function() {
                return x(graphic_data[1]['year']) + 6;
            })
            .attr('y', -22)
            .attr('text-anchor', 'start')
            .text(year_fmt(graphic_data[1]['year']));

        svg.append('text')
            .attr('class', 'axis label end')
            .attr('x', function() {
                return x(graphic_data[1]['year']) + 6;
            })
            .attr('y', height + 11)
            .attr('text-anchor', 'start')
            .text(year_fmt(graphic_data[1]['year']));
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
    if (Modernizr.svg) {
        d3.csv(graphic_data_url, function(error, data) {
            graphic_data = data;

            graphic_data.forEach(function(d) {
                d.year = d3.time.format('%Y').parse(d.year);
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
