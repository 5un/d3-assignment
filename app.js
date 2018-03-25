'use strict';
$(function(){
  // Setting up the chart area
  var margin = {
    top: 40,
    right: 20,
    bottom: 30,
    left: 40
  },
  canvasWidth = 400,
  canvasHeight = 400,
  scrollTop = 0,
  maxScroll = 10000,
  width = canvasWidth - margin.left - margin.right,
  height = canvasHeight - margin.top - margin.bottom,
  xScale,
  yScale,
  currentData = [],
  originalYear = 2003,
  maxYear = 2015,
  year = 0,
  svg = d3.select('svg')
    .attr('width', canvasWidth)
    .attr('height', canvasHeight),
  graphArea = svg.append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')'),
  tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  function colorByUnivName(name) {
    if(name === 'University of California-Berkeley') {
      return '#F0A924';
    } else if (name.indexOf('University of California') === 0) {
      return '#234986';
    } else {
      console.log('else')
      return 'rgba(255,255,255,0.3)';
    }
  }

  function update(data, opts = {}) {

    var transitionLatency = opts.transitionLatency || 1000;

    // Change year status
    $(".year").removeClass('year-active');
    $(".year:contains('"+ year +"')").addClass('year-active');

    // Perform the data join
    var dots = svg.selectAll("circle")
      .data(data)

    // Handle added data points
    dots.enter().append("circle");

    // Handle removed data points
    dots.exit().remove();

    var xColumn = 'SAT_AVG_' + String(year);
    var yColumn = 'ADM_RATE_' + String(year);
    
    var xMap = function(d) { return xScale(d[xColumn]) + margin.left || 0;} 
    var yMap = function(d) { return yScale(d[yColumn]) + margin.top || 0;}

    // update data
    dots
      .transition()
      .ease(d3.easeExp)
      .duration(transitionLatency)
      .attr("r", 5)
      .attr("cx", xMap)
      .attr("cy", yMap)

    dots
    .style("fill", function(d) { 
        return colorByUnivName(d.NAME);
      })
      
    dots
      .on("mouseover", function(d) {
        console.log(d);

        d3.select(this).attr("r", 6)

        tooltip.html(d.NAME)
          .style("opacity", 1.0)
          .style("left", (d3.event.pageX + 15) + "px")
          .style("top", (d3.event.pageY - 10) + "px")
          .style("color", colorByUnivName(d.NAME))
      })
      .on("mouseout", function(d) {
        d3.select(this).attr("r", 5)
        tooltip
          .style("opacity", 0);
      });

  }

  // Step 1: edit data.csv to include the data you want to show
  d3.csv('universities.csv', function(data) {
    currentData = data;

    // Step 2: Create x and y scales (scaleLinear) to draw points. 
    // Set xScale and yScale to the scales so you can use them outside this function.

    // Add code here
    xScale = d3.scaleLinear()
              .domain([600, 1800])
              .range([0, width]);
    yScale = d3.scaleLinear()
              .domain([0, 1])
              .range([0, height]);

    // Step 3: Add code to color the points by category (add code here or above)

    // // Add axes (uncomment this code to add axes)
    graphArea
      .append('g')
        .attr('class', 'axis')
        .attr('transform', 'translate(0,' + (height) + ')')
        .call(d3.axisBottom(xScale))
      .append("text")
        .attr("class", "axis-label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Average SAT Score of Admitted Students")
        .style("fill", "rgba(255,255,255,0.8)");

    graphArea
      .append('g')
        .attr('class', 'axis')
        .call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")))
      .append("text")
        .attr("class", "axis-label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Admission Rate (%)")
        .style("fill", "rgba(255,255,255,0.8)");

    year = originalYear;
    update(currentData);
    update(currentData);
    
  });

  // Handle Next clicked
  d3.select('#next-button').on('click', function(event) {
    if (year == maxYear) {
      year = originalYear;
    } else {
      year = year + 1;
    }
    update(currentData);
    
  });

  // Handle year clicked
  $('.year').click(function(event) {
    year = parseInt($(this).html());
    update(currentData);
  });

  // Handle scroll
  $(window).on('mousewheel DOMMouseScroll', function(e) {
    console.log(e.originalEvent.deltaY);
    scrollTop += e.originalEvent.deltaY;
    if(scrollTop < 0) scrollTop = 0;
    if(scrollTop > maxScroll) scrollTop = maxScroll;

    year = Math.floor(originalYear + scrollTop * (maxYear - originalYear) / maxScroll)
    update(currentData, { transitionLatency: 50 });
    //prevent page fom scrolling
    return false;
  });

});

// Step 5: make some other change to the graph


