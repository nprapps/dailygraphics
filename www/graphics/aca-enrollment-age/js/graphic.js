$(document).ready(function() {
    var $graphic = $('#graphic');
    var graphic_data_url = 'enrollment.csv';
    var graphic_data;
    
    function drawGraphic(width) {
        var bar_height = 25;
        var bar_gap = 10;
        var num_bars = graphic_data.length;
        var margin = { top: 0, right: 50, bottom: 25, left: 85 };
        var width = width - margin.left - margin.right;
        var height = ((bar_height + bar_gap) * num_bars);
        
        // clear out existing graphics
        $graphic.empty();

        var x = d3.scale.linear()
//            .domain([0, d3.max(graphic_data, function(d) { return parseInt(d.pct_enrolled); })])
            .domain([0, d3.max(graphic_data, function(d) { 
                var n = parseInt(d.pct_enrolled)
                return Math.ceil(n/5) * 5; // round to next 5
            })])
            .range([0, width]);

        var y = d3.scale.linear()
            .range([height, 0]);
        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .ticks(7);
            
        var x_axis_grid = function() { return xAxis; }

        var svg = d3.select('#graphic').append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        
        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + height + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + height + ')')
            .call(x_axis_grid()
                .tickSize(-height, 0, 0)
                .tickFormat('')
            );

        svg.append('g')
            .attr('class', 'bars')
            .selectAll('rect')
                .data(graphic_data)
            .enter().append('rect')
                .attr("y", function(d, i) { return i * (bar_height + bar_gap); })
                .attr("width", function(d){ return x(d.pct_enrolled); })
                .attr("height", bar_height)
                .attr('class', function(d) { return 'age-' + d.age_group.replace(/\s+/g, '-').toLowerCase() });
        
        svg.append('g')
            .attr('class', 'value')
            .selectAll('text')
                .data(graphic_data)
            .enter().append('text')
                .attr('x', function(d) { return x(parseInt(d.pct_enrolled)) })
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', 6)
                .attr('dy', 17)
                .attr('text-anchor', 'start')
                .attr('class', function(d) { return 'age-' + d.age_group.replace(/\s+/g, '-').toLowerCase() })
                .text(function(d) { return d.pct_enrolled + '%' });
        
        svg.append('g')
            .attr('class', 'label')
            .selectAll('text')
                .data(graphic_data)
            .enter().append('text')
                .attr('x', 0)
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', -6)
                .attr('dy', 17)
                .attr('text-anchor', 'end')
                .attr('class', function(d) { return 'age-' + d.age_group.replace(/\s+/g, '-').toLowerCase() })
                .text(function(d) { return d.age_group });

        sendHeightToParent();
    }
    
    function setup() {
        if (Modernizr.svg) {
            d3.csv(graphic_data_url, function(error, data) {
                graphic_data = data;

                setupResponsiveChild({
                    renderCallback: drawGraphic 
                });
            });
        }
    }
    
    setup();
});
