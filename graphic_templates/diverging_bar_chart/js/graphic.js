// Global vars
var pymChild = null;
var isMobile = false;
var skipLabels = [ 'label', 'values', 'offset' ];

/*
 * Initialize the graphic.
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        formatData();

        pymChild = new pym.Child({
            renderCallback: render
        });
    } else {
        pymChild = new pym.Child({});
    }

    pymChild.onMessage('on-screen', function(bucket) {
        ANALYTICS.trackEvent('on-screen', bucket);
    });
    pymChild.onMessage('scroll-depth', function(data) {
        data = JSON.parse(data);
        ANALYTICS.trackEvent('scroll-depth', data.percent, data.seconds);
    });
}

/*
 * Format graphic data for processing by D3.
 */
var formatData = function() {
    DATA.forEach(function(d) {
        d['values'] = [];
        d['offset'] = +d['offset'];
        var x0 = d['offset'];

        for (var key in d) {
            if (_.contains(skipLabels, key)) {
                continue;
            }

            d[key] = +d[key];

            var x1 = x0 + d[key];

            d['values'].push({
                'name': key,
                'x0': x0,
                'x1': x1,
                'val': d[key]
            })

            x0 = x1;
        }
    });
}

/*
 * Render the graphic(s). Called by pym with the container width.
 */
var render = function(containerWidth) {
    if (!containerWidth) {
        containerWidth = DEFAULT_WIDTH;
    }

    if (containerWidth <= MOBILE_THRESHOLD) {
        isMobile = true;
    } else {
        isMobile = false;
    }

    // Render the chart!
    renderDivergingBarChart({
        container: '#diverging-bar-chart',
        width: containerWidth,
        data: DATA
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a diverging bar chart.
 */
var renderDivergingBarChart = function(config) {
    /*
     * Setup
     */
    var labelColumn = 'label';

    var barHeight = 30;
    var barGap = 5;
    var labelWidth = 75;
    var labelMargin = 10;
    var valueGap = 6;

    var showFullLegend = true;
    var showBarLabels = false;
    if (config['data'][0]['values'].length == 2) {
        showFullLegend = false;
        showBarLabels = true;
    }
    if (config['data'][0]['values'].length < 2) {
        showFullLegend = false;
        showBarLabels = false;
    }

    var margins = {
        top: 0,
        right: 0,
        bottom: 0,
        left: (labelWidth + labelMargin)
    };

    if (!showFullLegend && showBarLabels) {
        margins['top'] = 30;
    }

    if (isMobile) {
        margins['right'] = 24;
    }

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = ((barHeight + barGap) * config['data'].length) - barGap;

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create D3 scale objects.
     */
    var min = d3.min(config['data'], function(d) {
        return d['offset'];
    });

    if (min > 0) {
        min = 0;
    }

    var max = d3.max(config['data'], function(d) {
        return d['values'][d['values'].length - 1]['x1'];
    })

    var xScale = d3.scale.linear()
        .domain([min, max])
        .rangeRound([0, chartWidth]);

    var colorScale = d3.scale.ordinal()
        .domain(d3.keys(config['data'][0]).filter(function(d) {
            if (!_.contains(skipLabels, d)) {
                return d;
            }
        }))
        .range([ COLORS['teal3'], COLORS['teal5'], '#ccc', '#999' ]);

    /*
     * Render the legend.
     */
    if (showFullLegend) {
        var legend = containerElement.append('ul')
    		.attr('class', 'key')
    		.selectAll('g')
    			.data(colorScale.domain())
    		.enter().append('li')
    			.attr('class', function(d, i) {
    				return 'key-item key-' + i + ' ' + classify(d);
    			});

        legend.append('b')
            .style('background-color', function(d) {
                return colorScale(d);
            });

        legend.append('label')
            .text(function(d) {
                return d;
            });
    }

    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = chartWrapper.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', 'translate(' + margins['left'] + ',' + margins['top'] + ')');

    /*
     * Render bars to chart.
     */
     var group = chartElement.selectAll('.group')
         .data(config['data'])
         .enter().append('g')
             .attr('class', function(d) {
                 return 'group ' + classify(d[labelColumn]);
             })
             .attr('transform', function(d,i) {
                 return 'translate(0,' + (i * (barHeight + barGap)) + ')';
             });

     group.selectAll('rect')
         .data(function(d) {
             return d['values'];
         })
         .enter().append('rect')
             .attr('x', function(d) {
                 if (d['x0'] < d['x1']) {
                     return xScale(d['x0']);
                 }

                 return xScale(d['x1']);
             })
             .attr('width', function(d) {
                 return Math.abs(xScale(d['x1']) - xScale(d['x0']));
             })
             .attr('height', barHeight)
             .style('fill', function(d) {
                 return colorScale(d['name']);
             })
             .attr('class', function(d) {
                 return classify(d['name']);
             });

     /*
      * Render bar values.
      */
     group.append('g')
        .attr('class', 'value')
        .selectAll('text')
        .data(function(d) {
            return d['values'];
        })
        .enter().append('text')
            .text(function(d) {
                if (d['val'] != 0) {
                    return d['val'] + '%';
                }
            })
            .attr('class', function(d) {
                var c = classify(d['name']);
                if (d['x0'] < 0) {
                    c += ' left';
                } else {
                    c += ' right';
                }
                return c;
            })
            .attr('x', function(d) {
                if (d['x0'] < 0) {
                    return xScale(d['x0']);
                } else {
                    return xScale(d['x1']);
                }
            })
            .attr('dx', function(d, i) {
                var textWidth = this.getComputedTextLength();
                var barWidth = Math.abs(xScale(d['x1']) - xScale(d['x0']));

                if (textWidth > barWidth) {
                    if (i == 0 || i == config['data'][0]['values'].length - 1) {
                        // first or last item -- set outside the bar
                        d3.select(this).classed('out', true);

                        if (d['x0'] < 0) {
                            return -valueGap;
                        } else {
                            return valueGap;
                        }
                    } else {
                        // middle bar -- hide
                        d3.select(this).classed('hidden', true);
                        return 0;
                    }
                } else if (textWidth < barWidth && (textWidth + valueGap * 2) > barWidth) {
                    // label baaaarely fits inside the bar. center it in the avail space
                    d3.select(this).classed('center', true);

                    var xShift = ((xScale(d['x1']) - xScale(d['x0'])) / 2);

                    if (d['x0'] < 0) {
                        return xShift;
                    } else {
                        return -xShift;
                    }

                } else {
                    if (d['x0'] < 0) {
                        return valueGap;
                    } else {
                        return -valueGap;
                    }
                }
            })
            .attr('dy', (barHeight / 2) + 4)

    /*
     * Render 0-line.
     */
    if (min < 0) {
        chartElement.append('line')
            .attr('class', 'zero-line')
            .attr('x1', xScale(0))
            .attr('x2', xScale(0))
            .attr('y1', 0)
            .attr('y2', chartHeight);
    }

    // if there are only two categories, show labels above the bars instead
    if (showBarLabels) {
        var annotations = chartElement.append('g')
            .attr('class', 'annotations')
            .selectAll('text')
            .data(colorScale.domain())
            .enter().append('text')
                .text(function(d) {
                    return d;
                })
                .attr('class', function(d, i) {
                    return 'dhdr dhdr-' + i;
                })
                .attr('x', xScale(0))
                .attr('y', -15)
                .attr('dx', function(d, i) {
                    if (i == 0) {
                        return -valueGap;
                    } else {
                        return valueGap;
                    }
                })
                .attr('fill', function(d) {
                    return colorScale(d);
                });
    }

    /*
     * Render bar labels.
     */
    chartWrapper.append('ul')
        .attr('class', 'labels')
        .attr('style', formatStyle({
            'width': labelWidth + 'px',
            'top': margins['top'] + 'px',
            'left': '0'
        }))
        .selectAll('li')
        .data(config['data'])
        .enter()
        .append('li')
            .attr('style', function(d, i) {
                return formatStyle({
                    'width': labelWidth + 'px',
                    'height': barHeight + 'px',
                    'left': '0px',
                    'top': (i * (barHeight + barGap)) + 'px;'
                });
            })
            .attr('class', function(d) {
                return classify(d[labelColumn]);
            })
            .append('span')
                .text(function(d) {
                    return d[labelColumn];
                });
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
