/**
 * Copyright 2016, Yahoo! Inc.
 * Copyrights licensed under the New BSD License. See the accompanying LICENSE file for terms.
 *
 * This component is inspired by the [Collapsible Indented Tree](http://bl.ocks.org/mbostock/1093025) example
 * from [d3 repo's gallery](https://github.com/mbostock/d3/wiki/Gallery).
 */
import React from 'react';
const D3_CDN_URL = 'https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js';

class ActionTree extends React.Component {
    constructor(props) {
        super(props);
    }

    injectStyle() {
        const css = `
            .node rect {
              cursor: pointer;
              fill: #fff;
              fill-opacity: .5;
              stroke: #3182bd;
              stroke-width: 1.5px;
            }
            .node>text {
              font: 10px sans-serif;
              pointer-events: none;
            }
            path.link {
              fill: none;
              stroke: #9ecae1;
              stroke-width: 1.5px;
            }
        `;
        var head = document.getElementsByTagName('head')[0];
        var style = document.createElement('style');
        style.type = 'text/css';
        if (style.styleSheet){
          style.styleSheet.cssText = css;
        } else {
          style.appendChild(document.createTextNode(css));
        }

        head.appendChild(style);
    }

    loadScript (url, callback) {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        document.getElementsByTagName('body')[0].appendChild(script);
        if (callback) {
            if (script.readyState) { // IE
                script.onreadystatechange = () => {
                    if (script.readyState === 'loaded' || script.readyState === 'complete') {
                        script.onreadystatechange = null;
                        callback();
                    }
                };
            } else { // Others
                script.onload = () => {
                    callback();
                };
            }
        }
        script.src = url;
    }

    graph () {
        if (!this.props.action) {
            return;
        }
        var relativeWidth = this.props.relativeWidth;
        const root = this.props.action;
        var margin = {top: 30, right: 20, bottom: 30, left: 20};
        var width = 960 - margin.left - margin.right;
        var barHeight = 20;
        var barWidth = width * .8;

        var i = 0;
        var duration = 300;

        var tree = d3.layout.tree()
            .nodeSize([0, 20]);

        var diagonal = d3.svg.diagonal()
            .projection(d => [d.x, d.y]);

        var wrapper = this.refs.svgWrapper;
        var svg = d3.select(wrapper).append("svg")
            .attr("width", width + margin.left + margin.right)
            .append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        function update(source) {
            // Compute the flattened node list. TODO use d3.layout.hierarchy.
            var nodes = tree.nodes(source);

            var height = nodes.length * barHeight + margin.top + margin.bottom;

            d3.select(wrapper).select("svg").attr("height", height);

            // Compute the "layout".
            nodes.forEach((n, i) => {
                const startPercent = n.parent ? ((n.startTime - source.startTime) / source.duration) : 0;
                const x = startPercent * barWidth;
                n.x = relativeWidth ? Math.round(x) : n.depth*barHeight;
                const durPercent = n.parent ? (n.duration / source.duration) : 1;
                const width = Math.round(durPercent * barWidth) || 1; // minimum 1 pixel width
                n.width = relativeWidth ? width : barWidth;
                n.y = i * barHeight;
            });

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, d => {d.id = ++i});
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", d => {
                    const y = d.parent ? d.parent.y : source.y;
                    const x = d.parent ? d.parent.x : source.x;
                    return `translate(${x},${y})`;
                })
                .style("opacity", 1e-6);

            // Enter any new nodes at the parent's previous position.
            nodeEnter.append("rect")
                .attr("y", -barHeight / 2)
                .attr("height", barHeight)
                .attr("width", d => d.width)
                .attr("x", d => d.x)
                .style("fill", color)
                .on("click", click);

            nodeEnter.append("text")
                .attr("class", "displayLabel")
                .attr("dy", 3.5)
                .attr("dx", 5.5)
                .attr("x", d => d.x)
                .text(d => {
                    let name = d.name;
                    if (d.type) {
                        name = d.type + ':' + d.name;
                    }
                    if (typeof d.duration !== 'undefined') {
                        name += ` (${d.duration.toFixed(2)} ms)`;
                    }
                    return name;
                });

            // Transition nodes to their new position.
            nodeEnter.transition()
                .duration(duration)
                .attr("transform", d => `translate(0,${d.y})`)
                .style("opacity", 1);

            node.transition()
                .duration(duration)
                .attr("transform", d => `translate(0,${d.y})`)
                .style("opacity", 1)
                .select("rect")
                .style("fill", color);

            // Transition exiting nodes to the parent's new position.
            node.exit().transition()
                .duration(duration)
                .attr("transform", d => `translate(0,${d.parent.y})`)
                .style("opacity", 1e-6)
                .remove();

            // Update the links…
            var link = svg.selectAll("path.link")
                .data(tree.links(nodes));

            // Enter any new links at the parent's previous position.
            link.enter().insert("path", "g")
                .attr("class", "link")
                .attr("d", d => diagonal({source: d.source, target: d.source}))
                .transition()
                .duration(duration)
                .attr("d", d => diagonal({source: d.source, target: d.target}));

            // Transition links to their new position.
            link.transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting nodes to the parent's new position.
            link.exit().transition()
                .duration(duration)
                .attr("d", d => diagonal({source: d.source, target: d.source}))
                .remove();
        }

        // Toggle children on click.
        function click(d) {
            if (d.children) {
                d._children = d.children;
                d.children = null;
            } else {
                d.children = d._children;
                d._children = null;
            }
            update(root);
        }

        function color(d) {
            return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
        }

        update(root);

    }

    componentDidMount() {
        this.injectStyle();
        if (!window.d3) {
            this.loadScript(D3_CDN_URL, this.graph.bind(this));
        } else {
            this.graph();
        }
    }

    componentDidUpdate() {
        // wipe away old svg
        this.refs.svgWrapper.innerHTML = '';
        this.graph();
    }

    render() {
        return (
            <div ref="svgWrapper"></div>
        );
    }
}

export default ActionTree;
