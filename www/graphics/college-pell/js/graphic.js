$(document).ready(function() {
    var $graphic = $('#graphic');
    var graphic_data_url = 'data.csv';
    var graphic_data;
    var graphic_aspect_width = 16;
    var graphic_aspect_height = 9;
    var mobile_threshold = 500;
    
    var labels = [ 'Four-year public universities', 'Four-year private universities' ];
        
    function drawGraphic(width) {

        var margin = {top: 10, right: 15, bottom: 25, left: 35};
        var width = width - margin.left - margin.right;
        var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;
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
        
        var formatAsPercentage = d3.formatPrefix('%',0);

        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(num_ticks)
            .tickFormat(function(d,i) {
                if (width >= mobile_threshold) {
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
            .ticks(num_ticks)
            .tickFormat(function(d, i) {
                return d + '%';
            });
        
        var y_axis_grid = function() { return yAxis; }
        
        var line = d3.svg.line()
//            .interpolate('monotone')
            .x(function(d) { return x(d.year); })
            .y(function(d) { return y(d.amt); });
        
        // parse data into columns
        var lines = {};
        for (var column in graphic_data[0]) {
            if (column == 'year') continue;
            lines[column] = graphic_data.map(function(d) {
                return { 
                    'year': d.year, 
                    'amt': d[column] * 100
                };
            });
        }
       
        var legend = d3.select('#graphic').append('ul')
                .attr('class', 'key')
            .selectAll('g')
                .data(d3.entries(lines))
            .enter().append('li')
                .attr('class', function(d, i) { return 'key-item key-' + i + ' ' + d.key.replace(' ', '-').toLowerCase(); });
        legend.append('b');
        legend.append('label')
            .text(function(d,i) { return labels[i]; });

        var svg = d3.select('#graphic').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(d3.extent(graphic_data, function(d) { return d.year; }));

        y.domain([
            0,
            d3.max(d3.entries(lines), function(c) { 
                return d3.max(c.value, function(v) { 
                    var n = v.amt;
                    return Math.ceil(n/10) * 10; // round to next 10
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
                    return 'line line-' + i + ' ' + d.key.replace(' ', '-').toLowerCase();
                })
                .attr('d', function(d) {
                    return line(d.value);
                });
        
        /*
        svg.append('g').selectAll('text')
            .data(d3.entries(lines))
            .enter()
                .append('text')
                    .attr('x', 5)
                    .attr('y', 5)
                    .attr('dx', -6)
                    .attr('dy', 28)
                    .attr('text-anchor', 'end')
                    .attr('class', function(d) { return 'value value-' + d.key.replace(' ', '-').toLowerCase() })
                    .text(function(d) { console.log(d); return d.value });
        */
        
        sendHeightToParent();
    }
    
    function setup() {
        if (Modernizr.svg) {
            d3.csv(graphic_data_url, function(error, data) {
                graphic_data = data;

                graphic_data.forEach(function(d) {
                    d.year = d3.time.format('%Y').parse(d.year);
                });

                setupResponsiveChild({
                    renderCallback: drawGraphic 
                });
            });
        }
    }
    
    setup();
});
