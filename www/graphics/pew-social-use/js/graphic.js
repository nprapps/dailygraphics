$(document).ready(function() {
    var $graphic = $('#graphic');
    var graphic_data_url = 'data.csv';
    var graphic_data;
    var graphic_aspect_width = 16;
    var graphic_aspect_height = 9;
    
    function drawGraphic(width) {

        var margin = {top: 10, right: 15, bottom: 25, left: 35};
        var width = width - margin.left - margin.right;
        var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;
        var num_ticks = 10;
        if (width < 500) {
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
            .ticks(num_ticks);
            
        var x_axis_grid = function() { return xAxis; }

        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .tickFormat(function(d, i) {
                return d + '%';
            });
        
        var y_axis_grid = function() { return yAxis; }
        
        var line = d3.svg.line()
//            .interpolate('monotone')
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.amt); });
        
        // parse data into columns
        var lines = {};
        for (var column in graphic_data[0]) {
            if (column == 'date') continue;
            lines[column] = graphic_data.map(function(d) {
                return { 'date': d.date, 'amt': d[column] };
//            }).filter(function(d) {
//                return d.amt.length;
            });
        }
        
        var svg = d3.select('#graphic').append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        x.domain(d3.extent(graphic_data, function(d) { return d.date; }));

        y.domain([
            0,
//            d3.max(d3.entries(lines), function(c) { return d3.max(c.value, function(v) { return v.amt; }); })
            d3.max(d3.entries(lines), function(c) { 
                return d3.max(c.value, function(v) { 
                    var n = parseInt(v.amt);
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
        
        sendHeightToParent();
    }
    
    function setup() {
        if (Modernizr.svg) {
            d3.csv(graphic_data_url, function(error, data) {
                graphic_data = data;

                graphic_data.forEach(function(d) {
                    d.date = d3.time.format('%b-%y').parse(d.date);
                    d.amt = parseInt(d.amt);
                });

                setupResponsiveChild({
                    renderCallback: drawGraphic 
                });
            });
        }
    }
    
    setup();
});
