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
    color = d3.scale.ordinal()
        .range([COLORS['teal3'], COLORS['teal5']])
        .domain(d3.keys(graphicData[0]).filter(function(key) { return key !== 'Group'; }));

    graphicData.forEach(function(d) {
        d['key'] = d['Group'];
        d['values'] = [];

        color.domain().map(function(name) {
            d['values'].push({ 'label': name, 'amt': +d[name] });
            delete d[name];
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
    var chart = new GroupedBarChart({
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
var GroupedBarChart = function(config) {
    this.config = config;

    /*
     * Setup chart container.
     */
    this.setup = function() {
        // Configuration
        this.labelColumn = 'label';
        this.valueColumn = 'amt';

        this.numGroups = this.config.data.length;
        this.numGroupBars = this.config.data[0]['values'].length;

        this.barHeight = 25;
        this.barGapInner = 2;
        this.barGap = 10;
        this.groupHeight =  (this.barHeight * this.numGroupBars) + (this.barGapInner * (this.numGroupBars - 1))
        this.labelWidth = 85;
        this.labelMargin = 6;
        this.valueMinWidth = 25;

        this.margins = {
            top: 0,
            right: 15,
            bottom: 20,
            left: (this.labelWidth + this.labelMargin)
        };

        this.ticks = {
            x: 7
        };
        this.roundTicksFactor = 5;

        // Calculate actual chart dimensions
        this.chartWidth = this.config.width - this.margins.left - this.margins.right;
        this.chartHeight = (((((this.barHeight + this.barGapInner) * this.numGroupBars) - this.barGapInner) + this.barGap) * this.numGroups) - this.barGap + this.barGapInner;

        // Clear existing graphic (for redraw)
        this.containerElement = d3.select(config.container);
        this.containerElement.html('');
    };

    /*
     * Render a color legend.
     */
    this.renderLegend = function() {
        var legend = this.containerElement.append('ul')
            .attr('class', 'key')
            .selectAll('g')
                .data(this.config.data[0]['values'])
            .enter().append('li')
                .attr('class', _.bind(function(d, i) {
                    return 'key-item key-' + i + ' ' + classify(d[this.labelColumn]);
                }, this));

        legend.append('b')
            .style('background-color', _.bind(function(d) {
            	return color(d[this.labelColumn]);
            }, this));

        legend.append('label')
            .text(_.bind(function(d) {
                return d[this.labelColumn];
            }, this));
    }

    /*
     * Create the root SVG element.
     */
    this.createSVG = function() {
        this.chartWrapper = this.containerElement.append('div')
            .attr('class', 'graphic-wrapper');

        this.chartElement = this.chartWrapper.append('svg')
            .attr('width', this.chartWidth + this.margins.left + this.margins.right)
            .attr('height', this.chartHeight + this.margins.top + this.margins.bottom)
            .append('g')
            .attr('transform', 'translate(' + this.margins.left + ',' + this.margins.top + ')');
    }

    /*
     * Create D3 scale objects.
     */
    this.createScales = function() {
        this.xScale = d3.scale.linear()
            .domain([0, d3.max(this.config.data, _.bind(function(d) {
                return d3.max(d['values'], _.bind(function(v) {
                    return Math.ceil(v[this.valueColumn] / this.roundTicksFactor) * this.roundTicksFactor;
                }, this));
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
        this.barGroups = this.chartElement.selectAll('.bars')
            .data(this.config.data)
            .enter()
            .append('g')
                .attr('class', 'g bars')
                .attr('transform', _.bind(function(d, i) {
                    if (i == 0) {
                        return makeTranslate(0, 0);
                    }

                    return makeTranslate(0, (this.groupHeight + this.barGap) * i);
                }, this));

        this.barGroups.selectAll('rect')
            .data(function(d) {
                return d['values'];
            })
            .enter()
            .append('rect')
                .attr('height', this.barHeight)
                .attr('x', 0)
                .attr('y', _.bind(function(d, i) {
                    if (i == 0) {
                        return 0;
                    }

                    return (this.barHeight * i) + (this.barGapInner * i);
                }, this))
                .attr('width', _.bind(function(d) {
                    return this.xScale(d[this.valueColumn]);
                }, this))
                .style('fill', _.bind(function(d) {
                	return color(d[this.labelColumn]);
                }, this))
                .attr('class', _.bind(function(d) {
                    return 'y-' + d[this.labelColumn];
                }, this));
    };

    /*
     * Render bar labels.
     */
    this.renderLabels = function() {
        this.chartWrapper.append('ul')
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
                .attr('style', _.bind(function(d,i) {
                    var top = (this.groupHeight + this.barGap) * i;

                    if (i == 0) {
                        top = 0;
                    }

                    return formatStyle({
                        'width': (this.labelWidth - 10) + 'px',
                        'height': this.barHeight + 'px',
                        'left': '0px',
                        'top': top + 'px;'
                    });
                }, this))
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
    this.renderValues = function() {
        this.barGroups.append('g')
            .attr('class', 'value')
            .selectAll('text')
            .data(function(d) {
                return d['values'];
            })
            .enter()
            .append('text')
                .attr('x', _.bind(function(d) {
                    return this.xScale(d[this.valueColumn]);
                }, this))
                .attr('y', _.bind(function(d, i) {
                    if (i == 0) {
                        return 0;
                    }

                    return (this.barHeight * i) + this.barGapInner;
                }, this))
                .attr('dx', _.bind(function(d) {
                    if (this.xScale(d['amt']) > this.valueMinWidth) {
                        return -6;
                    }

                    return 6;
                }, this))
                .attr('dy', (this.barHeight / 2) + 4)
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
                    var v = d[this.valueColumn].toFixed(0);

                    if (d[this.valueColumn] > 0 && v == 0) {
                        v = '<1';
                    }

                    return v + '%';
                }, this));
    }

    this.setup();
    this.renderLegend();
    this.createSVG();
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
