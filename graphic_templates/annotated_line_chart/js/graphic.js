// Global vars
var pymChild = null;
var isMobile = false;
var dataSeries = [];
var annotations = [];
var skipLabels = ["date", "annotate", "x_offset", "y_offset"];

/*
 * Initialize graphic
 */
var onWindowLoaded = function() {
  formatData();

  pymChild = new pym.Child({
    renderCallback: render
  });

  pymChild.onMessage("on-screen", function(bucket) {
    ANALYTICS.trackEvent("on-screen", bucket);
  });
  pymChild.onMessage("scroll-depth", function(data) {
    data = JSON.parse(data);
    ANALYTICS.trackEvent("scroll-depth", data.percent, data.seconds);
  });
};

/*
 * Format graphic data for processing by D3.
 */
var formatData = function() {
  DATA.forEach(function(d) {
    d["date"] = d3.time.format("%m/%d/%y").parse(d["date"]);

    for (var key in d) {
      if (!skipLabels.includes(key) && d[key] != null && d[key].length > 0) {
        d[key] = Number(d[key]);

        // Annotations
        var hasAnnotation = !!d["annotate"];
        if (hasAnnotation) {

          var hasCustomLabel = d["annotate"].toLowerCase() != "true";
          var label = hasCustomLabel ? d["annotate"] : null;
          
          var xOffset = Number(d["x_offset"]) || 0; 
          var yOffset = Number(d["y_offset"]) || 0;

          annotations.push({
            date: d["date"],
            amt: d[key],
            series: key,
            xOffset: xOffset,
            yOffset: yOffset,
            label: label
          });
        }
      }
    }
  });

  /*
   * Restructure tabular data for easier charting.
   */
  for (var column in DATA[0]) {
    if (skipLabels.includes(column)) {
      continue;
    }

    dataSeries.push({
      name: column,
      values: DATA.map(function(d) {
        return {
          date: d["date"],
          amt: d[column]
        };
        // filter out empty data. uncomment this if you have inconsistent data.
        //        }).filter(function(d) {
        //            return d['amt'] != null;
      })
    });
  }
};

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
  renderLineChart({
    container: "#annotated-line-chart",
    width: containerWidth,
    data: dataSeries,
    annotations: annotations
  });

  // Update iframe
  if (pymChild) {
    pymChild.sendHeight();
  }
};

/*
 * Render a line chart.
 */
var renderLineChart = function(config) {
  /*
   * Setup
   */
  var dateColumn = "date";
  var valueColumn = "amt";

  var aspectWidth = 16;
  var aspectHeight = 9;

  var margins = {
    top: 5,
    right: 75,
    bottom: 20,
    left: 30
  };

  var ticksX = 10;
  var ticksY = 10;
  var roundTicksFactor = 5;

  var annotationXOffset = -4;
  var annotationYOffset = -24;
  var annotationWidth = 80;
  var annotationLineHeight = 14;

  // Mobile
  if (isMobile) {
    aspectWidth = 4;
    aspectHeight = 3;
    ticksX = 5;
    ticksY = 5;
    margins["right"] = 25;
    annotationXOffset = -6;
    annotationYOffset = -20;
    annotationWidth = 72;
    annotationLineHeight = 12;
  }

  // Calculate actual chart dimensions
  var chartWidth = config["width"] - margins["left"] - margins["right"];
  var chartHeight =
    Math.ceil((config["width"] * aspectHeight) / aspectWidth) -
    margins["top"] -
    margins["bottom"];

  // Clear existing graphic (for redraw)
  var containerElement = d3.select(config["container"]);
  containerElement.html("");

  /*
   * Create D3 scale objects.
   */
  var xScale = d3.time
    .scale()
    .domain(
      d3.extent(config["data"][0]["values"], function(d) {
        return d["date"];
      })
    )
    .range([0, chartWidth]);

  var min = d3.min(config["data"], function(d) {
    return d3.min(d["values"], function(v) {
      return Math.floor(v[valueColumn] / roundTicksFactor) * roundTicksFactor;
    });
  });

  if (min > 0) {
    min = 0;
  }

  var max = d3.max(config["data"], function(d) {
    return d3.max(d["values"], function(v) {
      return Math.ceil(v[valueColumn] / roundTicksFactor) * roundTicksFactor;
    });
  });

  var yScale = d3.scale
    .linear()
    .domain([min, max])
    .range([chartHeight, 0]);

  var colorScale = d3.scale
    .ordinal()
    .domain(
      config.data.map(function(d) {
        return d.name;
      })
    )
    .range([
      COLORS["red3"],
      COLORS["yellow3"],
      COLORS["blue3"],
      COLORS["orange3"],
      COLORS["teal3"]
    ]);

  /*
   * Render the HTML legend.
   */
  // var legend = containerElement
  //   .append("ul")
  //   .attr("class", "key")
  //   .selectAll("g")
  //   .data(config["data"])
  //   .enter()
  //   .append("li")
  //   .attr("class", function(d, i) {
  //     return "key-item " + classify(d["name"]);
  //   });

  // legend.append("b").style("background-color", function(d) {
  //   return colorScale(d["name"]);
  // });

  // legend.append("label").text(function(d) {
  //   return d["name"];
  // });

  /*
   * Create the root SVG element.
   */
  var chartWrapper = containerElement
    .append("div")
    .attr("class", "graphic-wrapper");

  var chartElement = chartWrapper
    .append("svg")
    .attr("width", chartWidth + margins["left"] + margins["right"])
    .attr("height", chartHeight + margins["top"] + margins["bottom"])
    .append("g")
    .attr(
      "transform",
      "translate(" + margins["left"] + "," + margins["top"] + ")"
    );

  /*
   * Create D3 axes.
   */
  var xAxis = d3.svg
    .axis()
    .scale(xScale)
    .orient("bottom")
    .ticks(ticksX)
    .tickFormat(function(d, i) {
      if (isMobile) {
        return "\u2019" + fmtYearAbbrev(d);
      } else {
        return fmtYearFull(d);
      }
    });

  var yAxis = d3.svg
    .axis()
    .scale(yScale)
    .orient("left")
    .ticks(ticksY);

  /*
   * Render axes to chart.
   */
  chartElement
    .append("g")
    .attr("class", "x axis")
    .attr("transform", makeTranslate(0, chartHeight))
    .call(xAxis);

  chartElement
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);

  /*
   * Render grid to chart.
   */
  var xAxisGrid = function() {
    return xAxis;
  };

  var yAxisGrid = function() {
    return yAxis;
  };

  chartElement
    .append("g")
    .attr("class", "x grid")
    .attr("transform", makeTranslate(0, chartHeight))
    .call(
      xAxisGrid()
        .tickSize(-chartHeight, 0, 0)
        .tickFormat("")
    );

  chartElement
    .append("g")
    .attr("class", "y grid")
    .call(
      yAxisGrid()
        .tickSize(-chartWidth, 0, 0)
        .tickFormat("")
    );

  /*
   * Render 0 value line.
   */
  if (min < 0) {
    chartElement
      .append("line")
      .attr("class", "zero-line")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", yScale(0))
      .attr("y2", yScale(0));
  }

  /*
   * Render lines to chart.
   */
  var line = d3.svg
    .line()
    .interpolate("monotone")
    .x(function(d) {
      return xScale(d[dateColumn]);
    })
    .y(function(d) {
      return yScale(d[valueColumn]);
    });

  chartElement
    .append("g")
    .attr("class", "lines")
    .selectAll("path")
    .data(config["data"])
    .enter()
    .append("path")
    .attr("class", function(d, i) {
      return "line " + classify(d["name"]);
    })
    .attr("stroke", function(d) {
      return colorScale(d["name"]);
    })
    .attr("d", function(d) {
      return line(d["values"]);
    });

  chartElement
    .append("g")
    .attr("class", "value")
    .selectAll("text")
    .data(config["data"])
    .enter()
    .append("text")
    .attr("x", function(d, i) {
      var last = d["values"][d["values"].length - 1];
      return xScale(last[dateColumn]) + 5;
    })
    .attr("y", function(d) {
      var last = d["values"][d["values"].length - 1];
      return yScale(last[valueColumn]) + 3;
    });

  /*
   * Render annotations.
   */
  var annotation = chartElement
    .append("g")
    .attr("class", "annotations")
    .selectAll("circle")
    .data(config.annotations)
    .enter();

  annotation
    .append("circle")
    .attr("class", "dots")
    .attr("cx", function(d) {
      return xScale(d[dateColumn]);
    })
    .attr("cy", function(d) {
      return yScale(d[valueColumn]);
    })
    .attr("fill", function(d) {
      return colorScale(d["series"]);
    })
    .attr("r", 3);

  annotation
    .append("text")
    .html(function(d) {
      var hasCustomLabel = d["label"] != null && d["label"].length > 0;
      var text = hasCustomLabel ? d["label"] : formatFullDate(d[dateColumn]);
      var value = d[valueColumn].toFixed(2);
      return text + " " + value;
    })
    .attr("x", function(d, i) {
      return xScale(d[dateColumn]) + d["xOffset"] + annotationXOffset;
    })
    .attr("y", function(d, i) {
      return yScale(d[valueColumn]) + d["yOffset"] + annotationYOffset;
    })
    .call(wrapText, annotationWidth, annotationLineHeight);
};

/*
 * Initially load the graphic
 * (NB: Use window.load to ensure all images have loaded)
 */
window.onload = onWindowLoaded;
