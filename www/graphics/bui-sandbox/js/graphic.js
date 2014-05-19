var pymChild = null;

var colors = {
    'red1': '#6C2315', 'red2': '#A23520', 'red3': '#D8472B', 'red4': '#E27560', 'red5': '#ECA395', 'red6': '#F5D1CA',
    'orange1': '#714616', 'orange2': '#AA6A21', 'orange3': '#E38D2C', 'orange4': '#EAAA61', 'orange5': '#F1C696', 'orange6': '#F8E2CA',
    'yellow1': '#77631B', 'yellow2': '#B39429', 'yellow3': '#EFC637', 'yellow4': '#F3D469', 'yellow5': '#F7E39B', 'yellow6': '#FBF1CD',
    'teal1': '#0B403F', 'teal2': '#11605E', 'teal3': '#17807E', 'teal4': '#51A09E', 'teal5': '#8BC0BF', 'teal6': '#C5DFDF',
    'blue1': '#28556F', 'blue2': '#3D7FA6', 'blue3': '#51AADE', 'blue4': '#7DBFE6', 'blue5': '#A8D5EF', 'blue6': '#D3EAF7'
};

var data = [
 {key: "Legend String 1", magnitude: 54, link: "http://www.if4it.com"},
  {key: "Legend String 2", magnitude: 21, link: "http://www.if4it.com/glossary.html"},
  {key: "Legend String 3", magnitude: 31, link: "http://www.if4it.com/resources.html"},
  {key: "Legend String 4", magnitude: 14, link: "http://www.if4it.com/taxonomy.html"},
  {key: "Legend String 5", magnitude: 19, link: "http://www.if4it.com/disciplines.html"}]
var graphic_aspect_width = 1;
var graphic_aspect_height = 2;

/*
 * Render the graphic
 */
function render(width) {


var margin = {top: 50, right: 350, bottom: 25, left: 350};
var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;        

        var x = d3.scale.linear().range([0, width]);
        var y = d3.scale.linear().range([height, 0]);


        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom")
            .tickSize(5)
            .tickFormat(d3.format("d"));

        var xAxis_top = d3.svg.axis()
            .scale(x)
            .orient("top")
            .tickSize(9)
            .tickFormat(d3.format("d"));

        var x_axis_grid = function() { return xAxis; };

        var yAxis = d3.svg.axis()
            .orient("left")
            .scale(y)
            .tickSize(10)
        var y_axis_grid = function() { return yAxis; };
     
var svg = d3.select('#graphic').append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.transition().ease("bounce").duration(750).each(function() {
  var bar = svg.selectAll(".bar")
      .data(data, function(d) { return d.key; });

  bar.enter().append("rect")
      .attr("class", "bar")
      // initialize entering bars

  bar.transition()
      // transition entering + updating bars

  bar.exit().transition()
      // transition exiting bars
      .remove()

  svg.select(".x.axis").transition()
      .call(xAxis);

  svg.select(".y.axis").transition()
      .call(yAxis);
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
    pymChild = new pym.Child({
        renderCallback: render
    });
})
