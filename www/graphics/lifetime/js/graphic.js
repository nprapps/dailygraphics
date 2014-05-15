
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
    var cfill = 2000;
    var cnofill = 4160-cfill;
    
    if (Modernizr.svg) {
        // clear out existing graphics
        $graphic.empty();
    
        for (var i=0;i<cfill;i++)
        {
            render_chart( "filled", width, col);
        }
 
        for (var i=0;i<cnofill;i++)
        {
            render_chart( "nofill", width, col);
        }        

    }
}


function render_chart(id, container_width,col_width) {
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

    var container = d3.select('#graphic')
        .append('div')
            .attr('id', 'graph-' + id)
            .attr('class', 'graph')
            .attr('style', function(d) {
                if (!is_mobile) {
                    return 'width: ' + (width + margin.left + margin.right) + 'px';
                }
            });
    
    var meta = container.append('div')
        .attr('class', 'meta')
        .attr('style', function(d) {
            if (is_mobile) {
                return 'width: ' + ((width - 11) / (col_width)  ) + 'px';
            }
        });


    var svg = container.append('svg')
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


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
