
// define the dimensions and margins for the line chart
// define the dimensions and margins for the bar chart
// Use the same Margin Convention from HW1 Q3: https://poloclub.github.io/cse6242-2022spring-online/hw1/8rEHLaYmr9 _margin_convention.pdf to layout your graph
var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 150,
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    color = d3.schemeCategory10;


var start, end;
var dcount = 1000;
var scale = 1;
var data, dataLoaded = false;

let binCount = 8;
let maxCircleCount = 40;
let maxWordCloud = 500;
let transitDuration = 1000;

// define tags used
let tags = ["lewd", "offensive", "intent"];

let colorList = ['#fbb4ae','#b3cde3','#ccebc5','#decbe4','#fed9a6','#ffffcc','#e5d8bd','#fddaec']
let tagsColor = [
    ['#fff7ec','#fee8c8','#fdd49e','#fdbb84','#fc8d59','#ef6548','#d7301f','#990000'],
    ['#f7fcfd','#e5f5f9','#ccece6','#99d8c9','#66c2a4','#41ae76','#238b45','#005824'],
    ['#fff7fb','#ece7f2','#d0d1e6','#a6bddb','#74a9cf','#3690c0','#0570b0','#034e7b']
]
// let colors = {}
// tags.forEach((tag, i) => {
//     colors[tag] = d3.scaleQuantize().domain([0,1]).range(tagsColor[i]);
// })
let colors = d3.scaleOrdinal()
    .domain(tags)
    .range(['#fbb4ae','#b3cde3','#ccebc5']);

let xScale = d3.scaleLinear()
    .range([0, width]);

let yScale = d3.scaleBand()
    .domain([0, 1, 2])
    .range([margin.top, height])
    .paddingOuter(1)

let rScale = d3.scaleLinear()
    .domain([0, dcount])
    .range([40, 100]);

// append svg element to the body of the page
// set dimensions and position of the svg element
let svg = d3
    .select("#svg")
    .append("svg")
    .attr("id", "beeswarm")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .on("click", function (d) {
        let range = Math.min(end - start, 50);
        setRange(Math.max(0, start - range), Math.min(dcount, end + range));
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
    .attr("transform", "translate(" + -margin.left + "," + height + ")");
var groups = svg.append("text")
    .attr("transform", "translate(" + -margin.left + "," + (height + 20) + ")");
var impli = svg.append("text")
    .attr("transform", "translate(" + -margin.left + "," + (height + 40) + ")");

tags.forEach((tag, tag_i) => {
    // legend.append("circle")
    // .attr("cy", key_i * legend_padding)
    // .attr("r", 3)
    // .attr("fill", color);
    legend.append("text")
    .attr("x", -margin.left)
    .attr("y", yScale(tag_i))
    .attr("class", "label")
    .text(tag);
})

// Fetch the data
var pathToCsv = "data/founta_predict.csv";

// Encode flag
// e.g. flag = 0b101 means lewd, not offensive, intent.
function encodeFlag(isLewd, isOffensive, isIntent) {
    return ((isLewd | 0) << 2) + ((isOffensive | 0) << 1) + isIntent;
}

function update() {
    setWordCloud(false);
    if (!dataLoaded || end <= start) {
        return;
    }
    xScale.domain([start - 2, end + 2]);
    xAxis.transition().duration(transitDuration).call(d3.axisTop(xScale));
    drawGraph(createGraphData(start, end), 60);
}

function createGraphData(start, end) {
    let dataCount = end - start;
    let data_window = data.filter((d, i) => {
        return i >= start && i < end;
    })
    setWordCloud(dataCount < maxWordCloud);
    if (dataCount <= maxCircleCount ) {
        var preparedData = [];
        data_window.forEach((d, i) => {
            tags.forEach((tag, tag_i) => {
                preparedData.push({
                    x: start + i,
                    type: tag_i,
                    value: (d[tag] !== undefined) | 0,
                    r: 10
                })
            })
        })
        return preparedData;
    } else {
        bins = d3.histogram()
            .value((d, i) => start + i)
            .thresholds(binCount);
        
        var preparedData = [];
        bins(data_window).forEach((bin) => {
            tags.forEach((tag, tag_i) => {
            
                let tagCount = 0;
                bin.forEach((d) => {
                    if (d[tag] == 1) {
                        tagCount++;
                    }
                })
                let value = tagCount / bin.length;
                preparedData.push({
                    x: (bin.x0 + bin.x1) / 2,
                    bin: [bin.x0, bin.x1],
                    type: tag_i,
                    value: value,
                    r: rScale(end - start) * value
                })
            })
        })
        return preparedData;
    }
    
}

function drawGraph(graphData, radiusScale) {

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
                update();
            }
        })
        .on("mouseover", function(d) {
            detail.text("Sentence: " + data[d.x].input_string);
            
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
                groups.text("Group: " + groupText.join(" | "));
                impli.text("Implication: " + impliText.join(" | "));
            } else {
                groups.text("Group: " + data[d.x].group);
                impli.text("Implication: " + data[d.x].implication);
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
        .attr("r", d => d.r)
        .attr("fill", d => {
            if (d.value > 0) {return colorList[d.type]}
            else {return d3.color("lightgrey")}
        })

        

        sentenceCircles
        .transition().duration(transitDuration)
        .attr("class", "sentence")
        .attr("cx", d => xScale(d.x))
        .attr("cy", d => yScale(d.type))
        .attr("r", d => d.r)
        .attr("fill", d => {
            if (d.value > 0) {return colorList[d.type]}
            else {return d3.color("lightgrey")}
        })
}

// Word cloud
var wordcloudButton = d3.select("#start-cloud");
wordcloudButton.on("click", () => {
    drawWordCloud(data.filter((d, i) => {
        return i >= start && i < end;
    }));
})

var svg_cloud = d3.select("#wordcloud").append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var wordCloud = svg_cloud
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

function setWordCloud(enable) {
    if (enable) {
        wordcloudButton.style('display', 'block');
    } else {
        wordcloudButton.style('display', 'none');
        wordCloud.selectAll("text").remove();
    }
}

function drawWordCloud(data) {
    wordcloudButton.style('display', 'none');
    var wordList = [];
    data.forEach(d => {
        let words = d.input_string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]?/g,"")
        .split(' ').filter(w => w.length > 4 ).map(w => {
            var size = 24
            if (w.length > 7) {size -= 4;}
            if (w.charAt(0) == '@') {size -= 8;}
            if (d.flag > 0) {size += 12;}
            return {
                text: w,
                size: size
            }
        })
        wordList = wordList.concat(words);
    })
    console.log(wordList)
    d3.layout.cloud()
        .size([width, height])
        .spiral("archimedean")
        .padding(5)
        .rotate(0)
        .fontSize(d => d.size)
        .words(wordList)
        .on("end", draw)
        .timeInterval(5)
        .start();
}

function draw(words) {
    wordCloud
        .selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", function(d) { return d.size + "px"; })
        .style("fill", "grey")
        .attr("text-anchor", "middle")
        .style("font-family", "Georgia")
        .transition().duration(transitDuration)
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}

d3.dsv(",", pathToCsv, function (d) {
    ret = {
        input_string: d.input_string,
        flag: encodeFlag(d.lewd == 'Y', d.offensive == 'Y', d.intent == 'Y'),
    }
    if (d.group != "nan") {
        ret.group = d.group;
    }
    if (d.implication != "nan") {
        ret.implication = d.implication;
    }
    tags.forEach((tag) => {
        if (d[tag] == 'Y') {
            ret[tag] = 1;
        }
    })

    return ret;
    })
    .then(function (dataSet) {
    // you should see the data in your browser's developer tools console
    console.log("data read", dataSet);

    data = dataSet;
    dataLoaded = true;

    update();
        
    })
    .catch(function (error) {
    console.log(error);
    });