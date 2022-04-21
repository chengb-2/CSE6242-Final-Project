var margin = {
    top: 50,
    right: 100,
    bottom: 50,
    left: 100,
    },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom,
    color = d3.schemeCategory10;

var start, end, dcount;
var data, dataFiltered, dataView, dataLoaded = false;

// define tags used
let tags = ["lewd", "offensive", "intent"];

// Fetch the data
var pathToCsv = "data/sent_predict.csv";

d3.dsv(",", pathToCsv, function (d, i) {
    ret = {
        i: i,
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
    dcount = dataSet.length;
    rScale.domain([0, dcount]);
    initSlider();
    dataLoaded = true;

    endUpdate();
        
}).catch(function (error) {
    console.log(error);
});

// Encode flag
// e.g. flag = 0b101 means lewd, not offensive, intent.
function encodeFlag(isLewd, isOffensive, isIntent) {
    return ((isLewd | 0) << 2) + ((isOffensive | 0) << 1) + ((isIntent | 0));
}

function decodeFlag(flag) {
    return {
        intent: (flag & 1) == 1,
        offensive: (flag & 2) == 2,
        lewd: (flag & 4) == 4,
    }
}

// Called when data range is updated
function update() {
    if (!dataLoaded || end <= start) {
        return;
    }
    
    dataFiltered = data.filter((d, i) => {
        return i >= start && i < end;
    })

    // Check if word cloud is available
    if (end - start < maxWordCloud) {
        wordcloudButton.style("display", "block");
        wordcloudMsg.style("display", "none");
    } else {
        wordcloudButton.style("display", "none");
        wordcloudMsg.style("display", "block");
        wordcloudMsg.html("Data range exceeds limit (" + maxWordCloud + ").")
    }

    if ($('#collapseTwo').hasClass('show')) {
        drawVenn(createVennData());
        drawPie(createPieData());
    }

    // Draw density graph
    xScale.domain([start - 2, end + 2]);
    xAxis.transition().duration(transitDuration).call(d3.axisTop(xScale).ticks(10).tickSize(-(height - 110)))
    
    drawGraph(createGraphData());

}

function endUpdate() {
    update();

    if ($('#collapseOne').hasClass('show') && (end - start) < maxWordCloudRT) {
        drawWordCloud();
    }

    // Draw Venn Diagram
    drawVenn(createVennData());
    drawPie(createPieData());

    // Compute Statistics
    createStatistics();
    clearView();
}