/* eslint-disable no-undef, no-unused-vars */

/* TO DO :
		- debug path
 */

class Point {
		constructor(x, y, id) {
				this.x = x;
				this.y = y;
				this.id = id;
		}

		isInside(a, b, c){
				let det = this.detCircle(a, b, c);
				let isCCW = this.ccw(a, b, c);
				return (( isCCW && det >= 0) || (!isCCW && det <= 0));
		}

		detCircle(a, b, c){
				// Source : https://stackoverflow.com/questions/39984709/how-can-i-check-wether-a-point-is-inside-the-circumcircle-of-3-points
				let ax = a.x-this.x;
				let ay = a.y-this.y;
				let bx = b.x-this.x;
				let by = b.y-this.y;
				let cx = c.x-this.x;
				let cy = c.y-this.y;
				return((ax*ax + ay*ay) * (bx*cy-cx*by) - (bx*bx + by*by) * (ax*cy-cx*ay) + (cx*cx + cy*cy) * (ax*by-bx*ay));
		}

		ccw(a, b, c) {
				return (b.x - a.x)*(c.y - a.y)-(c.x - a.x)*(b.y - a.y) > 0;
		}
}

class Edge{
		constructor(end1, end2) {
				this.end1 = end1;
				this.end2 = end2;
		}
}

let id = 0;
let points = [];
let graph = [];
let hamCycle = [];
let lenGraph = 0;

function setup() {
		createCanvas(windowWidth, windowHeight);
		// Put setup code here
		fill("black");
		textSize(15);
		clearButton = createButton("Clear");
		clearButton.position(30, 70);
		clearButton.mousePressed(resetPoints);

		inputX = createInput('x');
		inputX.position(30, 10);
		inputX.size(40);
		inputY = createInput('y');
		inputY.position(inputX.x + inputX.width+5, 10);
		inputY.size(40);
		addButton = createButton("Add");
		addButton.position(inputY.x + inputY.width + 5, 10);
		addButton.mousePressed(function(){addPoint(inputX.value(), inputY.value());});

		inputK = createInput('0');
		inputK.position(55, 40);
		inputK.size(15);
		computeKDButton = createButton('Compute k-DG');
		computeKDButton.position(inputK.x + inputK.width + 5, 40);
		computeKDButton.mousePressed(function(){computeKDG(inputK.value());});
		computeHamButton = createButton('Compute Hamiltonian cycle');
		computeHamButton.position(computeKDButton.x + computeKDButton.width + 5 , 40);
		computeHamButton.mousePressed(computeHamC);
}

function resetPoints() {
		points = [];
		graph = [];
		hamCycle = [];
		id = 0;
		lenGraph = 0;
}

function addPoint(x,y){
		x = parseInt(x);
		y = parseInt(y);
		if (!isNaN(x) && !isNaN(y) && x < windowWidth && y > 100 && y < windowHeight){
				points.push(new Point(x, y));
		}
}

function computeKDG(k){
		graph = [];
		hamCycle = [];
		if(points.length < 3) return;
		let count = 0;
		k = parseInt(k);
		if (isNaN(k)){
				k = 0;
		}
		for (let a = 0; a < points.length; a++) {
				for (let b = a + 1; b < points.length; b++) {
						for (let c = b + 1; c < points.length; c++) {
								for (let d = 0; d < points.length; d++) {
										if (points[d].isInside(points[a],points[b],points[c])){
												count ++;
										}
								}
								if (count <= k+3){
										graph.push(new Edge(points[a],points[b]));
										graph.push(new Edge(points[b],points[c]));
										graph.push(new Edge(points[c],points[a]));
								}
								count = 0;
						}
				}
		}
		let pointIn = [];
		for (let e in graph){
				if (!pointIn.includes(graph[e].end1)){
						pointIn.push(graph[e].end1);
				}if (!pointIn.includes(graph[e].end2)){
						pointIn.push(graph[e].end2);
				}
		}
		lenGraph = pointIn.length;
}

function computeHamC(){
		let adjacencyMatrix = computeMatrix();
		let currPath = [points[0]];
		hamCycle = hamCycleUtil(currPath, adjacencyMatrix);
}

function isSafe(v, path, adjacencyMatrix) {
		if (adjacencyMatrix[path[path.length-1].id][v.id] === 0){return false;}
		return !path.includes(v);
}

function hamCycleUtil(path, adjacencyMatrix){
		if (path.length === lenGraph){
				if (adjacencyMatrix[path[path.length - 1].id ][ path[0].id ] === 1){
						return path;
				}
				else{return false;}
		}

		for (let v in points){
				if (isSafe(points[v], path, adjacencyMatrix) === true) {
						path.push(points[v]);

						if (hamCycleUtil(path, adjacencyMatrix) !== false) {
								return path;
						}
						path.pop();
				}
		}
		return false;
}

function computeMatrix(){
		let matrix = [];
		for (let i = 0; i < points.length; i++){
				matrix.push(new Array(points.length).fill(0));
		}
		for (let e in graph){
				matrix[graph[e].end1.id][graph[e].end2.id] = 1;
				matrix[graph[e].end2.id][graph[e].end1.id] = 1;
		}
		return matrix;
}

function draw() {
		// Put drawings here
		background(200);
		text('k = ', 24,47);
		line(0, 100, windowWidth, 100);
		// Draw Points
		for (let i in points) {
				ellipse(points[i].x, points[i].y, 4, 4);
		}
		// Draw Graph
		for (let i in graph){
				line(graph[i].end1.x, graph[i].end1.y, graph[i].end2.x, graph[i].end2.y);
		}
		// Draw Cycle
		let l = hamCycle.length;
		stroke("red");
		for (let i = 0; i < l; i++){
				line(hamCycle[i].x, hamCycle[i].y, hamCycle[(i+1)%l].x, hamCycle[(i+1)%l].y);
		}
		stroke("black");
}

function mousePressed() {
		if (mouseY > 100) {
				// Inside of drawing area
				points.push(new Point(mouseX, mouseY, id));
				id++;
		}
}

// This Redraws the Canvas when resized
windowResized = function () {
		resizeCanvas(windowWidth, windowHeight);
};
