// main.js

// Width and height of the chart
const width = 960, height = 500;
const margin = {top: 60, right: 80, bottom: 60, left: 80};

// Create SVG
const svg = d3.select('#chart').append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Back button
const backButton = d3.select("#back");

// Create Scales
const xScale = d3.scaleLinear().range([0, width - margin.left - margin.right]);
const yScale = d3.scaleLinear().range([height - margin.top - margin.bottom, 0]);

// Create Axis
const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
const yAxis = d3.axisLeft(yScale);

// Axis titles
svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height - margin.top + 30) + ")")
      .style("text-anchor", "middle")
      .style("font", "16px sans-serif")
      .text("Year");

svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left - 30)
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font", "16px sans-serif")
      .text("GDP per capita");

// Create Color Scale
const color = d3.scaleOrdinal(d3.schemeCategory10);

// Create line generator
const line = d3.line()
  .x(function(d) { return xScale(d.year); })
  .y(function(d) { return yScale(d.gdp); });

// Function to disable the mouse events
function disableMouseEvents() {
  svg.selectAll(".line")
    .style("pointer-events", "none");
}

// Function to enable the mouse events
function enableMouseEvents() {
  svg.selectAll(".line")
    .style("pointer-events", "all");
}

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
      d3.selectAll(".line").style("opacity", 0.2);
      d3.select(this).style("opacity", 1).style("stroke-width", "2.5px");
    })
    .on("mouseout", function() {
      d3.selectAll(".line").style("opacity", 1).style("stroke-width", "1.5px");
    })
    .on('click', function(event, d) {
      // Highlight the selected line
      svg.selectAll(".line")
        .style('opacity', 0.1)
        .style('stroke-width', '1px');

      d3.select(this)
        .style('opacity', 1)
        .style('stroke-width', '2.5px');
      
      // Update the y-axis according to the selected line's data
      const selectedData = d[1];
      yScale.domain(d3.extent(selectedData, d => d.gdp)).nice();
      svg.selectAll(".y.axis").call(yAxis);
      
      // Hide lines with data below the new y-axis minimum
      svg.selectAll(".line")
        .attr('d', function([key, values]) {
          const filteredValues = values.filter(v => v.gdp >= yScale.domain()[0]);
          return line(filteredValues);
        });

      // Adjust the legend
      svg.selectAll(".legend")
    .attr("transform", function(d) { 
      return "translate(" + xScale(d.value.year) + "," + yScale(d.value.gdp) + ")"; 
    });
      
      backButton.style('display', 'block');
      disableMouseEvents();
    });
    
  // Draw legend
  country.append("text")
    .attr("class", "legend") // Add this line
    .datum(([key, values]) => ({country: key, value: values[values.length - 1]}))
    .attr("transform", function(d) { 
      return "translate(" + xScale(d.value.year) + "," + yScale(d.value.gdp) + ")"; 
    })
    .attr("x", 3)
    .attr("dy", "0.35em")
    .style("font", "10px sans-serif")
    .text(d => d.country);
});

// On click event of the back button
backButton.on("click", function() {
  location.reload();
  enableMouseEvents();  // Enable the mouse events when the back button is clicked
});
