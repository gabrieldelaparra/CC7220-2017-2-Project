$(function () {
    var w = 1200
    var h = 800

    // ########## SVG ##########
    var svg = d3.select("#canvas")
        .attr("width", w)
        .attr("height", h);

    var borderPath = svg.append("rect")
        .attr("id", "canvas-border")
        .attr("x", 0)
        .attr("y", 0)
        .attr("height", h)
        .attr("width", w)

    // ########## Data: Nodes and Links ##########

    d3.json("data/data.json", function (error, data) {
        if (error) throw error;

        graph = data;

        // ########## Links and nodes ##########

        var link = svg.selectAll(".link")
            .data(graph.links).enter()
            .append("line")
            .attr("class", "link");

        var node = svg.selectAll(".node")
            .data(graph.nodes).enter()
            .append("circle")
            .attr("class", "node")
            .attr("fill", function (d) { return d.color; })
            .attr("stroke-width", 0)
            .attr("r", 10)

        var label = svg.selectAll(".label")
            .data(graph.nodes).enter()
            .append("text")
            .attr("class", "label")
            .text(function (d) { return d.id; });

        // ########## Names ##########

        node.append("title")
            .text(function (d) { return d.id; });

        // ########## Force ##########

        var simulation = d3.forceSimulation()
            .force("link", d3.forceLink().id(function (d) { return d.id; }).distance(100))
            .force("charge", d3.forceManyBody())
            .force("center", d3.forceCenter(w / 2, h / 2));

        simulation.nodes(graph.nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(graph.links);

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

        node.on("click", toggleSelected);

        function toggleSelected(d) {
            d.isSelected = !d.isSelected;
            d3.select(this).attr("stroke-width", d.isSelected ? 5 : 0);
        };

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
            if (!d.isSelected) {
                d.fx = null;
                d.fy = null;
            };
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

    });
});

String.prototype.replaceAll = function (search, replace) {
    if (replace === undefined) { return this.toString(); }
    return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};

function getTypes(url, callback) {
    var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?t WHERE { ?s rdf:type ?t } LIMIT 50";
    query = query.replaceAll(" ", "+").replaceAll("#", "%23");
    var queryUrl = url + "?query=" + query + "&format=json";

    $.ajax({
        dataType: "jsonp",
        url: queryUrl,
        success: function (_data) {
            callback(_data.results.bindings);
        },
    });
};

function getProperties(url, selected_type, callback) {
    if (url && selected_type) {
        var query = "PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> SELECT DISTINCT ?p WHERE { ?s rdf:type <" + selected_type + "> . ?s ?p ?o . } LIMIT 50";
        query = query.replaceAll(" ", "+").replaceAll("#", "%23");
        var queryUrl = url + "?query=" + query + "&format=json";

        $.ajax({
            dataType: "jsonp",
            url: queryUrl,
            success: function (_data) {
                callback(_data.results.bindings);
            },
        });
    }
};

function createEntityDatalist(json) {

    d3.select("#side-panel")
        .append("g")
        .text("Entity:")

    d3.select("#side-panel")
        .append("input")
        .attr("id", "selectedEntityInput")
        .attr("type", "text")
        .attr("list", "dlist1")

    datalist = d3.select("#side-panel")
        .append("datalist")
        .attr("id", "dlist1")

    for (var i in json) {
        var res = json[i];
        keys = Object.keys(res);
        for (var j in keys) {
            datalist.append("option").attr("value", res[keys[j]].value);
        }
    }

    d3.select("#side-panel")
        .append("input")
        .attr("type", "button")
        .attr("value", "Add")
        .attr("onClick", "getProperties(endpointURL.value, selectedEntityInput.value, createPropertyDatalist)");

    d3.select("#side-panel")
        .append("input")
        .attr("type", "button")
        .attr("value", "Run Query")
        .attr("onClick", "");

    d3.select("#side-panel")
        .append("br");
}

function createPropertyDatalist(json) {
    d3.select("#side-panel")
        .append("g")
        .text("Property:")

    d3.select("#side-panel")
        .append("input")
        .attr("id", "selectedEntityInput")
        .attr("type", "text")
        .attr("list", "dlist2")

    datalist = d3.select("#side-panel")
        .append("datalist")
        .attr("id", "dlist2")

    for (var i in json) {
        var res = json[i];
        keys = Object.keys(res);
        for (var j in keys) {
            datalist.append("option").attr("value", res[keys[j]].value);
        }
    }

    d3.select("#side-panel")
        .append("input")
        .attr("type", "button")
        .attr("value", "Add")
        .attr("onClick", "createPropertyDatalist(selectedEntityInput)");

    d3.select("#side-panel")
        .append("br");
}

function loadEndpointURL(url) {
    if (url.value) {
        getTypes(url.value, createEntityDatalist);
    }
};

