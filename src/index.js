import * as d3 from 'd3';
var vis = null;
var group = null;
var mask = null;
var leftControl = null;
var rightControl = null;
var selectedElement, moveTarget,
  	currentX = 0, currentAxis = 0, dx,
  	dataLength = 1092, dataVisible, dataInvisible, rate, scale, 
  	groupX = 150, maskX = 0, maskWidth = 100;
  	//svg = document.querySelector("svg"),

class timeline {

	constructor(dom) {
    	this._dom = dom;
	}

	draw() {

		//dataLength = Math.max(...)

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

		let frame = svg.append("g")
					.attr("xlink:href","#display");

		vis = frame.append("g")
					.attr("class", "data-series")
					.attr("transform", "scale(3.71428,1) translate(-161.53846,0)");

		vis.append("path")
			.attr("stroke-width", 5)
			.attr("stroke", "rgb(102,133,194)")
			.attr("d", "M 0 25 L 1 25 M 0 50 L 1 50 M 68 25 L 83 25 M 108 25 L 109 25 M 359 25 L 368 25 M 403 25 L 404 25 M 439 25 L 440 25 M 470 25 L 482 25 M 496 25 L 512 25 M 592 25 L 593 25 M 619 25 L 651 25");
			// .data()
			// .enter()
			// .attr("d", () => {})
			// .attr("stroke", )


        group = svg.append("g")
		        .attr("class", "navigator-controller")
		        .attr("transform", "translate(150,0)");

        mask = group.append("rect")
        		.attr("class", "navigator-mask")
        		.style("fill", "rgba(102,133,194,0.3)")
        		.attr("transform", "translate(0,100)")
        		.style("cursor", "pointer")
        		.attr("width", 100)
        		.attr("height", 50)
        		.on("mousedown", selectElement);
        
        leftControl = group.append("rect")
        				.attr("class", "mask-controller")
        				.attr("stroke", "#cccccc")
        				.attr("stroke-width", 1)
        				.style("fill", "#e6e6e6")
        				.attr("width", 5)
        				.attr("height", 15)
        				.style("cursor", "pointer")
        				.attr("transform", "translate(-2.5,115)")
        				.on("mousedown", selectElement);

        rightControl = group.append("rect")
        				.attr("class", "mask-controller")
        				.attr("stroke", "#cccccc")
        				.attr("stroke-width", 1)
        				.style("fill", "#e6e6e6")
        				.attr("width", 5)
        				.attr("height", 15)
        				.style("cursor", "pointer")
        				.attr("transform", "translate(97.5,115)")
        				.on("mousedown", selectElement);
	}


}

function selectElement() {
	//console.log(this); // dom
	selectedElement = d3.select(this); // object
	currentX = d3.event.clientX; // event.x

	if (this.getAttribute("class") === 'mask-controller'){  // single move
		console.log("single");
    	moveTarget = this;
    	dx = parseFloat(moveTarget.getAttribute("transform").slice(10,-1).split(',')[0]);  // 上一次的相对位移
    	// make controller to the top
    	//svg.appendChild(evt.target);
    }
 	else { 						// group move
    	moveTarget = this.parentNode;
 	}

 	selectedElement.on("mousemove", moveElement);
	selectedElement.on("mouseout", deselectElement);
	selectedElement.on("mouseup", deselectElement);
}

function moveElement(){
	currentAxis = moveTarget.getAttribute("transform").slice(10, -1).split(',');
	
	if(moveTarget.nodeName === "rect") { 
		dx += d3.event.clientX - currentX;   // 移动滑动块，累计每次的位移，取相对位移，限定boundary
		//currentAxis[0] = (dx + groupX < 2.5 ? -2.5 : (dx + groupX > 392.5 ? 392.5 - groupX : dx));
		currentAxis[0] = dx;
	}
	else {
		//currentAxis[0] = (evt.clientX - currentX + parseFloat(currentAxis[0]) < 5 ? 5 : (evt.clientX - currentX + parseFloat(currentAxis[0]) + maskWidth) > 395 ? 395 : evt.clientX - currentX + parseFloat(currentAxis[0]));  
		currentAxis[0] = d3.event.clientX - currentX + parseFloat(currentAxis[0]);// 移动mask，取绝对位移，限定boundary

	}
	
	moveTarget.setAttribute("transform", `translate(${currentAxis.join(',')})`);
	currentX = d3.event.clientX;

	// change mask according to controller movements
	let ctrl1 = leftControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0],
		ctrl2 = rightControl._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0];
		groupX = group._groups[0][0].attributes.transform.value.slice(10, -1).split(',')[0];
	maskX = Math.min(parseFloat(ctrl1), parseFloat(ctrl2)) + 2.5; // 2.5是滑块的半长
	maskWidth = Math.abs(parseFloat(ctrl1) - parseFloat(ctrl2));
	mask._groups[0][0].setAttribute("transform", `translate(${maskX},${100})`);
	mask._groups[0][0].setAttribute("width", maskWidth);

	// change display area
	rate = maskWidth / 390;
	dataVisible = rate * dataLength;
	dataInvisible = (-1) * (maskX + parseFloat(groupX)) * dataLength / 390; // maskX + groupX是mask的绝对x距离
	scale = 800 / (rate * dataLength);
	vis._groups[0][0].setAttribute("transform", `scale(${scale},${1}) translate(${dataInvisible},${0})`);
}

function deselectElement(){
	selectedElement.on("mousemove", null);
	selectedElement.on("mouseout", null);
	selectedElement.on("mouseup", null);
}

module.exports = timeline