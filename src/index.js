import * as d3 from 'd3';
import styles from './main.css';
var vis = {},
	band = {},
	rate = {};
var click = false;
var group = null;
var mask = null;
var leftControl = null;
var rightControl = null;
var tooltipDiv = null;
var selectedElement, moveTarget, strokeWidth, bandStrokeWidth,
  	currentX = 0, currentAxis = 0, dx, currentPosition = 0,
  	dataLength = 0, dataVisible, dataInvisible, maskRate, scale, 
  	groupX = 150, maskX = 0, maskWidth = 930;

		var zoom = d3.zoom().scaleExtent([1, Infinity])
    		.translateExtent([[0, 0], [100, 100]])
    		.extent([[0, 0], [100, 100]])
			.on("zoom", zoomed);
const margin = {top: 10, right: 10, bottom: 10, left: 10},
	outerWidth = 950,
	outerHeight = 500,
	intervalRate = 0.5, // intervalRate = interval / path width;
	width = outerWidth - margin.left - margin.right,
	height = outerHeight - margin.bottom - margin.top;
  	//svg = document.querySelector("svg"),

class timeline {

	constructor(dom) {
    	this._dom = dom;
	}

	draw(data) {

		dataLength = data.scale;
		console.log(dataLength);

		band.h = 50; // band height
		vis.w = width;
		vis.h = height - band.h - 5; // chart height

		rate.w = width / dataLength;
		rate.h = band.h / vis.h;

		const svg = d3.select(dom).append("svg")
			        .attr("id", "svg")
			        .attr("width", outerWidth)
			        .attr("height", outerHeight)
					.append("g")
					.attr("class", "background")
					.attr("transform", `translate(${margin.left},${margin.top})`);

		const clipPath = svg.append("defs")
						.append("clipPath")
						.attr("id", "display")
						.append("rect")
						// .attr("x", 0)
						// .attr("y", 0)
						.attr("width", width)
						.attr("height", height)
						.style("fill", "none");
		
		let frame = svg.append("g")
					.attr("id", "frame")
					.attr("clip-path","url(#display)");

		// -------------------------------------------------------------------------------------
		// visualization frame
		
		const initScale = width / (maskWidth / width * dataLength);
		const initTrans = (-1) * (width / 2 - maskWidth / 2 ) * dataLength / width; 

		vis.g = frame.append("g")
					.attr("class", "visband");

		vis.g.append("rect")
			.attr("class", "visbackground")
			.attr("width", vis.w)
			.attr("height", vis.h)
			.call(zoom);

		vis.g.append("g")
			.attr("class", "data-series")
			// .attr("transform", "scale(3.71428,1) translate(-161.53846,0)");
			.attr("transform", `scale(${initScale},1) translate(${initTrans},0)`);


		strokeWidth = Math.min((vis.h - 4) / data.alignment.length, 20);

		// -------------------------------------------------------------------------------------
		// data
		let totalHeight = 0;
		let visItems = d3.select(".data-series").selectAll("g")
			.data(data.alignment)
			.enter()
				.append("g")
				//.each(test);
				.each(function(alignment, i) {
					// 这里不能用arrow function写，否则this就会读错为整体的dom
					// can't use arrow function here
					d3.select(this)
					  .selectAll("path")
					  .data(alignment.value)
					  .enter()
					  	.append("path")
					  	.attr("stroke", `rgb(${i}02,133,194)`) // 颜色可以从colormap里取 // you can set attr for stroke from colormap
					  	.attr("stroke-width", strokeWidth)
					  	.attr("d", (activity, j) => {
					  		// return `M ${activity.StartTime} ${strokeWidth * (1 + intervalRate) * (2 * i + 1 + activity.Subrow)} L ${activity.EndTime} ${strokeWidth * (1 + intervalRate) * (2 * i + 1 + activity.Subrow)}`;
							return `M ${activity.StartTime} ${strokeWidth * (totalHeight +  intervalRate * (i + 1) + activity.Subrow)} L ${activity.EndTime} ${strokeWidth * (totalHeight +  intervalRate * (i + 1) + activity.Subrow)}`;
					  	})
						.on("mouseover", function(d) { // tooltip
							tooltipDiv.transition()
							   		  .duration(200)
							   		  .style("opacity", .9);
							tooltipDiv.html( `Case ID: ${alignment.ID[0].seq}<br>duration: ${d.Duration}`)
									  .style("left", (d3.event.pageX) + "px")		
                					  .style("top", (d3.event.pageY - 28) + "px");;
						})
						.on("mouseout", function(d) {
							tooltipDiv.transition()
									  .duration(500)
									  .style("opacity", 0);
						})
						totalHeight += alignment.Height;
				});

				

		// -------------------------------------------------------------------------------------
		// axis

		const axis1 = frame.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${vis.h})`);	

		axis1.append("path")
			// .attr("d", "M 5 100 L 395 100")
			.attr("d", `M0,0V0H${width}V0`)
			.attr("stroke", "#e6e6e6");

		const axis2 = frame.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${vis.h + 50})`);
		axis2.append("path")
			// .attr("d", "M 5 150 L 395 150")	
			.attr("d", `M0,0V0H${width}V0`)
			.attr("stroke", "#e6e6e6");

		// -------------------------------------------------------------------------------------
		// band
		
		bandStrokeWidth = band.h * strokeWidth / vis.h; 

		band.g = frame.append("g")
			.attr("class", "band")
			.attr("transform", `translate(0,${vis.h})`);

		band.g.append("rect")
			.attr("class", "bandbackground")
			.attr("width", vis.w)
			.attr("height", band.h);

		let totalHeight2 = 0;
		let items = band.g.selectAll("g")
			.data(data.alignment)
			.enter()
			.append("g")
			.each(function (alignment, i) {
				d3.select(this)
				.selectAll("path")
				.data(alignment.value)
				.enter()
				.append("path")
				.attr("stroke", "rgb(102,133,194)")
				.attr("stroke-width", bandStrokeWidth)
				.attr("d", (activity, j) => {
					console.log(bandStrokeWidth);
					return `M ${activity.StartTime * rate.w} ${strokeWidth * (totalHeight2 +  intervalRate * (i + 1) + activity.Subrow) * rate.h} L ${activity.EndTime * rate.w} ${strokeWidth * (totalHeight2 +  intervalRate * (i + 1) + activity.Subrow) * rate.h}`
				})
				totalHeight2 += alignment.Height;
			})
		
		group = band.g.append("g")
		        .attr("class", "navigator-controller")
		        .attr("transform", `translate(${width / 2 - maskWidth / 2},0)`);

        mask = group.append("rect")
        		.attr("class", "navigator-mask")
        		// .style("fill", "rgba(102,133,194,0.3)")
        		// .attr("transform", "translate(0,100)")
        		// .style("cursor", "pointer")
        		.attr("width", maskWidth)
        		.attr("height", band.h)
				.attr("transform", "translate(0,0)")
        		.on("mousedown", selectElement);
        
        leftControl = group.append("rect")
        				.attr("class", "mask-controller")
        				.attr("stroke", "#cccccc")
        				.attr("stroke-width", 1)
        				// .style("fill", "#e6e6e6")
        				.attr("width", 5)
        				.attr("height", 25)
        				// .style("cursor", "pointer")
        				.attr("transform", "translate(-2.5,12.5)")
        				.on("mousedown", selectElement);

        rightControl = group.append("rect")
        				.attr("class", "mask-controller")
        				.attr("stroke", "#cccccc")
        				.attr("stroke-width", 1)
        				// .style("fill", "#e6eß6e6")
        				.attr("width", 5)
        				.attr("height", 25)
        				// .style("cursor", "pointer")
        				.attr("transform",`translate(${maskWidth - 2.5},12.5)`)
        				.on("mousedown", selectElement);

		// -------------------------------------------------------------------------------------
		// tooltip

		tooltipDiv = d3.select(dom)
					.append("div")
					.attr("class", "tooltip")
					.style("opacity", 0);
	}
}

function zoomed(){
	console.log(d3.event.transform);
	// Get the scale and translate before zoom
	let ctrl1 = leftControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0],
		ctrl2 = rightControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0],
		groupX = group._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0],
	    currentScale = d3.event.transform.k,
		maskX = Math.min(parseFloat(ctrl1), parseFloat(ctrl2)) + 2.5,
		maskWidth0 = maskWidth;
	// Change after zoom
	maskWidth = parseFloat(width / currentScale);
	let maskWidthChanged = maskWidth0 - maskWidth;
	maskX = parseFloat(groupX) + maskX < 0 ? (-1) * parseFloat(groupX) : parseFloat(groupX) + maskX + maskWidth > width ? maskX + maskWidthChanged : maskX + maskWidthChanged / 2;
	ctrl1 = maskX - 2.5;
	ctrl2 = maskX + maskWidth - 2.5;
	leftControl._groups[0][0].setAttribute("transform", `translate(${ctrl1}, 12.5)`);
	rightControl._groups[0][0].setAttribute("transform", `translate(${ctrl2}, 12.5)`);
	mask._groups[0][0].setAttribute("transform", `translate(${maskX},0)`);
	mask._groups[0][0].setAttribute("width", `${maskWidth}`);
	// Change display area
	maskRate = maskWidth / width;
	dataVisible = maskRate * dataLength;
	dataInvisible = (-1) * (maskX + parseFloat(groupX)) * dataLength / width; // maskX + groupX是mask的绝对x距离 // maskX + groupX = mask's absolute X distance
	scale = width / (maskRate * dataLength);
	vis.g._groups[0][0].childNodes[1].setAttribute("transform", `scale(${scale},${1}) translate(${dataInvisible},${0})`);
}

function selectElement() {
	//console.log(this); // dom
	click = true;
	console.log(d3.event);
	selectedElement = d3.select(this); // object
	currentX = d3.event.clientX; // event.x

	if (this.getAttribute("class") === 'mask-controller'){  // single move
		console.log("single");
    	moveTarget = this;
    	dx = parseFloat(moveTarget.getAttribute("transform").slice(10,-1).split(',')[0]);  // 上一次的相对位移 // last relative moving distance
    	// make controller to the top
    	//svg.appendChild(evt.target);
    }
 	else { 						// group move
    	moveTarget = this.parentNode;
 	}
	
 	d3.select("#svg").on("mousemove", moveElement);
	// d3.select("#svg").on("mouseout", deselectElement);
	d3.select("#svg").on("mouseup", deselectElement);
}

function moveElement() {
	currentAxis = moveTarget.getAttribute("transform").slice(10, -1).split(','); // ["392", "0"]
	if(moveTarget.nodeName === "rect") { 
		dx += d3.event.clientX - currentX;   // 移动滑动块，累计每次的位移，取相对位移，限定boundary // accumulation moving distance for left/right controllers = relative distance
		// currentAxis[0] = (dx + groupX < 2.5 ? -2.5 : (dx + groupX > 927.5 ? 927.5 - groupX : dx)); // limit boundary
		currentAxis[0] = dx;
		// console.log(dx);
		// syncronize zoom scale
		d3.select(".visbackground")
			.call(zoom.transform, d3.zoomIdentity
			.scale(width / maskWidth));
	}
	else {
		if (selectedElement._groups[0][0].getAttribute("transform")!=null) {
			var maskTrans = parseFloat(selectedElement._groups[0][0].getAttribute("transform").slice(10, -1).split(',')[0]);
			currentAxis[0] = (d3.event.clientX - currentX + parseFloat(currentAxis[0]) + parseFloat(maskTrans) < 0 ? 0 - parseFloat(maskTrans) : (d3.event.clientX - currentX + parseFloat(currentAxis[0])) > (width - maskWidth - maskTrans) ? (width - maskWidth - maskTrans) : d3.event.clientX - currentX + parseFloat(currentAxis[0]));  
	}
		// currentAxis[0] = d3.event.clientX - currentX + parseFloat(currentAxis[0]);// 移动mask，取绝对位移，限定boundary // moving distance for mask = absolute distance;
	}
	
	moveTarget.setAttribute("transform", `translate(${currentAxis.join(',')})`);
	currentX = d3.event.clientX;

	// change mask according to controller movements
	let ctrl1 = leftControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0],
		ctrl2 = rightControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0];
		groupX = group._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0];
	maskX = Math.min(parseFloat(ctrl1), parseFloat(ctrl2)) + 2.5; // 2.5是滑块的半长 // 2.5 = left/right controller's half width
	maskWidth = Math.abs(parseFloat(ctrl1) - parseFloat(ctrl2));
	mask._groups[0][0].setAttribute("transform", `translate(${maskX},${0})`);
	mask._groups[0][0].setAttribute("width", maskWidth);

	// change display area
	maskRate = maskWidth / width;
	dataVisible = maskRate * dataLength;
	dataInvisible = (-1) * (maskX + parseFloat(groupX)) * dataLength / width; // maskX + groupX是mask的绝对x距离 // maskX + groupX = mask's absolute X distance
	scale = width / (maskRate * dataLength);
	vis.g._groups[0][0].childNodes[1].setAttribute("transform", `scale(${scale},${1}) translate(${dataInvisible},${0})`);
}

function deselectElement() {
	if(d3.event.type == 'mouseout' && click) return;
	click = false;
	d3.select("#svg").on("mousemove", null);
	d3.select("#svg").on("mouseout", null);
	d3.select("#svg").on("mouseup", null);
}

module.exports = timeline
