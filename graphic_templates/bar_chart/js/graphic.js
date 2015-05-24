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
    var chart = new BarChart({
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
var BarChart = function(config) {
    this.config = config;

    /*
     * Setup chart container.
     */
    this.setup = function() {
        // Configuration
        this.labelColumn = 'label';
        this.valueColumn = 'amt';

        this.barHeight = 30;
        this.barGap = 5;
        this.labelWidth = 85;
        this.labelMargin = 6;
        this.valueMinWidth = 30;

        this.margins = {
            top: 0,
            right: 15,
            bottom: 20,
            left: (this.labelWidth + this.labelMargin)
        };

        this.ticks = {
            x: 4
        };
        this.roundTicksFactor = 5;

        // Calculate actual chart dimensions
        this.chartWidth = this.config.width - this.margins.left - this.margins.right;
        this.chartHeight = ((this.barHeight + this.barGap) * this.config.data.length);

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
        this.xScale = d3.scale.linear()
            .domain([0, d3.max(this.config.data, _.bind(function(d) {
                return Math.ceil(d[this.valueColumn] / this.roundTicksFactor) * this.roundTicksFactor;
            }, this))])
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
            .attr('transform', makeTranslate(0, this.chartHeight))
            .call(this. xAxis);
    };

    /*
     * Render grid to chart.
     */
    this.renderGrid = function() {
        var xAxisGrid = _.bind(function() {
            return this.xAxis;
        }, this);

        this.chartElement.append('g')
            .attr('class', 'x grid')
            .attr('transform', makeTranslate(0, this.chartHeight))
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
                .attr('class', _.bind(function(d, i) {
                    return 'bar-' + i + ' ' + classify(d[this.labelColumn]);
                }, this));
    };

    /*
     * Render bar labels.
     */
    this.renderLabels = function() {
        this.containerElement
            .append('ul')
            .attr('class', 'labels')
            .attr('style', formatStyle({
                'width': this.labelWidth + 'px',
                'top': this.margins.top + 'px',
                'left': '0'
            }))
            .selectAll('li')
            .data(this.config.data)
            .enter()
            .append('li')
                .attr('style', _.bind(function(d, i) {
                    return formatStyle({
                        'width': this.labelWidth + 'px',
                        'height': this.barHeight + 'px',
                        'left': '0px',
                        'top': (i * (this.barHeight + this.barGap)) + 'px;'
                    });
                }, this))
                .attr('class', _.bind(function(d) {
                    return classify(d[this.labelColumn]);
                }, this))
                .append('span')
                    .text(_.bind(function(d) {
                        return d[this.labelColumn];
                    }, this));
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
                    return this.xScale(d[this.valueColumn]);
                }, this))
                .attr('y', _.bind(function(d, i) {
                    return i * (this.barHeight + this.barGap);
                }, this))
                .attr('dx', _.bind(function(d) {
                    if (this.xScale(d[this.valueColumn]) > this.valueMinWidth) {
                        return -6;
                    } else {
                        return 6;
                    }
                }, this))
                .attr('dy', (this.barHeight / 2) + 3)
                .attr('text-anchor', _.bind(function(d) {
                    if (this.xScale(d[this.valueColumn]) > this.valueMinWidth) {
                        return 'end';
                    } else {
                        return 'begin';
                    }
                }, this))
                .attr('class', _.bind(function(d) {
                    var c = classify(d[this.labelColumn]);
                    if (this.xScale(d[this.valueColumn]) > this.valueMinWidth) {
                        c += ' in';
                    } else {
                        c += ' out';
                    }
                    return c;
                }, this))
                .text(_.bind(function(d) {
                    return d[this.valueColumn].toFixed(0) + '%';
                }, this));
    }

    this.setup();
    this.createScales();
    this.createAxes();
    this.renderAxes();
    this.renderGrid();
    this.renderBars();
    this.renderLabels();
    this.renderValues();

    return this;
}


/*
 * Initially load the graphic
 * (NB: Use window.load instead of document.ready
 * to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
