// Global config
var COLOR_BINS = [ -4, -2, 0, 2, 4, 6, 8, 10 ];
var COLOR_RANGE = [COLORS['red5'], '#ccc', COLORS['blue5'], COLORS['blue4'], COLORS['blue3'], COLORS['blue2']];

// Global vars
var pymChild = null;
var isMobile = false;
var binnedData = [];

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
    var numBins = COLOR_BINS.length - 1;

    // init the bins
    for (var i = 0; i < numBins; i++) {
        binnedData[i] = [];
    }

    // put states in bins
    _.each(DATA, function(d) {
        if (d['amt'] != null) {
            var amt = +d['amt'];
            var state = d['usps'];

            for (var i = 0; i < numBins; i++) {
                if (amt >= COLOR_BINS[i] && amt < COLOR_BINS[i + 1]) {
                    binnedData[i].unshift(state);
                    break;
                }
            }
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
    renderBlockHistogram({
        container: '#block-histogram',
        width: containerWidth,
        data: binnedData,
        bins: COLOR_BINS,
        colors: COLOR_RANGE
    });

    // Update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Render a bar chart.
 */
var renderBlockHistogram = function(config) {
    /*
     * Setup
     */
    var labelColumn = 'usps';
    var valueColumn = 'amt';

    var blockHeight = 30;
    if (isMobile) {
        blockHeight = 18;
    }
    var blockGap = 1;

    var margins = {
        top: 20,
        right: 12,
        bottom: 20,
        left: 10
    };

    var ticksY = 4;

    // Determine largest bin
    var largestBin = _.max(binnedData, function(bin) {
        return bin.length;
    }).length;

    // Calculate actual chart dimensions
    var chartWidth = config['width'] - margins['left'] - margins['right'];
    var chartHeight = ((blockHeight + blockGap) * largestBin);

    // Clear existing graphic (for redraw)
    var containerElement = d3.select(config['container']);
    containerElement.html('');

    /*
     * Create the root SVG element.
     */
    var chartWrapper = containerElement.append('div')
        .attr('class', 'graphic-wrapper');

    var chartElement = chartWrapper.append('svg')
        .attr('width', chartWidth + margins['left'] + margins['right'])
        .attr('height', chartHeight + margins['top'] + margins['bottom'])
        .append('g')
        .attr('transform', makeTranslate(margins['left'], margins['top']));

    /*
     * Create D3 scale objects.
     */
    var xScale = d3.scale.ordinal()
        .domain(config['bins'].slice(0, -1))
        .rangeRoundBands([0, chartWidth], .1);

    var yScale = d3.scale.linear()
        .domain([ 0, largestBin ])
        .rangeRound([ chartHeight, 0 ]);

    var colorScale = d3.scale.ordinal()
        .domain(config['bins'])
        .range(config['colors']);

    /*
     * Create D3 axes.
     */
    var xAxis = d3.svg.axis()
        .scale(xScale)
        .orient('bottom')
        .outerTickSize(0)
        .tickFormat(function(d) {
            if (d > 0) {
                return '+' + d + '%';
            } else {
                return d + '%';
            }
        });

    var yAxis = d3.svg.axis()
        .scale(yScale)
        .orient('left')
        .ticks(ticksY);

    /*
     * Render axes to chart.
     */
    chartElement.append('g')
        .attr('class', 'x axis')
        .attr('transform', makeTranslate(0, chartHeight))
        .call(xAxis);

    /*
     * Render grid to chart.
     */
    var yAxisGrid = function() {
        return yAxis;
    };

    chartElement.append('g')
        .attr('class', 'y grid')
        .call(yAxisGrid()
            .tickSize(-chartWidth, 0)
            .tickFormat('')
        );

    /*
     * Shift tick marks
     */
    chartElement.selectAll('.x.axis .tick')
        .attr('transform', function() {
            var el = d3.select(this);
            var transform = d3.transform(el.attr('transform'));

            transform.translate[0] = transform.translate[0] - (xScale.rangeBand() / 2) - ((xScale.rangeBand() * .1) / 2);
            transform.translate[1] = 3;

            return transform.toString();
        })

    var lastTick = chartElement.select('.x.axis')
        .append('g')
        .attr('class', 'tick')
        .attr('transform', function() {
            var transform = d3.transform();
            var lastBin = xScale.domain()[xScale.domain().length - 1];

            transform.translate[0] = xScale(lastBin) + xScale.rangeBand() + ((xScale.rangeBand() * .1) / 2);
            transform.translate[1] = 3;

            return transform.toString();
        })

    lastTick.append('line')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', 6)

    lastTick.append('text')
        .attr('text-anchor', 'middle')
        .attr('x', 0)
        .attr('y', 9)
        .attr('dy', '0.71em')
        .text(function() {
            var t = config['bins'][config['bins'].length - 1];
            if (t > 0) {
                return '+' + t + '%';
            } else {
                return t + '%';
            }
        });


    /*
     * Render bins to chart.
     */
    var bins = chartElement.selectAll('.bin')
        .data(config['data'])
        .enter().append('g')
            .attr('class', function(d,i) {
                return 'bin bin-' + i;
            })
            .attr('transform', function(d, i) {
                return makeTranslate(xScale(COLOR_BINS[i]), 0);
            });

    bins.selectAll('rect')
        .data(function(d) {
            return d3.entries(d);
        })
        .enter().append('rect')
            .attr('width', xScale.rangeBand())
            .attr('x', 0)
            .attr('y', function(d,i) {
                return chartHeight - ((blockHeight + blockGap) * (i + 1));
            })
            .attr('height', blockHeight)
            .attr('class', function(d) {
                return classify(d['value']);
            });


    /*
     * Render bin values.
     */
    bins.append('g')
        .attr('class', 'value')
        .selectAll('text')
            .data(function(d) {
                return d3.entries(d);
            })
        .enter().append('text')
            .attr('x', (xScale.rangeBand() / 2))
            .attr('y', function(d,i) {
                return chartHeight - ((blockHeight + blockGap) * (i + 1));
            })
            .attr('dy', (blockHeight / 2) + 4)
            .text(function(d) {
                return d['value'];
            });

    /*
     * Render annotations
     */
    var annotations = chartElement.append('g')
        .attr('class', 'annotations');

    annotations.append('text')
        .attr('class', 'label-top')
        .attr('x', xScale(0))
        .attr('dx', -15)
        .attr('text-anchor', 'end')
        .attr('y', -10)
        .html(LABELS['annotation_left']);

    annotations.append('text')
        .attr('class', 'label-top')
        .attr('x', xScale(0))
        .attr('dx', 5)
        .attr('text-anchor', 'begin')
        .attr('y', -10)
        .html(LABELS['annotation_right']);

    annotations.append('line')
        .attr('class', 'axis-0')
        .attr('x1', xScale(0) - ((xScale.rangeBand() * .1) / 2))
        .attr('y1', -margins['top'])
        .attr('x2', xScale(0) - ((xScale.rangeBand() * .1) / 2))
        .attr('y2', chartHeight);
}

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
