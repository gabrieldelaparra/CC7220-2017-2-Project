# SPARQL Queries for humanas.

Este proyecto pretende ayudar a usuarios sin conocimientos de SPARQL, a hacer consultas sobre un Endpoint RDF.

La UI debe tener algunos elementos principales:
- Una barra text para cargar el endpoint (default: `https://sparql.n13.degu.cl/sparql`)
- El canvas de d3 donde se verán los nodos.

1. Install

`pip install -r requirements.txt`

2. Install d3networkxx

```bash
git clone https://github.com/jdfreder/ipython-d3networkx
cd ipython-d3networkx
pip install .
```

3. Correr Jupyter
 
`jupyter notebook`