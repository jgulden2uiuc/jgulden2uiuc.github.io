// Create the SVG canvas
let svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

// Append a "Back" button but make it invisible by default
let backButton = svg.append("text")
    .attr("class", "backButton")
    .attr("x", width - 50)
    .attr("y", 20)
    .style("font", "16px sans-serif")
    .style("fill", "black")
    .style("cursor", "pointer")
    .style("visibility", "hidden")  // Hidden by default
    .text("Back")
    .on("click", function() {
        // Hide the back button
        d3.select(".backButton").style("visibility", "hidden");
        // Reset the y-axis scale
        y.domain(yDomain);
        // Transition the y axis and line
        transitionData(countries, data0);
        // Return the line stroke and style to original state
        d3.selectAll(".line").style("stroke", function(d) { return color(d.key); })
        .style("stroke-width", "1.5px");
        // Return the opacity of all lines back to 1
        d3.selectAll(".line").style("opacity", 1);
    });

// Define the line
let line = d3.line()
    .x(function(d) { return x(d.year); })
    .y(function(d) { return y(d.population); });

// Create the line group
let lines = svg.append("g")
    .attr("class", "lines");

// Create the line groups under the "lines" group
let linesG = lines.selectAll(".lineGroup")
    .data(countries)
    .enter().append("g")
    .attr("class", "lineGroup");

// Create the path, line, and fill under the line group
let path = linesG.append("path")
    .attr("class", "line")
    .attr("d", function(d) { return line(d.values); })
    .style("stroke", function(d) { return color(d.key); })
    .style("stroke-width", "1.5px")
    .on("mouseover", function(d) {
        d3.selectAll(".line").style("opacity", 0.1);
        d3.select(this).style("opacity", 1).style("stroke-width", "2.5px");
    })
    .on("mouseout", function(d) {
        d3.selectAll(".line").style("opacity", 1);
        d3.select(this).style("stroke-width", "1.5px");
    })
    .on("click", function(d) {
        // Show the back button
        d3.select(".backButton").style("visibility", "visible");
        // Adjust the y axis scale
        y.domain(d3.extent(d.values, function(c) { return c.population; }));
        // Transition the y axis and line
        transitionData(countries, d.values);
        // Change the stroke of other lines to grey and current line to black
        d3.selectAll(".line").style("stroke", "grey");
        d3.select(this).style("stroke", "black");
    });

// Creating the legend
var legend = svg.selectAll('g')
    .data(countries)
    .enter()
    .append('g')
    .attr('class', 'legend');

legend.append('rect')
    .attr('x', width - 20)
    .attr('y', function(d, i) { return i * 20; })
    .attr('width', 10)
    .attr('height', 10)
    .style('fill', function(d) { return color(d.key); });

legend.append('text')
    .attr('x', width - 8)
    .attr('y', function(d, i) { return (i * 20) + 9; })
    .text(function(d) { return d.key; });
