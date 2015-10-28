var page = require('webpage').create();
var system = require('system');

if (system.args.length < 3 || system.args.length > 3) {
    console.log('Your must specify a slug argument and output path.')
    slimer.exit(1);
} else {
    var slug = system.args[1];
    var output = system.args[2];

    page.open('http://localhost:8000/graphics/' + slug + '/child.html', function(status) {
        window.setTimeout(function() {
            page.evaluate(function() {
                document.body.bgColor = 'white';
            });

            page.viewportSize = {
                width: 730,
                height: 600
            };

            page.render(output);
            slimer.exit();
        }, 2000);
    });
}
