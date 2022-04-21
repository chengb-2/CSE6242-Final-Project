// Word cloud
let maxWordCloud = 10000;
let maxWordCloudRT = 500;
var wordcloudButton = d3.select("#start-cloud");
var wordcloudMsg = d3.select("#wordcloud-msg");
var wordcloudFont = 'Georgia';

wordcloudButton.on("click", drawWordCloud);

var svg_cloud = d3.select("#wordcloud").append('svg')
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
var wordCloud = svg_cloud
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

function clearWordCloud() {
    wordCloud.selectAll("text").remove();
}

function drawWordCloud() {
    clearWordCloud();
    wordcloudFont = document.getElementById("wordcloud-font").value;
    var baseSize = document.getElementById("wordcloud-size").value;
    var include_at = document.getElementById("wordcloud-include").checked;

    var wordList = [];
    dataFiltered.forEach(d => {
        let words = d.input_string.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]?/g,"")
        .split(' ').filter(w => w.length > 4 && (include_at || w[0] != '@') ).map(w => {
            var size = +baseSize;
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
        .style("font-family", wordcloudFont)
        .transition().duration(transitDuration)
        .attr("transform", function(d) {
            return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
        })
        .text(function(d) { return d.text; });
}