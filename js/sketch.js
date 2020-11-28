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


		/**
		 * Check if the point is inside the circumcircle formed by abc
		 * @param {Point} a
		 * @param {Point} b
		 * @param {Point} c
		 * @return {Boolean} if the point is in/on the circle
		 */
		isInside(a, b, c){
				let det = this.detCircle(a, b, c);
				let isCCW = this.ccw(a, b, c);
				return (( isCCW && det >= 0) || (!isCCW && det <= 0));
		}

		/**
		 * Compute the determinant for function isInside
		 * See : https://stackoverflow.com/questions/39984709/how-can-i-check-wether-a-point-is-inside-the-circumcircle-of-3-points
		 * @param {Point} a
		 * @param {Point} b
		 * @param {Point} c
		 * @return {Number} the determinant
		 */
		detCircle(a, b, c){
				let ax = a.x-this.x;
				let ay = a.y-this.y;
				let bx = b.x-this.x;
				let by = b.y-this.y;
				let cx = c.x-this.x;
				let cy = c.y-this.y;
				return((ax*ax + ay*ay) * (bx*cy-cx*by) - (bx*bx + by*by) * (ax*cy-cx*ay) + (cx*cx + cy*cy) * (ax*by-bx*ay));
		}

		/**
		 * Check if the points a, b and c are in CW or CCW order
		 * @param {Point} a
		 * @param {Point} b
		 * @param {Point} c
		 * @return {Boolean} if the points are in CCW
		 */
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
		// Create button to clear everything
		clearButton = createButton("Clear");
		clearButton.position(30, 90);
		clearButton.mousePressed(resetPoints);
		// Create inputs and button to add points by coordinates
		inputX = createInput('x');
		inputX.position(30, 30);
		inputX.size(40);
		inputY = createInput('y');
		inputY.position(inputX.x + inputX.width+5, 30);
		inputY.size(40);
		addButton = createButton("Add");
		addButton.position(inputY.x + inputY.width + 5, 30);
		addButton.mousePressed(function(){addPoint(inputX.value(), inputY.value());});
		// Create input for the value k and buttons to compute the KDG and the hamiltonian cycle
		inputK = createInput('0');
		inputK.position(55, 60);
		inputK.size(15);
		computeKDButton = createButton('Compute k-DG');
		computeKDButton.position(inputK.x + inputK.width + 5, 60);
		computeKDButton.mousePressed(function(){computeKDG(inputK.value());});
		computeHamButton = createButton('Compute Hamiltonian cycle');
		computeHamButton.position(computeKDButton.x + computeKDButton.width + 5 , 60);
		computeHamButton.mousePressed(computeHamC);
}

/**
* Reset global variables
*/
function resetPoints() {
		points = [];
		graph = [];
		hamCycle = [];
		id = 0;
		lenGraph = 0;
}

/**
* Add a point at the coordinates given
* @param {String} x
* @param {String} y
*/
function addPoint(x,y){
		x = parseInt(x);
		y = parseInt(y);
		if (!isNaN(x) && !isNaN(y) && x < windowWidth && y > 100 && y < windowHeight){
				points.push(new Point(x, y, id));
				id ++;
		}
}

/**
* Compute the KDG with the given k value
* @param {String} k
*/
function computeKDG(k){
		graph = [];
		hamCycle = [];
		if(points.length < 3) return;
		let count = 0;
		k = parseInt(k);
		if (isNaN(k)){
			// If the k given isn't valid, it is set at 0
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
		// Count the number of point in the graph, in case some are not (for the hamCycle)
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

/**
* Compute the hamiltonian cycle using back tracking
* Code modified from : https://www.geeksforgeeks.org/hamiltonian-cycle-backtracking-6/
*/
function computeHamC(){
		let adjacencyMatrix = computeMatrix();
		let currPath = [points[0]];
		hamCycle = hamCycleUtil(currPath, adjacencyMatrix);
}

/**
* Check if the point v is a good point to add to the path
* Safe if there is an edge from the last point of path to this one and if it is not already in path
* @param {Point} v
* @param {Point[]} path the path so far
* @param {Number[][]} adjacencyMatrix
* @return {Boolean} if the point is safe
*/
function isSafe(v, path, adjacencyMatrix) {
		if (adjacencyMatrix[path[path.length-1].id][v.id] === 0){return false;}
		return !path.includes(v);
}

/**
* Recurcively look for a correct hamiltonian path
* @param {Point[]} path the path so far
* @param {NUmber[][]} adjacencyMatrix
* @return {} false is no cycle, the path if there is
*/
function hamCycleUtil(path, adjacencyMatrix){
		// First if the path have the right length, we check if there is an edge between first and last
		// If there is, we found our path, else the path is not a valid cycle
		if (path.length === lenGraph){
				if (adjacencyMatrix[path[path.length - 1].id ][ path[0].id ] === 1){
						return path;
				}
				else{return false;}
		}
		// We seach for a new point to add. If it safe, we add it to the path and check of we find a cycle with this configuration.
		// If we do, we return the path, else we pop the point and continue
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

/**
* Compute the adjacency matrix
* @return {NUmber[][]} the matrix
*/
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
