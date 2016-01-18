var width = 900,
    height = 105,
    cellSize = 12; // cell size
    week_days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
	
var day = d3.time.format("%w"),
    week = d3.time.format("%U"),
    percent = d3.format(".1%"),
	format = d3.time.format("%Y%m%d");
	parseDate = d3.time.format("%Y%m%d").parse;

var globalData = [];  
		
var color = d3.scale.category20()
    .domain([0, 1]);

var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("visibility", "hidden");

var zoomdiv = d3.select("body").append("div") 
        .attr("class", "tooltip")       
        .style("opacity", 0);

//==================================================
function zoom() {
    console.log(d3.select(this).attr('id'));
    console.log(d3.event.scale);
    d3.select(this).select("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
}
function stopZoom() {
    console.log(d3.select(this).attr('id'));
    d3.select(this).select("g").attr("transform", "translate(132,20)scale(1)");
}

// define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
var zoomListener = d3.behavior.zoom().scaleExtent([1, 1.8]).on("zoom", zoom);
var stopZoomListener = d3.behavior.zoom().scaleExtent([1, 1]).on("zoom", stopZoom);
    
var svg = d3.select(".calender-map").selectAll("svg")
    .data(d3.range(2011, 2015))
  .enter().append("svg")
    .attr("width", '100%')
    .attr("data-height", '0.5678')
    .attr("viewBox",'0 0 900 105')
    .attr("id", function (d) { return d })
    //.attr("style", "outline: thin solid red;")
    .attr("class", "RdYlGn")//.call(zoomListener)
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");

svg.append("text")
    .attr("transform", "translate(-38," + cellSize * 3.5 + ")rotate(-90)")
    .style("text-anchor", "middle")
    .text(function(d) { return d; })
    .on('click', function() {
        var id = d3.select(this.parentNode.parentNode);
           console.log(id[0][0].clientHeight);
        if (id[0][0].clientHeight===340) {
          d3.select(this.parentNode.parentNode).attr("height", 183)
          .call(stopZoomListener);
          //d3.select(this).select("g").attr("transform", "translate(132,20)scale(1)")
        } else{
          d3.select(this.parentNode.parentNode).attr("height", 340)
          .call(zoomListener);
          //d3.select(this).select("g").attr("transform", "translate(132,20)scale(2)")
        };
    })
    .on("mouseover", function(d) {    
        zoomdiv.transition()    
          .duration(400)    
          .style("opacity", .9);    
        zoomdiv .html("<span style='line-height: 25px;'><strong>Toggle Zoom</strong></span>")  
            .style("top", (d3.event.pageY - 40) + "px").style("left", (d3.event.pageX - 62) + "px");
        })          
      .on("mouseout", function(d) {   
          zoomdiv.transition()    
            .duration(500)    
            .style("opacity", 0); 
      });
 
for (var i=0; i<7; i++)
{    
svg.append("text")
    .attr("transform", "translate(-5," + cellSize*(i+1) + ")")
    .style("text-anchor", "end")
    .attr("dy", "-.25em")
    .text(function(d) { return week_days[i]; }); 
 }

var rect = svg.selectAll(".day")
    .data(function(d) { return d3.time.days(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter()
	.append("rect")
    .attr("class", "day")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return week(d) * cellSize; })
    .attr("y", function(d) { return day(d) * cellSize; })
    .attr("fill",'#fff')
    .datum(format);

var legend = svg.selectAll(".legend")
      .data(month)
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (((i+1) * 50)+8) + ",0)"; });

legend.append("text")
   .attr("class", function(d,i){ return month[i] })
   .style("text-anchor", "end")
   .attr("dy", "-.25em")
   .text(function(d,i){ return month[i] });
   
svg.selectAll(".month")
    .data(function(d) { return d3.time.months(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("class", "month")
    .attr("id", function(d,i){ return month[i] })
    .attr("d", monthPath);

d3.csv("data.csv", function(error, csv) {

  csv.forEach(function(d) {
    d.Comparison_Type = parseInt(d.Comparison_Type);
  });

 var Comparison_Type_Max = d3.max(csv, function(d) { return d.Comparison_Type; });
 
  var data = d3.nest()
    .key(function(d) { return d.Date; })
    .rollup(function(d) { return  Math.sqrt(d[0].Comparison_Type / Comparison_Type_Max); })
    .map(csv);
	globalData = data;
  rect.filter(function(d) { return d in data; })
      .attr("fill", function(d) { return color(data[d]); })
	  .attr("data-title", function(d) { return "value : "+Math.round(data[d]*100)})
    .on('mouseover', function(d, i, j) {
      d3.select('#colLabel_' + i).classed("hover", true);
      d3.select('#rowLabel_' + j).classed("hover", true);
      if (d != null) {
          tooltip.html('<div class="heatmap_tooltip">' + data[d].toFixed(3) + '</div>');
          tooltip.style("visibility", "visible");
      } else
          tooltip.style("visibility", "hidden");
      })
      .on('mouseout', function(d, i, j) {
          d3.select('#colLabel_' + i).classed("hover", false);
          d3.select('#rowLabel_' + j).classed("hover", false);
          tooltip.style("visibility", "hidden");
      })
      .on("mousemove", function(d, i) {
          tooltip.style("top", (d3.event.pageY - 60) + "px").style("left", (d3.event.pageX - 50) + "px");
      })
      .on('click', function() {
          //console.log(d3.select(this));
      });  
	
    });

function numberWithCommas(x) {
    x = x.toString();
    var pattern = /(-?\d+)(\d{3})/;
    while (pattern.test(x))
        x = x.replace(pattern, "$1,$2");
    return x;
}

function monthPath(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = +day(t0), w0 = +week(t0),
      d1 = +day(t1), w1 = +week(t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

//==================================================
d3.select("#palette")
  .on("keyup", function() {
    var newPalette = d3.select("#palette").property("value");
    if (newPalette != null)                     // when interfaced with jQwidget, the ComboBox handles keyup event but value is then not available ?
            changePalette(newPalette, globalData);
        })
        .on("change", function() {
          var newPalette = d3.select("#palette").property("value");
          changePalette(newPalette, globalData);
  });

function changePalette(paletteName, globalData) {
  var colors = [];
  var colorScale = [];

  switch(paletteName) {
    case "Cat20":
        colorScale = d3.scale.category20();
        break;
    case "Cat20b":
        colorScale = d3.scale.category20b();
        break;
    case "Cat20c":
        colorScale = d3.scale.category20c();
        break;
    default:
        colors = colorbrewer[paletteName][11];
        var colorScale = d3.scale.quantize()
          .domain([0.0, 1.0])
          .range(colors);
        break;
  }

  d3.selectAll(".day")
    .style("fill", function(d) {
      if (d != null) return colorScale(globalData[d]);
      else return "url(#diagonalHatch)";
    });
}    

console.log(colorbrewer);