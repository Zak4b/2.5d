import { CanvasInterface } from "./canvas.js";
const canvas = document.getElementById("map");

const cv = new CanvasInterface(canvas);
let dimX = 10; //prompt("Dim x");
let dimY = 10; //prompt("Dim y");
dimX = parseInt(dimX);
dimY = parseInt(dimY);
const map = [];
for (let y = 0; y < dimY; y++) {
	map[y] = [];
	for (let x = 0; x < dimX; x++) {
		map[y][x] = 0;
	}
}
const a = canvas.width / dimX;
const b = canvas.height / dimY;
const cSize = Math.min(a, b);

canvas.addEventListener("mousedown", (e) => false);
canvas.addEventListener("mouseup", (e) => false);
canvas.addEventListener("mousedown", (e) => false);

const drawLayout = () => {
	for (let i = 0; i < mapLayout.length; i++) {
		const row = mapLayout[i];
		let style;
		for (let j = 0; j < row.length; j++) {
			style = mapColors[mapLayout[i][j]];
			cv.rect(j * cSize, i * cSize, cSize, cSize, { style });
		}
	}
	cv.options({ width: 3, style: "#555555" });
};

const loop = (t = 0) => {
	drawLayout();
	cv.grid(cSize);
};
requestAnimationFrame(loop);
