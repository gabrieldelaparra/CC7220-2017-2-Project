{
    var nodes = [
        { id: "URI 1", label: "Nodo 1", nodeType: "E" },
        { id: "URI 2", label: "Nodo 2", nodeType: "P" },
        { id: "URI 3", label: "Nodo 3", nodeType: "P" },
    ];
    var links = [
                { source: nodes[0], target: nodes[1] },
                { source: nodes[0], target: nodes[2] },

    ];
}

var query ="";
console.log(query);for (var i=0 ; i<nodes.length ; i++) {
            var node=nodes[i];
            if (node.nodenodeType=="E"){
                query+="?s rdf:nodeType <"+node.id+">."
                    
            }
            if (node.nodenodeType=="P"){
                query+="?s" +node.id+"?o1 ."
            }
}
