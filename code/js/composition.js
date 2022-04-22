var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip");

chart_width = 500;
chart_height = 400;

var chart = venn
  .VennDiagram()
  .width(chart_width)
  .height(chart_height);

var venn_div = d3.select("#venn");

function createVennData() {
  var vennSets = [
    { sets: [0], label: "Intent", size: 0 },
    { sets: [1], label: "Offensive", size: 0 },
    { sets: [0, 1], size: 0 },
    { sets: [2], label: "Lewd", size: 0 },
    { sets: [0, 2], size: 0 },
    { sets: [1, 2], size: 0 },
    { sets: [0, 1, 2], size: 0 },
  ];

  dataFiltered.forEach((d) => {
    if (d.flag != 0) {
      vennSets[d.flag - 1].size += 1;
    }
    bt = d.flag;
    if (bt & (1 == 1)) {
      vennSets[0].size += 1;
    }
    bt >>= 1;
    if (bt & (1 == 1)) {
      vennSets[1].size += 1;
    }
    bt >>= 1;
    if (bt & (1 == 1)) {
      vennSets[3].size += 1;
    }
  });
  return vennSets;
}

function drawVenn(data) {
  let totalSize = d3.sum(data, (d) => d.size);
  if (totalSize == 0) {
    return;
  }

  venn_div.datum(data).call(chart);

  venn_div
    .selectAll("path")
    .style("stroke-opacity", 0)
    .style("stroke", "#fff")
    .style("stroke-width", 3);

  venn_div
    .selectAll("g")
    .on("mouseover", function (d) {
      // sort all the areas relative to the current item
      venn.sortAreas(venn_div, d);

      // Display a tooltip with the current size
      tooltip
        .transition()
        .duration(400)
        .style("opacity", 0.9);
      tooltip.text(d.size + " entries");

      d3.select(".tooltip").style("display", "block");

      // highlight the current path
      var selection = d3
        .select(this)
        .transition("tooltip")
        .duration(400)
        .style("display", "block");
      selection
        .select("path")
        .style(
          "fill-opacity",
          d.sets.length == 1 ? 0.4 : 0.1
        )
        .style("stroke-opacity", 1);
    })

    .on("mousemove", function () {
      tooltip
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })

    .on("mouseout", function (d, i) {
      tooltip
        .transition()
        .duration(400)
        .style("opacity", 0);
      var selection = d3
        .select(this)
        .transition("tooltip")
        .duration(400);
      selection
        .select("path")
        .style(
          "fill-opacity",
          d.sets.length == 1 ? 0.25 : 0.0
        )
        .style("stroke-opacity", 0);
    });
}

var pie_width = 400;
pie_height = 400;
var radius = Math.min(pie_width, pie_height) / 2;
// var pie_color = d3
//   .scaleOrdinal()
//   .domain(["a", "b", "c", "d", "e", "f"])
//   .range(d3.schemeDark2);
pie_color = [
  "#5c2223",
  "#eea2a4",
  "#a7535a",
  "#856d72",
  "#eea6b7",
  "#4f383e",
  "#ad6598",
  "#7e2065",
  "#e2e1e4",
  "#74759b",
  "#475164",
  "#3170a7",
  "#baccd9",
  "#c6e6e8",
  "#45b787",
  "#bec936",
  "#fbda41",
  "#d6a01d",
  "#fb8b05",
  "#ea8958",
];

var svg_pie = d3
  .select("#pie")
  .append("svg")
  .attr("width", pie_width)
  .attr("height", pie_height)
  .append("g")
  .attr(
    "transform",
    "translate(" +
      pie_width / 2 +
      "," +
      pie_height / 2 +
      ")"
  );

function createPieData() {
  return dataFiltered.reduce((obj, d) => {
    if (d.group !== undefined) {
      if (d.group in obj) {
        obj[d.group]++;
      } else {
        obj[d.group] = 1;
      }
    }
    return obj;
  }, {});
}

function drawPie(data) {
  if (data.length == 0) {
    return;
  }

  var pie = d3
    .pie()
    .value(function (d) {
      return d.value;
    })
    .sort(function (a, b) {
      return d3.ascending(a.key, b.key);
    }); // This make sure that group order remains the same in the pie chart
  var pie_data = pie(d3.entries(data));
  color = 0;
  console.log("pie_data, ", pie_data);

  // map to data
  var u = svg_pie.selectAll("path").data(pie_data);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  u.enter()
    .append("path")
    .style("fill-opacity", 0.7)
    .style("stroke-opacity", 0)
    .style("stroke", "#fff")
    .style("stroke-width", 3)
    .on("mouseover", function (d) {
      tooltip
        .transition()
        .duration(400)
        .style("opacity", 0.9);
      tooltip.text(d.data.key);

      d3.select(".tooltip").style("display", "block");

      d3.select(this)
        .transition("tooltip")
        .duration(400)
        .style("display", "block")
        .style("fill-opacity", 0.9)
        .style("stroke-opacity", 1);
    })
    .on("mousemove", function () {
      tooltip
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 28 + "px");
    })

    .on("mouseout", function () {
      tooltip
        .transition()
        .duration(400)
        .style("opacity", 0);
      d3.select(this)
        .transition("tooltip")
        .duration(400)
        .style("fill-opacity", 0.7)
        .style("stroke-opacity", 0);
    })

    .merge(u)
    .transition()
    .duration(1000)
    .attr("d", d3.arc().innerRadius(0).outerRadius(radius))
    .attr("fill", function (d) {
      console.log(d.index);
      return pie_color[d.index];
      //   return pie_color(d.data.key);
    })
    .style("opacity", 1);

  // add text to pie chart
  //   u.enter()
  //     .append("text")
  //     .text(function (d) {
  //       return d.data.key;
  //     })
  //     .attr("transform", function (d) {
  //       return (
  //         "translate(" +
  //         d3
  //           .arc()
  //           .innerRadius(0)
  //           .outerRadius(radius)
  //           .centroid(d)
  //           .map((x) => x * 1.5) +
  //         ")"
  //       );
  //     })
  //     .style("text-anchor", "middle")
  //     .style("font-size", 10);

  // remove the group that is not present anymore
  u.exit().remove();
}
