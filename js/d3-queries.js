// ########## Data: Nodes and Links ##########

nodes = [

];

links = [

];

graph = { nodes, links };


w = 1400;
h = 800;

function drawForceCanvas() {

    // ########## SVG ##########
    svg = d3.select("#canvas")
        .attr("width", w)
        .attr("height", h);

    // ########## SVG Border##########
    border = svg.append("rect")
        .attr("id", "canvas-border")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", h)
        .attr("width", w);

    // ########## d3 Force Layout ##########
    simulation = d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(100))
        .force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(w / 2, h / 2));

    linkGroup = svg.append("g").attr("class", "link");

    nodeGroup = svg.append("g").attr("class", "node");
}

function redraw() {
    // Redefine and restart simulation
    simulation.nodes(graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(graph.links);

    // ########## Links and nodes ##########

    // Update links
    link = linkGroup
        .selectAll("line")
        .data(graph.links);

    // Enter links
    linkEnter = link
        .enter().append("line");

    link = linkEnter
        .merge(link);

    // Exit any old links
    link.exit().remove();

    // Update the nodes
    node = nodeGroup
        .selectAll("circle")
        .data(graph.nodes);

    label = nodeGroup
        .selectAll("text")
        .data(graph.nodes);

    // Enter any new nodes
    nodeEnter = node
        .enter()
        .append("circle")
        .attr("fill", function (d) { return d.nodeType == "E" ? 	"orchid" : 	"lightSkyBlue"; })
        .attr("stroke-width", 0)
        .attr("r", 10);

    labelEnter = label
        .enter()
        .append("text")
        .text(function (d) { return d.id; });

    node = nodeEnter.merge(node);
    label = labelEnter.merge(label);

    // Exit any old nodes
    node.exit().remove();
    label.exit().remove();

    // ########## Names ##########

    node.append("title")
        .text(function (d) { return d.id; });

    // ########## Force ##########

    function ticked() {
        link
            .attr("x1", function (d) { return d.source.x; })
            .attr("y1", function (d) { return d.source.y; })
            .attr("x2", function (d) { return d.target.x; })
            .attr("y2", function (d) { return d.target.y; });

        node
            .attr("cx", function (d) { return d.x; })
            .attr("cy", function (d) { return d.y; });

        label
            .attr("x", function (d) { return d.x; })
            .attr("y", function (d) { return d.y - 20; });
    }

    // ########## Toggle ##########

    // node.on("click", toggleSelected);

    // function toggleSelected(d) {
    //     d.isSelected = !d.isSelected;
    //     d3.select(this).attr("stroke-width", d.isSelected ? 5 : 0);
    // };

    // ########## Drag and Drop ##########

    node.call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    };

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    };

    function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
    };

    // ########## Zoom & Pan ##########

    var zoom = d3.zoom()
        .scaleExtent([0.5, 3])
        .on("zoom", zoomed);


    svg.call(zoom);

    function zoomed() {
        node.attr("transform", d3.event.transform);
        link.attr("transform", d3.event.transform);
        label.attr("transform", d3.event.transform);
    }

    simulation.alpha(0.1).restart();
}

$(function () {
    drawForceCanvas();
    redraw();
});

// ########## String ReplaceAll ##########
String.prototype.replaceAll = function (search, replace) {
    if (replace === undefined) { return this.toString(); }
    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

entityList = [];
propertyList = [];

// "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> PREFIX rdfs:<http://www.w3.org/2000/01/rdf-schema#> PREFIX wd: <http://www.wikidata.org/entity/> PREFIX wdt: <http://www.wikidata.org/prop/direct/> SELECT DISTINCT ?t WHERE { ?s (rdf:type|wdt:P279|wdt:P31) ?t . OPTIONAL {?t rdfs:label ?l . FILTER(langMatches(LANG(?l) = 'en'))} } LIMIT 500";
// "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?t WHERE { ?s rdf:type ?t .} LIMIT 50";
// ########## Get Types ##########
function getTypes(url, callback) {
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?t WHERE { ?s rdf:type ?t .} LIMIT 50";
    query = query.replaceAll(" ", "+").replaceAll("#", "%23");
    var queryUrl = url + "?query=" + query + "&format=json";

    $.ajax({
        dataType: "jsonp",
        url: queryUrl,
        success: function (_data) {
            entityList = _data.results.bindings;
            callback();
        },
    });
};


// ########## Get Properties for Types ##########
function getProperties(url, selected_type, callback) {

    addNewEntity(selected_type);

    if (url && selected_type) {
        var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?p WHERE { ?s rdf:type <" + selected_type + "> . ?s ?p ?o . } LIMIT 50";
        query = query.replaceAll(" ", "+").replaceAll("#", "%23");
        var queryUrl = url + "?query=" + query + "&format=json";

        $.ajax({
            dataType: "jsonp",
            url: queryUrl,
            success: function (_data) {
                propertyList = _data.results.bindings;
                callback();
            },
        });
    }
};

function runQuery(url) {
    obj = 0;
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT * WHERE { ";
    console.log(query);
    for (var i = 0; i < graph.nodes.length; i++) {
        var n = graph.nodes[i];

        if (n.nodeType == "E") {
            query = query + "?s rdf:type <" + n.id + "> ."

        }
        if (n.nodeType == "P") {
            obj = obj + 1;
            query = query + "?s <" + n.id + "> ?o" + obj + " ."
        }
    }
    query = query + " }"

    query = query.replaceAll(" ", "+").replaceAll("#", "%23");
    var queryUrl = url + "?query=" + query + "&format=text/html";

    window.location = queryUrl;
}

entityCount = 0;
propertyCount = 0;

// ########## Create DataList for Entities ##########
function createEntityDatalist() {

    d3.select("#side-panel")
        .append("g")
        .text("Entity:")

    d3.select("#side-panel")
        .append("input")
        .attr("id", "entityInput" + entityCount)
        .attr("type", "text")
        .attr("list", "elist" + entityCount)

    datalist = d3.select("#side-panel")
        .append("datalist")
        .attr("id", "elist" + entityCount)

    for (var i in entityList) {
        var res = entityList[i];
        keys = Object.keys(res);
        for (var j in keys) {
            option = datalist.append("option").attr("value", res["t"].value)
            if (res.hasOwnProperty("l")) {
                option.attr("label", res["l"].value);
            }
        }
    }

    d3.select("#side-panel")
        .append("input")
        .attr("type", "button")
        .attr("value", "Add")
        .attr("onClick", "getProperties(endpointURL.value, entityInput" + entityCount + ".value, createPropertyDatalist)");

    d3.select("#side-panel")
        .append("input")
        .attr("type", "button")
        .attr("value", "Run Query")
        .attr("onClick", "runQuery(endpointURL.value)");

    d3.select("#side-panel")
        .append("br");

    entityCount = entityCount + 1;
}
// ########## Create DataList for Properties ##########
function createPropertyDatalist() {

    d3.select("#side-panel")
        .append("g")
        .text("Property:")

    d3.select("#side-panel")
        .append("input")
        .attr("id", "propertyInput" + propertyCount)
        .attr("type", "text")
        .attr("list", "plist" + propertyCount)

    datalist = d3.select("#side-panel")
        .append("datalist")
        .attr("id", "plist" + propertyCount)

    for (var i in propertyList) {
        var res = propertyList[i];
        keys = Object.keys(res);
        for (var j in keys) {
            datalist.append("option").attr("value", res[keys[j]].value);
        }
    }

    d3.select("#side-panel")
        .append("input")
        .attr("type", "button")
        .attr("value", "Add")
        .attr("onClick", "addPropertyCallback(propertyInput" + propertyCount + ".value)");
    // .attr("onClick", "createPropertyDatalist(selectedEntityInput)");

    d3.select("#side-panel")
        .append("br");

    propertyCount = propertyCount + 1;

  function addPropertyCallback(propertyValue) {
    addNewProperty(propertyValue);
    createPropertyDatalist()
  }

// ########## Load Endpoint ##########
function loadEndpointURL(url) {
    if (url.value) {
        getTypes(url.value, createEntityDatalist);
    }
};

function addNewEntity(entityName) {
    console.log("addNewEntity: " + entityName)
    var n = { id: entityName, nodeType: "E" }
    graph.nodes.push(n);

    redraw();
}

function addNewProperty(propertyName) {
    console.log("addNewProperty: " + propertyName);
    var n = { id: propertyName, nodeType: "P" }
    graph.nodes.push(n);
    nodesLength = graph.nodes.length - 1;
    var l = { source: graph.nodes[0], target: graph.nodes[nodesLength] }
    graph.links.push(l);

    redraw();

}
