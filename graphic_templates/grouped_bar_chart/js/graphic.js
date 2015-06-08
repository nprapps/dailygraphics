// Global config
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;

// Global vars
var pymChild = null;
var isMobile = false;
var graphicData = null;

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
        d['key'] = d['Group'];
        d['values'] = [];

        _.each(d, function(v, k) {
            if (_.contains(['Group', 'key', 'values'], k)) {
                return;
            }

            d['values'].push({ 'label': k, 'amt': +v });
            delete d[k];
        });

        delete d['Group'];
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
    renderGroupedBarChart({
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
 * Render a bar chart.
 */
var renderGroupedBarChart = function(config) {
    /*
     * Setup chart container.
     */
    labelColumn = 'label';
    valueColumn = 'amt';

    numGroups = config.data.length;
    numGroupBars = config.data[0]['values'].length;

    barHeight = 25;
    barGapInner = 2;
    barGap = 10;
    groupHeight =  (barHeight * numGroupBars) + (barGapInner * (numGroupBars - 1))
    labelWidth = 85;
    labelMargin = 6;
    valueMinWidth = 25;

    margins = {
        top: 0,
        right: 15,
        bottom: 20,
        left: (labelWidth + labelMargin)
    };

    ticks = {
        x: 7
    };
    roundTicksFactor = 5;

    // Calculate actual chart dimensions
    chartWidth = config.width - margins.left - margins.right;
    chartHeight = (((((barHeight + barGapInner) * numGroupBars) - barGapInner) + barGap) * numGroups) - barGap + barGapInner;

    // Clear existing graphic (for redraw)
    containerElement = d3.select(config.container);
    containerElement.html('');

    /*
     * Create D3 scale objects.
     */
    createScales = function() {
        xScale = d3.scale.linear()
            .domain([0, d3.max(config.data, function(d) {
                return d3.max(d['values'], function(v) {
                    return Math.ceil(v[valueColumn] / roundTicksFactor) * roundTicksFactor;
                });
            })])
            .range([0, chartWidth]);

        yScale = d3.scale.linear()
            .range([chartHeight, 0]);

        colorScale = d3.scale.ordinal()
            .range([COLORS['teal3'], COLORS['teal5']])
            .domain(_.pluck(config.data[0]['values'], 'label'));
    };
    /*
     * Render a color legend.
     */
    renderLegend = function() {
        var legend = containerElement.append('ul')
            .attr('class', 'key')
            .selectAll('g')
                .data(config.data[0]['values'])
            .enter().append('li')
                .attr('class', function(d, i) {
                    return 'key-item key-' + i + ' ' + classify(d[labelColumn]);
                });

        legend.append('b')
            .style('background-color', function(d) {
            	return colorScale(d[labelColumn]);
            });

        legend.append('label')
            .text(function(d) {
                return d[labelColumn];
            });
    }

    /*
     * Create the root SVG element.
     */
    createSVG = function() {
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
    createAxes = function() {
        xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom')
            .ticks(ticks.x)
            .tickFormat(function(d) {
                return d.toFixed(0) + '%';
            });
    };

    /*
     * Render axes to chart.
     */
    renderAxes = function() {
        chartElement.append('g')
            .attr('class', 'x axis')
            .attr('transform', makeTranslate(0, chartHeight))
            .call( xAxis);
    };

    /*
     * Render grid to chart.
     */
    renderGrid = function() {
        var xAxisGrid = function() {
            return xAxis;
        };

        chartElement.append('g')
            .attr('class', 'x grid')
            .attr('transform', makeTranslate(0, chartHeight))
            .call(xAxisGrid()
                .tickSize(-chartHeight, 0, 0)
                .tickFormat('')
            );
    };

    /*
     * Render bars to chart.
     */
    renderBars = function() {
        barGroups = chartElement.selectAll('.bars')
            .data(config.data)
            .enter()
            .append('g')
                .attr('class', 'g bars')
                .attr('transform', function(d, i) {
                    if (i == 0) {
                        return makeTranslate(0, 0);
                    }

                    return makeTranslate(0, (groupHeight + barGap) * i);
                });

        barGroups.selectAll('rect')
            .data(function(d) {
                return d['values'];
            })
            .enter()
            .append('rect')
                .attr('height', barHeight)
                .attr('x', 0)
                .attr('y', function(d, i) {
                    if (i == 0) {
                        return 0;
                    }

                    return (barHeight * i) + (barGapInner * i);
                })
                .attr('width', function(d) {
                    return xScale(d[valueColumn]);
                })
                .style('fill', function(d) {
                	return colorScale(d[labelColumn]);
                })
                .attr('class', function(d) {
                    return 'y-' + d[labelColumn];
                });
    };

    /*
     * Render bar labels.
     */
    renderLabels = function() {
        chartWrapper.append('ul')
            .attr('class', 'labels')
            .attr('style', formatStyle({
                'width': labelWidth + 'px',
                'top': margins.top + 'px',
                'left': '0'
            }))
            .selectAll('li')
            .data(config.data)
            .enter()
            .append('li')
                .attr('style', function(d,i) {
                    var top = (groupHeight + barGap) * i;

                    if (i == 0) {
                        top = 0;
                    }

                    return formatStyle({
                        'width': (labelWidth - 10) + 'px',
                        'height': barHeight + 'px',
                        'left': '0px',
                        'top': top + 'px;'
                    });
                })
                .attr('class', function(d,i) {
                    return classify(d['key']);
                })
                .append('span')
                    .text(function(d) {
                        return d['key']
                    });
    };

    /*
     * Render bar values.
     */
    renderValues = function() {
        barGroups.append('g')
            .attr('class', 'value')
            .selectAll('text')
            .data(function(d) {
                return d['values'];
            })
            .enter()
            .append('text')
                .attr('x', function(d) {
                    return xScale(d[valueColumn]);
                })
                .attr('y', function(d, i) {
                    if (i == 0) {
                        return 0;
                    }

                    return (barHeight * i) + barGapInner;
                })
                .attr('dx', function(d) {
                    if (xScale(d['amt']) > valueMinWidth) {
                        return -6;
                    }

                    return 6;
                })
                .attr('dy', (barHeight / 2) + 4)
                .attr('text-anchor', function(d) {
                    if (xScale(d[valueColumn]) > valueMinWidth) {
                        return 'end';
                    } else {
                        return 'begin';
                    }
                })
                .attr('class', function(d) {
                    var c = classify(d[labelColumn]);

                    if (xScale(d[valueColumn]) > valueMinWidth) {
                        c += ' in';
                    } else {
                        c += ' out';
                    }

                    return c;
                })
                .text(function(d) {
                    var v = d[valueColumn].toFixed(0);

                    if (d[valueColumn] > 0 && v == 0) {
                        v = '<1';
                    }

                    return v + '%';
                });
    }

    createScales();
    renderLegend();
    createSVG();
    createAxes();
    renderAxes();
    renderGrid();
    renderBars();
    renderLabels();
    renderValues();
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
