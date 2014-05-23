
// Poverty%

var $graphic;
var graphic_aspect_width = 1;
var graphic_aspect_height = 1;
var mobile_threshold = 625;
var pymChild = null;
var col = 12;


/*
 * Render the graphic
 */
function draw_graphic(width) {
    
render_chart(d);
}

function render_chart(d) {
    // var graphic_data = data;
    var is_mobile = false;
    // var last_data_point = graphic_data.length - 1;
    var margin = { top: 3, right: 3, bottom: 3, left: 3 };
    var num_ticks = 5;
    var width = container_width;

    if (width <= mobile_threshold) {
        is_mobile = true;
    }

    if (is_mobile) {
        width = Math.floor(((width - 11) / (col_width) ) - margin.left - margin.right);
//        width = width - margin.left - margin.right;
    } else {
        width = Math.floor(((width - 44) / col_width) - margin.left - margin.right);
    }

    var height = Math.ceil((width * graphic_aspect_height) / graphic_aspect_width) - margin.top - margin.bottom;
var boxViewTemplate = d3.select(".box-view").remove().node(),
    boxView = d3.select("#grid").selectAll(".box-view"),
    box = boxView.select(".box");

var output = d3.select("output"),
    input = d3.select("input").on("change", changed).each(changed),
    count = 0;

d3.timer(function() {
  ++count;

  box
      .style("top", Math.sin(count / 10) * 10 + "px")
      .style("left", Math.cos(count / 10) * 10 + "px")
      .style("background-color", "rgb(0,0," + count % 255 + ")")
      .text(count % 100);
});

function changed() {
  var n = +this.value;
  output.text(n);
  boxView = boxView.data(d3.range(n));
  boxView.exit().remove();
  boxView.enter().append(function() { return boxViewTemplate.cloneNode(true); });
  box = boxView.select(".box");
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
        
        // setup pym
        pymChild = new pym.Child({
            renderCallback: draw_graphic
        });
    } else {
        pymChild = new pym.Child();
    }
})
