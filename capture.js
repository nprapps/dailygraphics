var system = require('system');

var slug = system.args[1];
var url = 'http://localhost:8000/graphics/' + slug + '/child.html';

var page = require('webpage').create();

page.viewportSize = { width: 700, height: 700 };

page.open(url, function() {
    // Set background color to white
    page.evaluate(function() {
        document.body.bgColor = 'white';
    });

    window.setTimeout(function () {
        page.render(slug + '.png');
        phantom.exit();
    }, 2000);
});
