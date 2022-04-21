let binCount = 8;
let maxCircleCount = 40;
let transitDuration = 1000;

// Colors
let colorNil = 'lightgrey';
let colorTags = {
    "lewd": '#41ae76',
    "offensive": '#3690c0',
    "intent": '#ef6548'
};

let colorTagsList = {
    "lewd": ['#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#006d2c', '#006d2c','#00441b'],
    "offensive": ['#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#045a8d', '#045a8d','#023858'],
    "intent": ['#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#045a8d', '#b30000','#7f0000']
};

let colors = {};
tags.forEach(tag => {
    colors[tag] = d3.scaleLinear().domain([0,1]).range(colorTagsList[tag]);
})

let mixScale = d3.scaleLinear()
    .range([0.2, 0.8])

let radiusScale = d3.scaleLinear()
    .range([0.2, 1])
// let colors = d3.scaleOrdinal()
//     .domain(tags)
//     .range(['#fbb4ae','#b3cde3','#ccebc5']);

let xScale = d3.scaleLinear()
    .range([0, width]);

let yScale = d3.scaleBand()
    .domain(tags)
    .range([margin.top, height])
    .paddingOuter(1)

let rScale = d3.scaleLinear()
    .range([15, 30, 35]);

// append svg element to the body of the page
// set dimensions and position of the svg element
let svg = d3
    .select("#densitymap")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("click", function (d) {
        setRange(Math.max(0, 2 * start - end), Math.min(dcount, 2 * end - start));
    })
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// add line chart title
svg
    .append("text")
    .attr("id", "line_chart_title")
    .attr("x", width / 2)
    .attr("y", -50)
    .attr("text-anchor", "middle")
    .style("font-size", "24")
    .text("Distribution of classified sentences");

var xAxis = svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", "translate(0, " + margin.top + ")");

var legend = svg.append("g")
    .attr("id", "legend")

var detail = svg.append("text")
    .attr("transform", "translate(0," + (height - 40) + ")");
var groups = svg.append("text")
    .attr("transform", "translate(0," + (height - 20) + ")");
var impli = svg.append("text")
    .attr("transform", "translate(0," + (height) + ")");

tags.forEach(tag => {
    legend.append("text")
    .attr("x", 30 + width)
    .attr("y", yScale(tag))
    .attr("class", "label")
    .text(tag);
})

// Create data for density map
function createGraphData() {
    var preparedData = [];
    if (end - start <= maxCircleCount ) {
        dataFiltered.forEach((d, i) => {
            tags.forEach(tag => {
                preparedData.push({
                    x: start + i,
                    type: tag,
                    value: (d[tag] !== undefined) | 0,
                    r: 10
                })
            })
        })
    } else {
        bins = d3.histogram()
            .value((d, i) => start + i)
            .thresholds(binCount);
        bins(dataFiltered).forEach(bin => {
            tags.forEach(tag => {
            
                let tagCount = 0;
                bin.forEach((d) => {
                    if (d[tag] == 1) {
                        tagCount++;
                    }
                })
                let value = tagCount / bin.length;
                preparedData.push({
                    x: bin.x0,
                    bin: [bin.x0, bin.x1],
                    type: tag,
                    value: value,
                    r: rScale(end - start)
                })
            })
        })
        
    }
    let extent = d3.extent(preparedData, d => d.value)
    radiusScale.domain(extent);
    mixScale.domain(extent);
    return preparedData;
}

function drawGraph(graphData) {

    let sentenceCircles = svg.selectAll(".sentence")
        .data(graphData);

        sentenceCircles.exit().transition().duration(transitDuration)
        .attr("cx", width)
        .attr("cy", d => yScale(d.type))
        .attr("r", 0)
        .remove();
    
        

        sentenceCircles.enter()
        .append("circle")
        .attr("class", "sentence")
        .on("click", function (d) {
            if (d["bin"] !== undefined) {
                d3.select(this)
                 .attr("r", d.r + 20)
                setRange(d.bin[0], d.bin[1]);
            }
        })
        .on("mouseover", function(d) {
            detail.text("Sentence (Example): " + data[d.x].input_string);
            
            if (d["bin"] !== undefined) {
                var groupText = []
                var impliText = []
                for (i = d.bin[0]; i < d.bin[1]; i++) {
                    if (data[i].group !== undefined) {
                        groupText.push(data[i].group);
                    }
                    if (data[i].implication !== undefined) {
                        impliText.push(data[i].implication);
                    }
                }
                if (groupText.length > 0) {
                    groups.text("Group: " + groupText.join(" | "));
                }
                if (impliText.length > 0) {
                    impli.text("Implication: " + impliText.join(" | "));
                }
            } else {
                if (data[d.x].group !== undefined) {
                    groups.text("Group: " + data[d.x].group);
                }
                if (data[d.x].implication !== undefined) {
                    impli.text("Implication: " + data[d.x].implication);
                }
            }
        })
        .on("mouseout", function(d) {
            detail.text("")
            groups.text("")
            impli.text("")
        })
        .attr("cx", width)
        .attr("cy", d => yScale(d.type))
        
        .transition().duration(transitDuration)   
        .attr("cx", d => xScale(d.x))
        .attr("r", radius)
        .attr("fill", fill);

        

        sentenceCircles
        .transition().duration(transitDuration)
        .attr("class", "sentence")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.type))
        .attr("r", radius)
        .attr("fill", fill);

    function radius(d) {
        return d.r * radiusScale(d.value)
    }

    function fill(d) {
        if (d.value == 0) {return colorNil;}
        if (d.value == 1) {return colorTags[d.type]}
        return d3.interpolateRgb(colorNil, colorTags[d.type])(mixScale(d.value));
    }
}
