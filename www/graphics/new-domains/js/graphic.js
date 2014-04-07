var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

/*
 * TODO: draw your graphic
 */

var $graphic = $('#graphic');
    var graphic_data_url = 'domain.csv';
	var graphic_data;
    var bar_height = 30;
    var bar_gap = 3;
    format = d3.format("0,000");


d3.selection.prototype.moveToFront = function() {
  return this.each(function(){
    this.parentNode.appendChild(this);
  });
};


   function drawGraphic(width) {
        // clear out existing graphics
        $graphic.empty();

        drawChart(width);
        console.log(graphic_data);
    }
    
    function drawChart( width) {
        var num_bars = graphic_data.length;
        
        var tick_count = 8;
        if (width <= 580) {
            tick_count = 5;
        }
        
        var margin = { top: 30, right: 50, bottom: 35, left: 100 };
        var width = width - margin.left - margin.right;
        var height = ((bar_height + bar_gap) * num_bars);
        
        var x = d3.scale.linear()
            .range([0, width])
            .domain([0,50000]);

        
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient('bottom')
            .ticks(tick_count);
        var xAxis2 = d3.svg.axis()
            .scale(x)
            .orient('top')
            .ticks(tick_count);
            
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
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,-1)')
            .call(xAxis2);

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
                .attr("width", function(d){ return x(d.total); })
                .attr("height", bar_height)
                .attr('class', function(d) { return 'bar-' + d.domain.replace(/\s+/g, '-').toLowerCase() });
        
        svg.append('g')
            .attr('class', 'value')
            .selectAll('text')
                .data(graphic_data)
            .enter().append('text')
                .attr('x', function(d) { return x(d.total) })
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', 42)
                .attr('dy', 20)
                .attr('text-anchor', 'end')
                .attr('class', function(d) { return 'l-' + d.domain.replace(/\s+/g, '-').toLowerCase() })
                .text(function(d) { return format(d.total)});

        svg.append('g')
            .attr('class', 'label')
            .selectAll('text')
                .data(graphic_data)
            .enter().append('text')
                .attr('x', "0")
                .attr('y', function(d, i) { return i * (bar_height + bar_gap); })
                .attr('dx', -10)
                .attr('dy', 20)
                .attr('text-anchor', 'end')
                .attr('class', function(d) { return 'l-' + d.domain.replace(/\s+/g, '-').toLowerCase() })
                .text(function(d) { return "."+ d.domain.toLowerCase()});
        
      
        /* update responsive iframe */
        sendHeightToParent();


}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
            d3.csv(graphic_data_url, function(error, data) {
                graphic_data = data;

                graphic_data.forEach(function(d) {
                    d.domain = d.domain;
                    d.total = +d.total;
                });

                setupResponsiveChild({
                    renderCallback: drawGraphic
                });
            });
    
})
