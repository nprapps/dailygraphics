// Global config
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;

// Global vars
var pymChild = null;
var isMobile = false;
var graphicData = null;

// D3 formatters
var fmtYearAbbrev = d3.time.format('%y');
var fmtYearFull = d3.time.format('%Y');

/*
 * Initialize graphic
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        loadLocalData(GRAPHIC_DATA);
        //loadCSV('data.csv')
    } else {
        pymChild = new pym.Child({});
    }
}

/*
 * Load graphic data from a local source.
 */
var loadLocalData = function(data) {
    graphicData = data;

    formatData();

    pymChild = new pym.Child({
        renderCallback: render
    });
}

/*
 * Load graphic data from a CSV.
 */
var loadCSV = function(url) {
    d3.csv(GRAPHIC_DATA_URL, function(error, data) {
        graphicData = data;

        formatData();

        pymChild = new pym.Child({
            renderCallback: render
        });
    });
}

/*
 * Format graphic data for processing by D3.
 */
var formatData = function() {
    graphicData.forEach(function(d) {
        d['date'] = d3.time.format('%m/%d/%y').parse(d['date']);

        for (var key in d) {
            if (key != 'date') {
                d[key] = +d[key];
            }
        }
    });
}

/*
 * Render the graphic(s). Called by pym with the container width.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = GRAPHIC_DEFAULT_WIDTH;
    }

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Render the chart!
    renderLineChart({
        container: '#graphic',
        width: containerWidth,
        data: graphicData
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a line chart.
 */
var renderLineChart = function(config) {
    /*
     * Setup
     */
    var dateColumn = 'date';
    var valueColumn = 'amt';

    var aspectWidth = 4;
    var aspectHeight = 3;

    var margins = {
        top: 5,
        right: 75,
        bottom: 20,
        left: 30
    };

    var ticks = {
        x: 10,
        y: 10
    };
    var roundTicksFactor = 5;

    // Mobile
    if (isMobile) {
        ticks.x = 5;
        ticks.y = 5;
        margins.right = 25;
    }

    // Calculate actual chart dimensions
    var chartWidth = config.width - margins.left - margins.right;
    var chartHeight = Math.ceil((config.width * aspectHeight) / aspectWidth) - margins.top - margins.bottom;


    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config.container);
    containerElement.html('');

    var formattedData = {};
    var xScale = null;
    var yScale = null;
    var colorScale = null;
    var chartWrapper = null;
    var chartElement = null;

    /*
     * Restructure tabular data for easier charting.
     */
    var reformatData = function() {
        for (var column in graphicData[0]) {
            if (column == dateColumn) {
                continue;
            }

            formattedData[column] = graphicData.map(function(d) {
                return {
                    'date': d[dateColumn],
                    'amt': d[column]
                };
    // filter out empty data. uncomment this if you have inconsistent data.
    //        }).filter(function(d) {
    //            return d['amt'].length > 0;
            });
        }
    }

    /*
     * Create D3 scale objects.
     */
    var createScales = function() {
        xScale = d3.time.scale()
            .domain(d3.extent(config.data, function(d) {
                return d[dateColumn];
            }))
            .range([ 0, chartWidth ])

        yScale = d3.scale.linear()
            .domain([ 0, d3.max(d3.entries(formattedData), function(c) {
                    return d3.max(c['value'], function(v) {
                        var n = v[valueColumn];
                        return Math.ceil(n / 5) * 5; // round to next 5
                    });
                })
            ])
            .range([ chartHeight, 0 ]);

        colorScale = d3.scale.ordinal()
            .domain(d3.keys(config.data[0]).filter(function(key) {
                return key !== dateColumn;
            }))
            .range([ COLORS['red3'], COLORS['yellow3'], COLORS['blue3'], COLORS['orange3'], COLORS['teal3'] ]);
    };

    /*
     * Render the HTML legend.
     */
    var renderLegend = function() {
        var legend = containerElement.append('ul')
            .attr('class', 'key')
            .selectAll('g')
                .data(d3.entries(formattedData))
            .enter().append('li')
                .attr('class', function(d, i) {
                    return 'key-item key-' + i + ' ' + classify(d['key']);
                });

        legend.append('b')
            .style('background-color', function(d) {
                return colorScale(d['key']);
            });

        legend.append('label')
            .text(function(d) {
                return d['key'];
            });
    }

    /*
     * Create the root SVG element.
     */
    var createSVG = function() {
        chartWrapper = containerElement.append('div')
            .attr('class', 'graphic-wrapper');

        chartElement = chartWrapper.append('svg')
            .attr('width', chartWidth + margins.left + margins.right)
            .attr('height', chartHeight + margins.top + margins.bottom)
            .append('g')
            .attr('transform', 'translate(' + margins.left + ',' + margins.top + ')');
    }

    /*
     * Create D3 axes.
     */
    var createAxes = function() {
        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(ticks.x)
            .tickFormat(function(d, i) {
                if (isMobile) {
                    return '\u2019' + fmtYearAbbrev(d);
                } else {
                    return fmtYearFull(d);
                }
            });

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .ticks(ticks.y);
    };

    /*
     * Render axes to chart.
     */
    var renderAxes = function() {
        chartElement.append('g')
            .attr('class', 'x axis')
            .attr('transform', makeTranslate(0, chartHeight))
            .call(xAxis);

        chartElement.append('g')
            .attr('class', 'y axis')
            .call(yAxis);
    };

    /*
     * Render grid to chart.
     */
    var renderGrid = function() {
        var xAxisGrid = function() {
            return xAxis;
        }

        var yAxisGrid = function() {
            return yAxis;
        }

        chartElement.append('g')
            .attr('class', 'x grid')
            .attr('transform', makeTranslate(0, chartHeight))
            .call(xAxisGrid()
                .tickSize(-chartHeight, 0, 0)
                .tickFormat('')
            );

        chartElement.append('g')
            .attr('class', 'y grid')
            .call(yAxisGrid()
                .tickSize(-chartWidth, 0, 0)
                .tickFormat('')
            );
    };

    /*
     * Render lines to chart.
     */
    var renderLines = function() {
        var line = d3.svg.line()
            .interpolate('monotone')
            .x(function(d) {
                return xScale(d[dateColumn]);
            })
            .y(function(d) {
                return yScale(d[valueColumn]);
            });

        chartElement.append('g')
            .attr('class', 'lines')
            .selectAll('path')
            .data(d3.entries(formattedData))
            .enter()
            .append('path')
                .attr('class', function(d, i) {
                    return 'line line-' + i + ' ' + classify(d['key']);
                })
                .attr('stroke', function(d) {
                    return colorScale(d['key']);
                })
                .attr('d', function(d) {
                    return line(d['value']);
                });
    };

    var renderEndValues = function() {
        chartElement.append('g')
            .attr('class', 'value')
            .selectAll('text')
            .data(d3.entries(formattedData))
            .enter().append('text')
                .attr('x', function(d, i) {
                    var last = d['value'][d['value'].length - 1];

                    return xScale(last[dateColumn]) + 5;
                })
                .attr('y', function(d) {
                    var last = d['value'][d['value'].length - 1];

                    return yScale(last[valueColumn]) + 3;
                })
                .text(function(d) {
                    var last = d['value'][d['value'].length - 1];
                    var value = last[valueColumn];

                    var label = last[valueColumn].toFixed(1);

                    if (!isMobile) {
                        label = d['key'] + ': ' + label;
                    }

                    return label;
                });
    }

    reformatData();
    createScales();
    renderLegend();
    createSVG();
    createAxes();
    renderAxes();
    renderGrid();
    renderLines();
    renderEndValues();
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
