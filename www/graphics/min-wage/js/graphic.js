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

$(window).load(function() {
	var $graphic = $('#graphic');
    var graphic_data_url = 'minwage_data.csv';
    // var graphic_data_url2 = 'pizza_m2.csv';
	var graphic_data;

function render(width) {
}

  function drawGraphic(width) {


            var margin = {top: 0, right: 100, bottom: 40, left: 50};
            var width = width - margin.left - margin.right;
            var height = 1000 - margin.top - margin.bottom;
        
            var num_x_ticks = 10;
            if (width <= 480) {
                num_x_ticks = 4;
            }

	        $graphic.empty();


            var xVal = function(d) { return d.size;};
            var x = d3.scale.linear().range([0, width])
            		.domain([d3.min(graphic_data, xVal)-1, 30])
                    .clamp(true);
/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */


        function setup() {
            if (Modernizr.svg) {
                d3.csv(graphic_data_url, function(error, data) {
                    graphic_data = data;

                    graphic_data.forEach(function(d) {

                        d.elasticity = +d.elasticity;
                        d.value = +d.value;
                        d.se = +d.se;
                        d.se_1 = d.se_1;
                        d.studyid = d.studyid;
                        d.authorid = d.authorid;
                        d.level = d.level;

                    });


                    // console.log(graphic_data);
                    setupResponsiveChild({
                        renderCallback: drawGraphic 
                    });
                });


            }
        }


$(window).load(function() {
    setupResponsiveChild({
        renderCallback: render
    });
})
