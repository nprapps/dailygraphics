// global vars
var $graphic = null;
var pymChild = null;

var GRAPHIC_DATA_URL = 'data.csv';
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;
var VALUE_MIN_WIDTH = 30;

var graphicData;
var isMobile = false;

/*
 * Initialize
 */
var onWindowLoaded = function() {
    if (Modernizr.svg) {
        $graphic = $('#graphic');

        d3.csv(GRAPHIC_DATA_URL, function(error, data) {
            graphicData = data;

            graphicData.forEach(function(d) {
                d['amt'] = +d['amt'];
            });

            pymChild = new pym.Child({
                renderCallback: render
            });
        });
    } else {
        pymChild = new pym.Child({ });
    }
}


/*
 * RENDER THE GRAPHIC
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

    // Clear existing graphic (for redraw)
    $graphic.empty();

    var chart = new BarChart({
        container: '#graphic',
        width: containerWidth,
        data: graphicData
    });

    // update iframe
    if (pymChild) {
        pymChild.sendHeight();
    }
}

/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
$(window).load(onWindowLoaded);

/*
 * Render a bar chart.
 */
var BarChart = function(config) {
    this.config = config;

    /*
     * Setup chart container.
     */
    this.setup = function() {
        // Configuration
        this.barHeight = 30;
        this.barGap = 5;
        this.labelWidth = 85;
        this.labelMargin = 6;

        this.margins = {
            top: 0,
            right: 15,
            bottom: 20,
            left: (this.labelWidth + this.labelMargin)
        };

        this.ticks = {
            x: 4
        };

        // Calculate actual chart size
        this.chartWidth = this.config.width - this.margins.left - this.margins.right;
        this.chartHeight = ((this.barHeight + this.barGap) * this.config.data.length);

        // Create container
        this.containerElement = d3.select(config.container);
        this.chartElement = this.containerElement.append('svg')
            .attr('width', this.chartWidth + this.margins.left + this.margins.right)
            .attr('height', this.chartHeight + this.margins.top + this.margins.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margins.left + ',' + this.margins.top + ')');
    };

    /*
     * Create D3 scale objects.
     */
    this.createScales = function() {
        this.xScale = d3.scale.linear()
            .domain([0, d3.max(this.config.data, function(d) {
                // TKTK: make configurable
                return Math.ceil(d['amt']/5) * 5; // round to next 5
            })])
            .range([0, this.chartWidth]);

        this.yScale = d3.scale.linear()
            .range([this.chartHeight, 0]);
    };

    /*
     * Create D3 axes.
     */
    this.createAxes = function() {
        this.xAxis = d3.svg.axis()
            .scale(this.xScale)
            .orient('bottom')
            .ticks(this.ticks.x)
            .tickFormat(function(d) {
                return d.toFixed(0) + '%';
            });
    };

    /*
     * Render axes to chart.
     */
    this.renderAxes = function() {
        this.chartElement.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + this.chartHeight + ')')
            .call(this. xAxis);
    };

    /*
     * Render grid to chart.
     */
    this.renderGrid = function() {
        var xAxisGrid = function() {
            return this.xAxis;
        }

        this.chartElement.append('g')
            .attr('class', 'x grid')
            .attr('transform', 'translate(0,' + this.chartHeight + ')')
            .call(xAxisGrid()
                .tickSize(-this.chartHeight, 0, 0)
                .tickFormat('')
            );
    };

    /*
     * Render bars to chart.
     */
    this.renderBars = function() {
        this.chartElement.append('g')
            .attr('class', 'bars')
            .selectAll('rect')
            .data(this.config.data)
            .enter()
            .append('rect')
                .attr('y', _.bind(function(d, i) {
                    return i * (this.barHeight + this.barGap);
                }, this))
                .attr('width', _.bind(function(d) {
                    return this.xScale(d['amt']);
                }, this))
                .attr('height', this.barHeight)
                .attr('class', function(d, i) {
                    return 'bar-' + i + ' ' + classify(d['label']);
                });
    };

    /*
     * Render bar labels.
     */
    this.renderLabels = function() {
        this.containerElement
            .append('ul')
            .attr('class', 'labels')
            .attr('style', 'width: ' + this.labelWidth + 'px; top: ' + this.margins.top + 'px; left: 0;')
            .selectAll('li')
            .data(this.config.data)
            .enter()
            .append('li')
                .attr('style', _.bind(function(d, i) {
                    var s = '';
                    s += 'width: ' + this.labelWidth + 'px; ';
                    s += 'height: ' + this.barHeight + 'px; ';
                    s += 'left: ' + 0 + 'px; ';
                    s += 'top: ' + (i * (this.barHeight + this.barGap)) + 'px; ';
                    return s;
                }, this))
                .attr('class', function(d) {
                    return classify(d['label']);
                })
                .append('span')
                    .text(function(d) {
                        return d['label'];
                    });
    };

    /*
     * Render bar values.
     */
    this.renderValues = function() {
        this.chartElement.append('g')
            .attr('class', 'value')
            .selectAll('text')
            .data(this.config.data)
            .enter()
            .append('text')
                .attr('x', _.bind(function(d) {
                    return this.xScale(d['amt']);
                }, this))
                .attr('y', _.bind(function(d, i) {
                    return i * (this.barHeight + this.barGap);
                }, this))
                .attr('dx', _.bind(function(d) {
                    if (this.xScale(d['amt']) > VALUE_MIN_WIDTH) {
                        return -6;
                    } else {
                        return 6;
                    }
                }, this))
                .attr('dy', (this.barHeight / 2) + 3)
                .attr('text-anchor', _.bind(function(d) {
                    if (this.xScale(d['amt']) > VALUE_MIN_WIDTH) {
                        return 'end';
                    } else {
                        return 'begin';
                    }
                }, this))
                .attr('class', _.bind(function(d) {
                    var c = classify(d['label']);
                    if (this.xScale(d['amt']) > VALUE_MIN_WIDTH) {
                        c += ' in';
                    } else {
                        c += ' out';
                    }
                    return c;
                }, this))
                .text(function(d) {
                    return d['amt'].toFixed(0) + '%';
                });
    }

    this.setup();
    this.createScales();
    this.createAxes();
    this.renderAxes();
    this.renderBars();
    this.renderLabels();
    this.renderValues();

    return this;
}
