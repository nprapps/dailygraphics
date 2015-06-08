// Global config
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;

// Global vars
var pymChild = null;
var isMobile = false;
var graphicData = null;

// D3 formatters
var fmtComma = d3.format(',');

/*
 * Initialize the graphic.
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
        d['amt'] = +d['amt'];
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
    renderColumnChart({
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
 * Render a column chart.
 */
var renderColumnChart = function(config) {
    /*
     * Setup chart container.
     */
    var labelColumn = 'label';
    var valueColumn = 'amt';

    var aspectWidth = isMobile ? 4 : 16;
    var aspectHeight = isMobile ? 3 : 9;
    var valueMinHeight = 30;

    var margins = {
        top: 5,
        right: 5,
        bottom: 20,
        left: 30
    };

    var ticks = {
        y: 4
    };
    var roundTicksFactor = 50;

    // Calculate actual chart dimensions
    var chartWidth = config.width - margins.left - margins.right;
    var chartHeight = Math.ceil((config.width * aspectHeight) / aspectWidth) - margins.top - margins.bottom;

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config.container);
    containerElement.html('');

    var chartWrapper = null;
    var chartElement = null;
    var xScale = null;
    var yScale = null;
    var xAxis = null;
    var yAxis = null;

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
     * Create D3 scale objects.
     */
    var createScales = function() {
        xScale = d3.scale.ordinal()
            .rangeRoundBands([0, chartWidth], .1)
            .domain(config.data.map(function (d) {
                return d[labelColumn];
            }));

        yScale = d3.scale.linear()
            .domain([0, d3.max(config.data, function(d) {
                return Math.ceil(d[valueColumn] / roundTicksFactor) * roundTicksFactor;
            })])
            .range([chartHeight, 0]);
    };

    /*
     * Create D3 axes.
     */
    var createAxes = function() {
        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .tickFormat(function(d, i) {
                return d;
            });

        yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left')
            .ticks(ticks.y)
            .tickFormat(function(d) {
                return fmtComma(d);
            });
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
            .call(yAxis)
    };

    /*
     * Render grid to chart.
     */
    var renderGrid = function() {
        var yAxisGrid = function() {
            return yAxis;
        };

        chartElement.append('g')
            .attr('class', 'y grid')
            .call(yAxisGrid()
                .tickSize(-chartWidth, 0)
                .tickFormat('')
            );
    };

    /*
     * Render bars to chart.
     */
    var renderBars = function() {
        chartElement.append('g')
            .attr('class', 'bars')
            .selectAll('rect')
            .data(config.data)
            .enter()
            .append('rect')
                .attr('x', function(d) {
                    return xScale(d[labelColumn]);
                })
                .attr('y', function(d) {
                    if (d[valueColumn] < 0) {
                        return yScale(0);
                    }

                    return yScale(d[valueColumn]);
                })
                .attr('width', xScale.rangeBand())
                .attr('height', function(d) {
                    if (d[valueColumn] < 0) {
                        return yScale(d[valueColumn]) - yScale(0);
                    }

                    return yScale(0) - yScale(d[valueColumn]);
                })
                .attr('class', function(d) {
                    return 'bar bar-' + d[labelColumn];
                });
    };

    /*
     * Render 0 value line.
     */
    var renderZeroLine = function() {
        chartElement.append('line')
            .attr('class', 'y grid grid-0')
            .attr('x1', 0)
            .attr('x2', chartWidth)
            .attr('y1', yScale(0))
            .attr('y2', yScale(0));
    }

    /*
     * Render bar values.
     */
    var renderValues = function() {
        chartElement.append('g')
            .attr('class', 'value')
            .selectAll('text')
            .data(config.data)
            .enter()
            .append('text')
                .attr('x', function(d, i) {
                    return xScale(d[labelColumn]) + (xScale.rangeBand() / 2);
                })
                .attr('y', function(d) {
                    var y = yScale(d[valueColumn]);

                    if (chartHeight - y > valueMinHeight) {
                        return y + 15;
                    }

                    return y - 6;
                })
                .attr('text-anchor', 'middle')
                .attr('class', function(d) {
                    var c = 'y-' + classify(d[labelColumn]);

                    if (chartHeight - yScale(d[valueColumn]) > valueMinHeight) {
                        c += ' in';
                    } else {
                        c += ' out';
                    }

                    return c;
                })
                .text(function(d) {
                    return d[valueColumn].toFixed(0);
                });
    }

    createSVG();
    createScales();
    createAxes();
    renderAxes();
    renderGrid();
    renderBars();
    renderZeroLine();
    renderValues();
}

/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
