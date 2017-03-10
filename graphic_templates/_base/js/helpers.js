/*
 * Basic Javascript helpers used in analytics.js and graphics code.
 */

/*
 * Convert arbitrary strings to valid css classes.
 * via: https://gist.github.com/mathewbyrne/1280286
 *
 * NOTE: This implementation must be consistent with the Python classify
 * function defined in base_filters.py.
 */
var classify = function(str) {
    return str.toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
}

/*
 * Convert key/value pairs to a style string.
 */
var formatStyle = function(props) {
    var s = '';

    for (var key in props) {
        s += key + ': ' + props[key].toString() + '; ';
    }

    return s;
}

/*
 * Create a SVG tansform for a given translation.
 */
var makeTranslate = function(x, y) {
    var transform = d3.transform();

    transform.translate[0] = x;
    transform.translate[1] = y;

    return transform.toString();
}

/*
 * Parse a url parameter by name.
 * via: http://stackoverflow.com/a/901144
 */
var getParameterByName = function(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

/*
 * Convert a url to a location object.
 */
var urlToLocation = function(url) {
    var a = document.createElement('a');
    a.href = url;
    return a;
}

/*
 * format month abbrs in AP style
 */
var getAPMonth = function(dateObj) {
    var apMonths = [ 'Jan.', 'Feb.', 'March', 'April', 'May', 'June', 'July', 'Aug.', 'Sept.', 'Oct.', 'Nov.', 'Dec.' ];
    var thisMonth = +fmtMonthNum(dateObj) - 1;
    return apMonths[thisMonth];
}

/*
 * Wrap a block of SVG text to a given width
 * adapted from http://bl.ocks.org/mbostock/7555321
 */
var wrapText = function(texts, width, lineHeight) {
    texts.each(function() {
        var text = d3.select(this);
        var words = text.text().split(/\s+/).reverse();

        var word = null;
        var line = [];
        var lineNumber = 0;

        var x = text.attr('x');
        var y = text.attr('y');

        var dx = text.attr('dx') ? parseFloat(text.attr('dx')) : 0;
        var dy = text.attr('dy') ? parseFloat(text.attr('dy')) : 0;

        var tspan = text.text(null)
            .append('tspan')
            .attr('x', x)
            .attr('y', y)
            .attr('dx', dx + 'px')
            .attr('dy', dy + 'px');

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(' '));

            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(' '));
                line = [word];

                lineNumber += 1;

                tspan = text.append('tspan')
                    .attr('x', x)
                    .attr('y', y)
                    .attr('dx', dx + 'px')
                    .attr('dy', lineNumber * lineHeight)
                    .attr('text-anchor', 'begin')
                    .text(word);
            }
        }
    });
}

/*
 * Constructs a location object from a url
 */
var getLocation = function(href) {
    var l = document.createElement("a");
    l.href = href;
    return l;
};

/*
 * Checks if we are in production based on the url hostname
 * When embedded with pym it checks the parentUrl param
 * - If a url is given checks that
 * - If no url is given checks window.location.href
 */
var isProduction = function(u) {
    var result = true;
    var u = u || window.location.href;
    var re_embedded = /^.*parentUrl=(.*)$/;
    // Check if we are inside the dailygraphics local rig
    var m = u.match(re_embedded)
    if (m) {
        u = decodeURIComponent(m[1])
    }
    l = getLocation(u);
    if (l.hostname.startsWith("localhost") ||
        l.hostname.startsWith("stage-") ||
        l.hostname.startsWith("www-s1")) {
        result = false
    }
    return result;
}

/*
 * Polyfill for String.trim()
 */
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    };
}
