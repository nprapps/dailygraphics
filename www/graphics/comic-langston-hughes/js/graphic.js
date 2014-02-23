var num_panels;

function render(width) {
    if (width >= 480) { // sub in desktop version
        for (var i = 0; i < num_panels; i++) {
            $('#panel' + i).attr('src', '../../assets/comic-langston-hughes/panel-' + i + '.jpg');
        }
    } else { // use mobile version
        for (var i = 0; i < num_panels; i++) {
            $('#panel' + i).attr('src', '../../assets/comic-langston-hughes/panel-' + i + '-mobile.jpg');
        }
    }
}

$(document).ready(function() {
    num_panels = $('#graphic img').length;

    for (var i = 0; i < num_panels; i++) {
        $('#panel' + i).load(function() {
            sendHeightToParent();
        })
    }

    setupResponsiveChild({
        renderCallback: render
    });
})
