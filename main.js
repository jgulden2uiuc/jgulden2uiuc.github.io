// main.js

// Width and height of the chart
const width = 960, height = 500;
const margin = {top: 70, right: 80, bottom: 40, left: 80};

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
            "translate(" + (width/2 - margin.left) +  " ," + 
                           (height - margin.top) + ")")
      .style("text-anchor", "middle")
      .style("font", "16px sans-serif")
      .style("fill", "#e6e6e6")
      .text("Year");

svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x",0 - (height / 2) + margin.top)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font", "16px sans-serif")
      .style("fill", "#e6e6e6")
      .text("GDP per capita");

// Title
svg.append("text")
  .attr("x", (width / 2) - margin.left/2)             
  .attr("y", 0 - (margin.top / 2))
  .attr("text-anchor", "middle")  
  .style("font-size", "20px") 
  .style("text-decoration", "underline")
  .style("fill", "#e6e6e6")
  .text("GDP Per Capita for the Top 5 Economies (1960-2022)");

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

  let selectedLine = null;

  // Line mouseover and mouseout events
  function handleMouseOver(d, i) {
    // Always highlight the hovered line
    d3.select(this).style("opacity", 1).style("stroke-width", "2.5px");

    // De-emphasize all other lines, including the selected one
    d3.selectAll(".line").filter(":not(:hover)").style("opacity", 0.2);
  }

  function handleMouseOut(d, i) {
    if (selectedLine) {
    // If a line is selected
    if (this !== selectedLine) {
      d3.select(this).style("opacity", 0.1).style("stroke-width", "1px");
    }
    if (this !== selectedLine) {
      d3.select(selectedLine).style("opacity", 1).style("stroke-width", "2.5px");
    }
  } else {
    // If no line is selected, return all lines to original state
    d3.selectAll(".line").style("opacity", 1).style("stroke-width", "1.5px");
  }
  }

  // Array with the country information
  const countryInformationTexts = {
    "China": "Over the past 20 years, China has seen steady growth in GDP per capita, with an even more ascendant GDP for an even longer period. This was facilitated in large part by the reforms of Chinese Premier Deng Xiaoping in the 1980s, which opened up China to international commerce and paved the way for its current status as a new global economic powerhouse. This growth is especially impressive given China's massive population growth over the same period. However, with a projected population decrease in the coming decades, it is likely that China will see much higher GDP per capita as the Chinese middle class solidifies.",
    "United Kingdom": "Many economists argue that the UK saw an economic decline following the 1960s as a result of industrial expansion in Western Europe and elsewhere. However, due to the population slump from the 1980s to the 2000s, we can see that GDP per capita barely slowed down over the same period. That is not to say the UK has not taken measures to address its output problem. Over the past few decades, the British government worked within the European Union to seek economic growth stimuli. This was quite successful, allowing the UK to maintain both a top-tier GDP and GDP per capita. However, the future of the British economy outside of the EU is uncertain.",
    "India": "Among the top five global economies, India's GDP per capita is relatively small. This is due in large part to a massive and ever-increasing population, as well as a lower GDP in general. Only since 1991, when there was a financial crisis in the country, did India begin to adopt poolicies of economic liberalization. As such, we may see a much higher GDP per capita for India in the future, as long as population growth does not outpace GDP growth.",
    "Japan": "Due to its highly educated and abundant labor force and to the concentration of capital and resources in certain key industries, such as electric power and steel, postwar Japan has been a booming economy for the better part of a century. Its unique geopolitical position in the Cold War, with trade partners in both the Soviet Union and United States, gave it a great advantage. Despite slowed growth due to the 'Lost Decade' caused by economic troubles in the 1990s, Japan has stayed near the top in terms of GDP and GDP per capita. Coupled with a slow-growing (and now declining) population, it is no wonder that Japan has managed to hold onto a very high GDP per capita.",
    "United States": "The story of US economic expansion post-WWII is widely known. Without the devastation of the war on home territory, and with a thriving and growing workforce bolstered by a housing boom and other government programs, the US GDP increased significantly between 1945 and 1970. In fact, its GDP and population growth have both been growing relatively stably since 1960, making for an accordingly stable growth in GDP per capita. We can see some rockiness in the 1970s due to unprecedented inflation, but the United States remains at the top of GDP rankings."
  };

  // Line click events
  function handleClick(event, d) {
    // De-emphasize all lines
    svg.selectAll(".line").style('opacity', 0.2).style('stroke-width', '1px');

    // Highlight the clicked line and update the selectedLine variable
    d3.select(this).style('opacity', 1).style('stroke-width', '2.5px');
    selectedLine = this;
      
      // Update the y-axis according to the selected line's data
      const selectedData = d[1];
      const newMax = selectedData[selectedData.length - 1].gdp + 1000;
      const minGDP = d3.min(selectedData, d => d.gdp);  // find the minimum gdp of the selected line

      yScale.domain([minGDP, newMax]).nice();
      svg.selectAll(".y.axis").call(yAxis);

      // Hide lines with data above the new y-axis maximum and below the new minimum
      svg.selectAll(".line")
        .attr('d', function([key, values]) {
          const filteredValues = values.filter(v => v.gdp >= minGDP && v.gdp <= newMax);
          return line(filteredValues);
        });

      // Adjust the legend
      svg.selectAll(".legend")
        .attr("transform", function(d) { 
          return "translate(" + xScale(d.value.year) + "," + yScale(d.value.gdp) + ")"; 
        });

      // Update the text box
      const countryName = d[0];
      document.getElementById("info-right").innerText = countryInformationTexts[countryName] || "No information available";
      
      backButton.style('display', 'block');
}

// Attach events to lines
svg.selectAll(".line")
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut)
  .on("click", handleClick);

  
  country.append("path")
    .attr("class", "line")
    .attr("d", ([key, values]) => line(values))
    .style("stroke", ([key, values]) => color(key))
    .on("mouseover", handleMouseOver)
    .on("mouseout", handleMouseOut)
    .on("click", handleClick);
    
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
});
