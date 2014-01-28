$(window).load(function() {
    var $charts = $('.chart')

    var graphic_data_url = 'costs.csv';
    var graphic_data;
    var height = 75;
    var num_bars;
    
    function drawGraphic(width) {
        // clear out existing graphics
        $charts.empty();

        drawChart('standard', width);
        drawChart('halogen', width);
        drawChart('cfl', width);
        drawChart('led', width);
    }
    
    function drawChart(id, width) {
        var margin = { top: 10, right: 0, bottom: 35, left: 30 };
//        var width = (width / 5) - margin.left - margin.right;
        var width = $('.bulb-info').width() - margin.left - margin.right;
        
        var x = d3.scale.ordinal()
            .rangeRoundBands([0, width], .1)
            .domain(graphic_data.map(function(d) { return d.year; }));

        var y = d3.scale.linear()
            .range([height, 0])
            .domain([0, d3.max(graphic_data, function(d) { 
                var n = parseInt(d.standard);
                return Math.ceil(n/5) * 5; // round to next 5
            })]);
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .tickSize(6,0);
            
        var num_ticks = num_bars / 2;
            
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient('left')
            .ticks(num_ticks)
            .tickFormat(function(d, i) {
                if (i == num_ticks) {
                    return '$' + d;
                } else {
                    return d;
                }
            });

        var y_axis_grid = function() { return yAxis; }
        
        var svg = d3.select('#costs-' + id).append('svg')
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
                .attr("x", function(d) { return x(d.year); })
                .attr("y", function(d) { return y(d[id]); })
                .attr("width", x.rangeBand())
                .attr("height", function(d){ return height - y(d[id]); })
                .attr('class', function(d) { return 'year-' + d.year.replace(/\s+/g, '-').toLowerCase() });

        svg.append('text')
            .attr('class', 'x axis-label')
            .attr('x', width / 2)
            .attr('y', height + margin.top + margin.bottom - 12)
            .attr('text-anchor', 'middle')
            .text('Year of ownership');


        /* update responsive iframe */
        sendHeightToParent();
    }
    
    function setup() {
        if (Modernizr.svg) {
            d3.csv(graphic_data_url, function(error, data) {
                graphic_data = data;
                num_bars = graphic_data.length;

                setupResponsiveChild({
                    renderCallback: drawGraphic 
                });
            });
        } else {
            setupResponsiveChild();
        }
    }
    
    setup();
});
