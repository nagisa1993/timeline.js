import * as d3 from 'd3';
var group = null;
var mask = null;
var leftControl = null;
var rightControl = null;

class timeline {

	constructor(dom) {
    	this._dom = dom;
	}

	draw() {
		const svg = d3.select(dom).append("svg")
			        .attr("id", "svg")
			        .attr("width", 500)
			        .attr("height", 500);

		const clipPath = svg.append("defs")
						.append("clipPath")
						.attr("id", "display")
						.append("rect")
						.attr("x", 0)
						.attr("y", 0)
						.attr("width", 800)
						.attr("height", 100)
						.style("fill", "none");

		const band = svg.append("g");		
		band.append("path")
			.attr("d", "M 5 100 L 395 100")
			.attr("stroke", "#e6e6e6");
		band.append("path")
			.attr("d", "M 5 150 L 395 150")	
			.attr("stroke", "#e6e6e6");

        group = svg.append("g")
		        .attr("class", "navigator-controller")
		        .attr("transform", "translate(150,0)");

        mask = group.append("rect")
        		.attr("class", "navigator-mask")
        		.style("fill", "rgba(102,133,194,0.3)")
        		.attr("transform", "translate(0,100)")
        		.style("cursor", "pointer")
        		.attr("width", 100)
        		.attr("height", 50);
        		//.on("mousedown", );

        leftControl = group.append("rect")
        				.attr("class", "mask-controller")
        				.attr("stroke", "#cccccc")
        				.attr("stroke-width", 1)
        				.style("fill", "#e6e6e6")
        				.attr("width", 5)
        				.attr("height", 15)
        				.style("cursor", "pointer")
        				.attr("transform", "translate(-2.5,115)");
        				// .on("mousedown");

        rightControl = group.append("rect")
        				.attr("class", "mask-controller")
        				.attr("stroke", "#cccccc")
        				.attr("stroke-width", 1)
        				.style("fill", "#e6e6e6")
        				.attr("width", 5)
        				.attr("height", 15)
        				.style("cursor", "pointer")
        				.attr("transform", "translate(97.5,115)");
        				// .on("mousedown");
	}


}

module.exports = timeline