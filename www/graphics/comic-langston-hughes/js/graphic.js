var num_panels;

/*
 * TODO: draw your graphic
 */
function render(width) {
    if (width >= 480) {
        for (var i = 0; i < num_panels; i++) {
            $('#panel' + (i + 1)).attr('src', '../../assets/comic-langston-hughes/panel-' + (i + 1) + '.jpg');
            $('#panel' + (i + 1)).load(function() {
                sendHeightToParent();
            })
        }
    } else {
        for (var i = 0; i < num_panels; i++) {
            $('#panel' + (i + 1)).attr('src', '../../assets/comic-langston-hughes/panel-' + (i + 1) + '-mobile.jpg');
            $('#panel' + (i + 1)).load(function() {
                sendHeightToParent();
            })
        }
    }
}

/*
 * NB: Use window.load instead of document.ready
 * to ensure all images have loaded
 */
$(window).load(function() {
    num_panels = $('#graphic img').length;
    console.log(num_panels);

    setupResponsiveChild({
        renderCallback: render
    });
})
