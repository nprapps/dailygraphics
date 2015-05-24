// Global config
var GRAPHIC_DEFAULT_WIDTH = 600;
var MOBILE_THRESHOLD = 500;

// Global vars
var pymChild = null;
var isMobile = false;
var graphicData = null;

// D3 formatters
var fmtComma = d3.format(',');
var fmtYearAbbrev = d3.time.format('%y');
var fmtYearFull = d3.time.format('%Y');

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
        d['date'] = d3.time.format('%Y').parse(d['label']);
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
    var chart = new ColumnChart({
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
var ColumnChart = function(config) {
    this.config = config;

    /*
     * Setup chart container.
     */
    this.setup = function() {
        // Configuration
        this.labelColumn = 'date';
        this.valueColumn = 'amt';

        this.aspectWidth = isMobile ? 4 : 16;
        this.aspectHeight = isMobile ? 3 : 9;
        this.valueMinHeight = 30;

        this.margins = {
            top: 5,
            right: 5,
            bottom: 20,
            left: 30
        };

        this.ticks = {
            y: 4
        };
        this.roundTicksFactor = 50;

        // Calculate actual chart dimensions
        this.chartWidth = this.config.width - this.margins.left - this.margins.right;
        this.chartHeight = Math.ceil((this.config.width * this.aspectHeight) / this.aspectWidth) - this.margins.top - this.margins.bottom;

        // Clear existing graphic (for redraw)
        this.containerElement = d3.select(config.container);
        this.containerElement.html('');

        // Create container
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
        this.xScale = d3.scale.ordinal()
            .rangeRoundBands([0, this.chartWidth], .1)
            .domain(this.config.data.map(_.bind(function (d) {
                return d[this.labelColumn];
            }, this)));

        this.yScale = d3.scale.linear()
            .domain([0, d3.max(this.config.data, _.bind(function(d) {
                return Math.ceil(d[this.valueColumn] / this.roundTicksFactor) * this.roundTicksFactor;
            }, this))])
            .range([this.chartHeight, 0]);
    };

    /*
     * Create D3 axes.
     */
    this.createAxes = function() {
        this.xAxis = d3.svg.axis()
            .scale(this.xScale)
            .orient('bottom')
            .tickFormat(function(d, i) {
                if (isMobile) {
                    return '\u2019' + fmtYearAbbrev(d);
                }

                return fmtYearFull(d);
            });

        this.yAxis = d3.svg.axis()
            .scale(this.yScale)
            .orient('left')
            .ticks(this.ticks.y)
            .tickFormat(function(d) {
                return fmtComma(d);
            });
    };

    /*
     * Render axes to chart.
     */
    this.renderAxes = function() {
        this.chartElement.append('g')
            .attr('class', 'x axis')
            .attr('transform', makeTranslate(0, this.chartHeight))
            .call(this.xAxis);

        this.chartElement.append('g')
            .attr('class', 'y axis')
            .call(this.yAxis)
    };

    /*
     * Render grid to chart.
     */
    this.renderGrid = function() {
        var yAxisGrid = _.bind(function() {
            return this.yAxis;
        }, this);

        this.chartElement.append('g')
            .attr('class', 'y grid')
            .call(yAxisGrid()
                .tickSize(-this.chartWidth, 0)
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
                .attr('x', _.bind(function(d) {
                    return this.xScale(d[this.labelColumn]);
                }, this))
                .attr('y', _.bind(function(d) {
                    if (d[this.valueColumn] < 0) {
                        return this.yScale(0);
                    }

                    return this.yScale(d[this.valueColumn]);
                }, this))
                .attr('width', this.xScale.rangeBand())
                .attr('height', _.bind(function(d) {
                    if (d[this.valueColumn] < 0) {
                        return this.yScale(d[this.valueColumn]) - this.yScale(0);
                    }

                    return this.yScale(0) - this.yScale(d[this.valueColumn]);
                }, this))
                .attr('class', _.bind(function(d) {
                    return 'bar bar-' + fmtYearAbbrev(d[this.labelColumn]);
                }, this));
    };

    /*
     * Render 0 value line.
     */
    this.renderZeroLine = function() {
        this.chartElement.append('line')
            .attr('class', 'y grid grid-0')
            .attr('x1', 0)
            .attr('x2', this.chartWidth)
            .attr('y1', this.yScale(0))
            .attr('y2', this.yScale(0));
    }

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
                .attr('x', _.bind(function(d, i) {
                    return this.xScale(d[this.labelColumn]) + (this.xScale.rangeBand() / 2);
                }, this))
                .attr('y', _.bind(function(d) {
                    var y = this.yScale(d[this.valueColumn]);

                    if (this.chartHeight - y > this.valueMinHeight) {
                        return y + 15;
                    }

                    return y - 6;
                }, this))
                .attr('text-anchor', 'middle')
                .attr('class', _.bind(function(d) {
                    var c = 'y-' + classify(fmtYearFull(d[this.labelColumn]));

                    if (this.chartHeight - this.yScale(d[this.valueColumn]) > this.valueMinHeight) {
                        c += ' in';
                    } else {
                        c += ' out';
                    }

                    return c;
                }, this))
                .text(_.bind(function(d) {
                    return d[this.valueColumn].toFixed(0);
                }, this));
    }

    this.setup();
    this.createScales();
    this.createAxes();
    this.renderAxes();
    this.renderGrid();
    this.renderBars();
    this.renderZeroLine();
    this.renderValues();

    return this;
}

/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
