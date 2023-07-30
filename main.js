// main.js

// Width and height of the chart
const width = 960, height = 500;
const margin = {top: 20, right: 80, bottom: 30, left: 50};

// Create SVG
const svg = d3.select('#chart').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Create Scales
const xScale = d3.scaleLinear().range([0, width - margin.left - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

// Create Axis
const xAxis = d3.axisBottom(xScale);
const yAxis = d3.axisLeft(yScale);

// Create Color Scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Create line generator
const line = d3.line()
  .x(function(d) { return xScale(d.year); })
  .y(function(d) { return yScale(d.gdp); });

// Load data
d3.csv("API_NY.GDP.PCAP.KD_DS2_en_csv_v2_5728900.csv").then(function(data) {
  // Prepare the data
  const parsedData = [];
  data.forEach(d => {
    for (let i = 1960; i <= 2022; i++) {
      parsedData.push({
        country: d.country,
        year: i,
        gdp: +d[i]
      });
    }
  });

  // Group data by country
  const dataByCountry = Array.from(d3.group(parsedData, d => d.country));
  
  color.domain(dataByCountry.map(([key, values]) => key));
  
  // Set domains for scales
  xScale.domain(d3.extent(parsedData, function(d) { return d.year; }));
  yScale.domain([0, d3.max(parsedData, function(d) { return d.gdp; })]);

  // Draw axes
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + yScale.range()[0] + ")")
    .call(xAxis);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

  // Draw lines
  const country = svg.selectAll(".country")
    .data(dataByCountry)
    .enter().append("g")
      .attr("class", "country");

  country.append("path")
    .attr("class", "line")
    .attr("d", ([key, values]) => line(values))
    .style("stroke", ([key, values]) => color(key))
    .on("mouseover", function() {
      d3.selectAll(".line").style("opacity", 0.1);  // Fade all lines
      d3.select(this).style("opacity", 1)  // Highlight the current line
                    .style("stroke-width", "3");  // Increase stroke width for better visibility
    })
    .on("mouseout", function() {
      d3.selectAll(".line").style("opacity", 1)  // Reset opacity
                           .style("stroke-width", "1.5");  // Reset stroke width
    })
    .on("click", function([key, values]) {
      // Adjust the yScale domain to focus on the selected line and redraw the y-axis and the lines.
      yScale.domain(d3.extent(values, d => d.gdp));
      svg.select(".y.axis").call(yAxis);
      svg.selectAll(".line").attr("d", ([key, values]) => line(values));
    });
    
  // Draw legend
  country.append("text")
    .datum(([key, values]) => ({country: key, value: values[values.length - 1]}))
    .attr("transform", function(d) { 
      return "translate(" + xScale(d.value.year) + "," + yScale(d.value.gdp) + ")"; 
    })
    .attr("x", 3)
    .attr("dy", "0.35em")
    .style("font", "10px sans-serif")
    .text(d => d.country);
})
.catch(function(error){
  console.log('There was a problem processing your data: ', error);
});

// Back button functionality
d3.select("#back").on("click", function() {
  // reload the page
  location.reload();
});
