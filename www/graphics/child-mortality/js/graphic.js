var graphic_data = {
    "world": { "title": "World", "1990": 90, "2012": 48 },
    "developed": { "title": "Developed regions", "1990": 15, "2012": 6 },
    "developing": { "title": "Developing regions", "1990": 99, "2012": 53 },
    "northern_africa": { "title": "Northern Africa", "1990": 73, "2012": 22 },
    "sub_saharan_africa": { "title": "Sub-Saharan Africa", "1990": 177, "2012": 98 },
    "latin_america": { "title": "Latin America and the Caribbean", "1990": 54, "2012": 19 },
    "caucasus": { "title": "Caucasus and Central Asia", "1990": 73, "2012": 36 },
    "eastern_asia": { "title": "Eastern Asia", "1990": 53, "2012": 14 },
    "southern_asia": { "title": "Southern Asia", "1990": 126, "2012": 58 },
    "southeast_asia": { "title": "South-eastern Asia", "1990": 71, "2012": 30 },
    "western_asia": { "title": "Western Asia", "1990": 65, "2012": 25 },
    "oceania": { "title": "Oceania", "1990": 74, "2012": 55 }
};

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
function render(width) {


    sendHeightToParent();
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    if (Modernizr.svg) {
        console.log(graphic_data);
    }

    setupResponsiveChild({
        renderCallback: render
    });
})