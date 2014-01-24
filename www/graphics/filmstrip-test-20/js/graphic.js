var $filmstrip = $('.filmstrip');
var $filmstrip_wrapper = $('.filmstrip-wrapper');
var $filmstrip_outer_wrapper = $('.filmstrip-outer-wrapper');

var filmstrip_aspect_width = 800;
var filmstrip_aspect_height = 450;

function render(width) {
    // resize the filmstrip
    var filmstrip_width = width;
    var filmstrip_height = Math.ceil((filmstrip_width * filmstrip_aspect_height) / filmstrip_aspect_width);
    $filmstrip_wrapper.width(filmstrip_width + 'px').height(filmstrip_height + 'px');
}

function setup_css_animations() {
    var prefixes = [ '-webkit-', '-moz-', '-o-', '' ];
    var keyframes = '';
    var filmstrip_steps = 27;

    for (var i = 0; i < prefixes.length; i++) {
        var filmstrip = '';
        for (var f = 0; f < filmstrip_steps; f++) {
            var current_pct = Math.ceil(f * (100/filmstrip_steps));
            filmstrip += '\n\t' + current_pct + '% { background-position:0 -' + (f * 100) + '%; ' + prefixes[i] + 'animation-timing-function: steps(1); }';
        }
        keyframes += '@' + prefixes[i] + 'keyframes filmstrip {' + filmstrip + '\n}\n';
    }
    
    var s = document.createElement('style');
    s.innerHTML = keyframes;
    $('head').append(s);
    
    $filmstrip.addClass('animated');
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    setupResponsiveChild({
        renderCallback: render
    });

    setup_css_animations();
})
