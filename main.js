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
  const dataByCountry = d3.group(parsedData, d => d.country);
  const countries = Array.from(dataByCountry.keys());

  color.domain(countries);

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
    .data(Array.from(dataByCountry))
    .enter().append("g")
      .attr("class", "country");
  
  country.append("path")
    .attr("class", "line")
    .attr("d", ([key, values]) => line(values))
    .style("stroke", ([key, values]) => color(key))
    .on('click', function(event, [key, values]) {
        // Update scales
        yScale.domain([0, d3.max(values, d => d.gdp)]);
        xScale.domain(d3.extent(values, d => d.year));
  
        // Update axes
        svg.select('.x.axis').transition().call(xAxis);
        svg.select('.y.axis').transition().call(yAxis);
  
        // Redraw line
        d3.select(this).attr("d", line(values));
  
        // Show back button
        d3.select("#back").style("visibility", "visible");
    })
    .on('mouseover', function() {
        d3.selectAll('.line')
          .style('opacity', 0.2)
          .style('stroke-width', '1px');
        d3.select(this)
          .style('opacity', 1)
          .style('stroke-width', '3px');
    })
    .on('mouseout', function() {
        d3.selectAll('.line')
          .style('opacity', 1)
          .style('stroke-width', '2px');
    });


  // Draw legend
  country.append("text")
    .datum(([key, values]) => ({id: key, value: values[values.length - 1]}))
    .attr("transform", function(d) { return "translate(" + xScale(d.value.year) + "," + yScale(d.value.gdp) + ")"; })
    .attr("x", 3)
    .attr("dy", ".35em")
    .style("font", "10px sans-serif")
    .text(function(d) { return d.id; });
});

// Back button functionality
d3.select("#back").on("click", function() {
  // reload the page
  location.reload();
});
