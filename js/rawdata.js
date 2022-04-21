const pageSize = 100;
var pageCurrent = 1;
var pageCount;
var viewing = false;

function createStatistics() {
    statistics = {
        lewd: 0,
        intent: 0,
        offensive: 0
    }
    dataFiltered.forEach(d => {
        let decode = decodeFlag(d.flag);
        statistics.intent += decode.intent | 0;
        statistics.offensive += decode.offensive | 0;
        statistics.lewd += decode.lewd | 0;
    });
}

function clearView() {
    viewing = false;
    dataView = dataFiltered;
    drawTable();
}

function drawTable() {
    pageCount = Math.ceil(dataView.length / pageSize);
    pageCurrent = 1;
    makeTableHTML();
}

function gotoPage(page) {
    if (page < 1 || page > pageCount) {return;}
    pageCurrent = page;
    makeTableHTML();
}

function createNav() {
    let navStart = Math.max(1, pageCurrent - 2);
        navEnd = Math.min(pageCount, navStart + 5);
    result = "<nav id=\"nav\" aria-label=\"Naviagtion\"><ul class=\"pagination justify-content-center\">";
    result += "<ul class=\"pagination justify-content-center\">";
    if (viewing) {
        result += "<li class=\"page-item\"><a class=\"page-link\" href=\"#raw-title\" onclick=\"clearView()\">View All</a></li>"
    }
    result += "<li class=\"page-item" + ((pageCurrent == 1) ? " disabled" : "") + "\"><a class=\"page-link\" href=\"#raw-title\" onclick=\"gotoPage(" + (pageCurrent - 1) + ")\">Prev</a></li>";
    if (navStart > 1) {
        result += "<li class=\"page-item\"><a class=\"page-link\" href=\"#raw-title\" onclick=\"gotoPage(1)\">1</a></li>"
        result +="<li class=\"page-item disabled\"><a class=\"page-link\">...</a></li>"
    }
    for (var i=navStart; i<=navEnd;i++) {
        result += "<li class=\"page-item" + ((pageCurrent == i) ? " active" : "") + "\"><a class=\"page-link\" href=\"#raw-title\" onclick=\"gotoPage(" + i + ")\">" + i + "</a></li>";
    }
    if (navEnd < pageCount) {
        result += "<li class=\"page-item disabled\"><a class=\"page-link\">...</a></li>"
        result += "<li class=\"page-item\"><a class=\"page-link\" href=\"#raw-title\" onclick=\"gotoPage(" + pageCount + ")\">" + pageCount + "</a></li>"
    }
    result +=  "<li class=\"page-item" + ((pageCurrent == pageCount) ? " disabled" : "") + "\"><a class=\"page-link\" href=\"#raw-title\" onclick=\"gotoPage(" + (pageCurrent + 1) + ")\">Next</a></li>";
    
    result += "</ul></nav>"
    return result;
}

function viewTag(tag) {
    viewing = true;
    dataView = dataView.filter(d => d[tag] !== undefined);
    drawTable();
}

function makeTableHTML() {
    let tableStart = (pageCurrent-1) * pageSize
        tableEnd = Math.min(dataView.length, (pageCurrent) * pageSize);
    var result = createNav();
    result += '<table class="table table-sm">';
    result +=
      '<thead><tr>\
    <th scope="col">#</th>\
    <th scope="col">Input Sentence</th>\
    <th scope="col">Tags</th>\
    </tr></thead>';
    for (var i=tableStart; i<tableEnd;i++){
        var d = dataView[i];
        result += "<tr>";
        result += "<td>" + d.i + "</td>";
        result += "<td>" + d.input_string + "</td>";
        result += "<td>";
        Object.keys(d).slice(3).forEach(d => {
            result += "<a href=\"#raw-title\" onclick =\"viewTag(\'" + d + "\')\" class=\"badge badge-secondary\" style=\"background-color:" + colorTags[d] + "\">" + d + "</a> "
        })
        result += "</td>";
        result += "</tr>";
    }
    result += "</table>";

    d3.select('#raw').html(result);
  }