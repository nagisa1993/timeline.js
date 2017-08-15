import * as d3 from 'd3';
import * as d3ScaleChromatic from 'd3-scale-chromatic';
import styles from './main.css';
var vis = {},
	band = {},
	rowHead = {},
	rowData = {},
	scrollBand = {},
	rate = {};
var click = false;
var group = null;
var mask = null;
var leftControl = null;
var rightControl = null;
var scrollBar = null;
var tooltipDiv = null;
var selectedElement, moveTarget, strokeWidth, bandStrokeWidth,
  	currentX = 0,currentY = 0, currentAxis = 0, dx, dy, currentPosition = 0,
  	dataLength = 0, dataHeight = 0, dataVisible, dataInvisible, dataInvisibleY, maskRate, scale,
  	groupX = 150, maskX = 0, barY = 0, maskWidth = 930, barWidth = 0, barHeight = 0;

		var zoom = d3.zoom().scaleExtent([1, Infinity])
    		.translateExtent([[0, 0], [100, 100]])
    		.extent([[0, 0], [100, 100]])
			.on("zoom", zoomed);
const margin = {top: 15, right: 15, bottom: 15, left: 15},
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
		let colors = colorMap(data);
		dataLength = data.scale;
		console.log(dataLength);

		band.h = 50; // band height
		band.w = width;
		rate.w = width / dataLength;
		rowHead.w = 70;
		vis.w = width - rowHead.w;
		vis.h = height - band.h; // chart height
		scrollBand.h = vis.h;
		scrollBand.w = 10;

		
		// rate.h = band.h / vis.h;

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

		// rowHead.g = frame.append("g")
		// 	.attr("class", "row-head")

		// rowHead.g.append("rect")
		// 	.attr("class", "row-head-background")
		// 	.attr("width", rowHead.w)
		// 	.attr("height", vis.h);

		vis.g = frame.append("g")
					.attr("class", "visband")
					.attr("transform", `translate(${rowHead.w - 10}, 0)`);

		vis.g.append("rect")
			.attr("class", "visbackground")
			.attr("width", vis.w + 10)
			.attr("height", vis.h)
			.call(zoom);

		vis.g.append("g")
			.attr("class", "data-series")
			// .attr("transform", "scale(3.71428,1) translate(-161.53846,0)");
			.attr("transform", `scale(${initScale},1) translate(${initTrans},0)`);


		// strokeWidth = Math.min((vis.h - 4) / data.alignment.length, 20);
		strokeWidth = 16;

		// -------------------------------------------------------------------------------------
		// data
		let totalHeight = 0;
		let visItems = d3.select(".data-series").selectAll("g")
			.data(data.alignment)
			.enter()
				.append("g")
				.attr("class", "hover_group")
				//.each(test);
				.each(function(alignment, i) {
					// 这里不能用arrow function写，否则this就会读错为整体的dom
					// can't use arrow function here
					d3.select(this)
						.append("path")
						.attr("class", "grids")
						.attr("d", `M 0 ${3 + strokeWidth * (totalHeight +  intervalRate * (i + 1) + alignment.Height) - strokeWidth * intervalRate / 2} L ${dataLength} ${3 + strokeWidth * (totalHeight +  intervalRate * (i + 1) + alignment.Height) - strokeWidth * intervalRate / 2}`)
					d3.select(this)
					  .selectAll("path")
					  .data(alignment.value)
					  .enter()
					  	.append("path")
					  	// .attr("stroke", "rgb(102,133,194)") // 颜色可以从colormap里取  ${d3ScaleChromatic.interpolateSpectral(i%11/10)} // you can set attr for stroke from colormap
					  	.attr("stroke-width", strokeWidth)
					  	.attr("d", (activity, j) => {
							for (let i = 0; i < colors.length; i++) 
								if (activity.activity == colors[i].activity) 
									this.childNodes[j].setAttribute("stroke", colors[i].color);
					  		// return `M ${activity.StartTime} ${strokeWidth * (1 + intervalRate) * (2 * i + 1 + activity.Subrow)} L ${activity.EndTime} ${strokeWidth * (1 + intervalRate) * (2 * i + 1 + activity.Subrow)}`;
							return `M ${activity.StartTime + 15} ${3 + strokeWidth * (totalHeight +  intervalRate * (i + 1) + activity.Subrow)} L ${activity.EndTime + 15} ${3 + strokeWidth * (totalHeight +  intervalRate * (i + 1) + activity.Subrow)}`;
					  	})
						.on("mouseover", function(d) { // tooltip
							tooltipDiv.transition()
							   		  .duration(200)
							   		  .style("opacity", .9);
							tooltipDiv.html( `Case ID: ${alignment.ID[0].seq}<br>Activity: ${d.activity}<br>Duration: ${d.Duration}<br>StartTime: ${d.StartTime}<br>EndTime: ${d.EndTime}<br>Subrow: ${d.Subrow}`)
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

		// dataHeight = d3.select(".data-series");
		dataHeight = d3.select(".data-series").node().getBBox().height;
		rate.h = band.h / dataHeight;

		
		// -------------------------------------------------------------------------------------
		// Render Case ID Here

		rowHead.g = frame.append("g")
			.attr("class", "row-head")

		rowHead.g.append("rect")
			.attr("class", "row-head-background")
			.attr("width", rowHead.w)
			.attr("height", vis.h);

		rowHead.g.append("g")
			.attr("class", "data-id")

		totalHeight = 0;
		let headItems = d3.select(".data-id").selectAll("g")//////////////////
				.data(data.alignment)
				.enter()
					.append("g")
					//.each(test);
					.each(function(alignment, i) {
						// 这里不能用arrow function写，否则this就会读错为整体的dom
						// can't use arrow function here
						d3.select(this)
							.append("path")
							.attr("class", "grids")
							.attr("d", `M 0 ${3 + strokeWidth * (totalHeight +  intervalRate * (i + 1) + alignment.Height) - strokeWidth * intervalRate / 2} L ${rowHead.w} ${3 + strokeWidth * (totalHeight +  intervalRate * (i + 1) + alignment.Height) - strokeWidth * intervalRate / 2}`);
						d3.select(this)
							.append("text")
							.attr("class", "id-text")
							.attr("x", 5)
							.attr("y",`${3 + strokeWidth * (totalHeight +  intervalRate * (i + 1) + alignment.Height / 2) - strokeWidth * intervalRate / 2}`)
							.text(`${alignment.ID[0].seq}`);
							totalHeight += alignment.Height;
					});

		// -------------------------------------------------------------------------------------
		// axis

		const axis1 = frame.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${vis.h + 1})`);	

		axis1.append("path")
			// .attr("d", "M 5 100 L 395 100")
			.attr("d", `M0,0V0H${width}V0`)
			.attr("stroke", "#e6e6e6");

		const axis2 = frame.append("g")
			.attr("class", "axis")
			.attr("transform", `translate(0,${vis.h + 50 + 1})`);
		axis2.append("path")
			// .attr("d", "M 5 150 L 395 150")	
			.attr("d", `M0,0V0H${width}V0`)
			.attr("stroke", "#e6e6e6");

		// -------------------------------------------------------------------------------------
		// band
		
		bandStrokeWidth = band.h * strokeWidth / vis.h; 

		band.g = frame.append("g")
			.attr("class", "band")
			.attr("transform", `translate(0,${vis.h + 1})`);

		band.g.append("rect")
			.attr("class", "bandbackground")
			.attr("width", width)
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
				.attr("stroke","rgb(102,133,194)")
				.attr("stroke-width", bandStrokeWidth)
				.attr("d", (activity, j) => {
					for (let i = 0; i < colors.length; i++) 
								if (activity.activity == colors[i].activity) 
									this.childNodes[j].setAttribute("stroke", colors[i].color);
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

		// -------------------------------------------------------------------------------------
		// scroll bar

		const barAxis = frame.append("g")
			.attr("class", "scroll-axis")
			.attr("transform", `translate(${width - scrollBand.w},0)`);	

		barAxis.append("path")
			// .attr("d", "M 5 100 L 395 100")
			.attr("d", `M0 0 V ${vis.h}`)
			.attr("stroke", "rgba(102, 102, 102, 0.1)");
		
		barWidth = width - scrollBand.w;
		scrollBand.g = frame.append("g")
			.attr("class", "scroll-band")
			.attr("transform", `translate(${barWidth},0)`)

		barHeight = vis.h / dataHeight * vis.h;
		scrollBar = scrollBand.g.append("rect")
			.attr("class", "scroll-bar")
			.attr("transform", `translate(0,0)`)
			.attr("width", scrollBand.w)
        	.attr("height", barHeight)
			.on("mousedown", selectElement);

	}
}

function colorMap(data) {
	let colorMap = [];
	let colorObj = {};
	let alignment = data.alignment;
	for (var i = 0; i < alignment.length; i++) {
		for (var j = 0; j < alignment[i].value.length; j++) {
			let activity = alignment[i].value[j].activity;
			if (colorMap.length == 0) {
				colorObj.activity = activity;
				colorObj.color = d3ScaleChromatic.interpolateSpectral(0);
				colorMap.push(colorObj);
				colorObj = {};
			}
			else 
				for (var k = 0; k < colorMap.length; k++) {
					if (colorMap[k].activity === activity) break;
					else if (k == colorMap.length - 1) {
						colorObj.activity = activity;
						if (k <= 10) colorObj.color = d3ScaleChromatic.interpolateSpectral(k/10);
						else if (k > 10 && k <= 15) colorObj.color = d3ScaleChromatic.interpolateRdPu((k - 10)/7);
						else colorObj.color = d3ScaleChromatic.interpolateGreys((k- 15)%10/10);
						colorMap.push(colorObj);
						colorObj = {};
					}
				}
		}
	}
	return colorMap;
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
	maskWidth = parseFloat(band.w / currentScale);////
	let maskWidthChanged = maskWidth0 - maskWidth;
	maskX = parseFloat(groupX) + maskX < 0 ? (-1) * parseFloat(groupX) : parseFloat(groupX) + maskX + maskWidth > band.w ? maskX + maskWidthChanged : maskX + maskWidthChanged / 2;////
	ctrl1 = maskX - 2.5;
	ctrl2 = maskX + maskWidth - 2.5;
	leftControl._groups[0][0].setAttribute("transform", `translate(${ctrl1}, 12.5)`);
	rightControl._groups[0][0].setAttribute("transform", `translate(${ctrl2}, 12.5)`);
	mask._groups[0][0].setAttribute("transform", `translate(${maskX},0)`);
	mask._groups[0][0].setAttribute("width", `${maskWidth}`);
	// Change display area
	maskRate = maskWidth / band.w;
	dataVisible = maskRate * dataLength;
	dataInvisible = (-1) * (maskX + parseFloat(groupX)) * dataLength / band.w; // maskX + groupX是mask的绝对x距离 // maskX + groupX = mask's absolute X distance
	dataInvisibleY = (-1) * barY / vis.h * dataHeight;
	scale = vis.w / (maskRate * dataLength);
	vis.g._groups[0][0].childNodes[1].setAttribute("transform", `scale(${scale},${1}) translate(${dataInvisible},${dataInvisibleY})`);
}

function selectElement() {
	//console.log(this); // dom
	click = true;
	selectedElement = d3.select(this); // object
	currentX = d3.event.clientX; // event.x
	currentY = d3.event.clientY;

	if (this.getAttribute("class") === 'mask-controller'){  // single move
		console.log("single");
    	moveTarget = this;
    	dx = parseFloat(moveTarget.getAttribute("transform").slice(10,-1).split(',')[0]);  // 上一次的相对位移 // last relative moving distance
    	// make controller to the top
    	//svg.appendChild(evt.target);
    }
 	else if (this.getAttribute("class") === 'navigator-mask'){ 						// group move
    	moveTarget = this.parentNode;
 	}
	else {
		moveTarget = this;
		dy = parseFloat(moveTarget.getAttribute("transform").slice(10,-1).split(',')[1]);
	}
	
 	d3.select("#svg").on("mousemove", moveElement);
	// d3.select("#svg").on("mouseout", deselectElement);
	d3.select("#svg").on("mouseup", deselectElement);
}

function moveElement() {
	currentAxis = moveTarget.getAttribute("transform").slice(10, -1).split(','); // ["392", "0"]
	if(moveTarget.getAttribute("class") === "mask-controller") { 
		dx += d3.event.clientX - currentX;   // 移动滑动块，累计每次的位移，取相对位移，限定boundary // accumulation moving distance for left/right controllers = relative distance
		// currentAxis[0] = (dx + groupX < 2.5 ? -2.5 : (dx + groupX > 927.5 ? 927.5 - groupX : dx)); // limit boundary
		currentAxis[0] = dx;
		// syncronize zoom scale
		d3.select(".visbackground")
			.call(zoom.transform, d3.zoomIdentity
			.scale(band.w / maskWidth));
	}
	else if (moveTarget.getAttribute("class") === "scroll-bar") {
		dy += d3.event.clientY - currentY;
		// currentAxis[1] = dy;
		let barTrans = parseFloat(selectedElement._groups[0][0].getAttribute("transform").slice(10, -1).split(',')[1]);
		currentAxis[1] = dy < 0 ? 0 : dy + barHeight - 2 > vis.h  ? vis.h - barHeight + 2 : dy;
	}
	else {
		if (selectedElement._groups[0][0].getAttribute("transform")!=null) {
			let maskTrans = parseFloat(selectedElement._groups[0][0].getAttribute("transform").slice(10, -1).split(',')[0]);
			currentAxis[0] = (d3.event.clientX - currentX + parseFloat(currentAxis[0]) + parseFloat(maskTrans) < 0 ? 0 - parseFloat(maskTrans) : (d3.event.clientX - currentX + parseFloat(currentAxis[0])) > (band.w - maskWidth - maskTrans) ? (band.w - maskWidth - maskTrans) : d3.event.clientX - currentX + parseFloat(currentAxis[0]));  
	}
		// currentAxis[0] = d3.event.clientX - currentX + parseFloat(currentAxis[0]);// 移动mask，取绝对位移，限定boundary // moving distance for mask = absolute distance;
	}
	moveTarget.setAttribute("transform", `translate(${currentAxis.join(',')})`);
	currentX = d3.event.clientX;
	currentY = d3.event.clientY;

	// change mask according to controller movements
	let ctrl1 = leftControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0],
		ctrl2 = rightControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0];
		groupX = group._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0];
	maskX = Math.min(parseFloat(ctrl1), parseFloat(ctrl2)) + 2.5; // 2.5是滑块的半长 // 2.5 = left/right controller's half width
	barY = scrollBar._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[1];
	maskWidth = Math.abs(parseFloat(ctrl1) - parseFloat(ctrl2));
	mask._groups[0][0].setAttribute("transform", `translate(${maskX},${0})`);
	mask._groups[0][0].setAttribute("width", maskWidth);

	// change display area
	maskRate = maskWidth / band.w;
	dataVisible = maskRate * dataLength;
	dataInvisible = (-1) * (maskX + parseFloat(groupX)) * dataLength / band.w; // maskX + groupX是mask的绝对x距离 // maskX + groupX = mask's absolute X distance
	dataInvisibleY = (-1) * barY / vis.h * dataHeight;
	scale = vis.w / (maskRate * dataLength);
	vis.g._groups[0][0].childNodes[1].setAttribute("transform", `scale(${scale},${1}) translate(${dataInvisible},${dataInvisibleY})`);
	rowHead.g._groups[0][0].childNodes[1].setAttribute("transform", `translate(0,${dataInvisibleY})`);
	
}

function deselectElement() {
	if(d3.event.type == 'mouseout' && click) return;
	click = false;
	d3.select("#svg").on("mousemove", null);
	d3.select("#svg").on("mouseout", null);
	d3.select("#svg").on("mouseup", null);
}

module.exports = timeline
