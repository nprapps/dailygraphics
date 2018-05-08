/*
 * Base Javascript code for graphics, including D3 helpers.
 */

// Global config
var DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;
var isHomepage = false;


// check if this is on the homepage (if someone clicked the
// "This code will be embedded on the NPR homepage."
// checkbox when pulling the embed code.)
if (getParameterByName('mode') == 'hp') {
    d3.select('body').classed('hp', true);
    isHomepage = true;
}


// D3 formatters
var fmtComma = d3.format(',');
var fmtYearAbbrev = d3.time.format('%y');
var fmtYearFull = d3.time.format('%Y');
var fmtMonthNum = d3.time.format('%m');

var formatFullDate = function(d) {
    // Output example: Dec. 23, 2014
    var fmtDayYear = d3.time.format('%e, %Y');
    return getAPMonth(d) + ' ' + fmtDayYear(d).trim();
};
