import { CanvasInterface } from "./canvas.js";
const canvas = document.getElementById("map");

const cv = new CanvasInterface(canvas);
let dimX = 10; //prompt("Dim x");
let dimY = 10; //prompt("Dim y");
dimX = parseInt(dimX);
dimY = parseInt(dimY);
const mapColors = { 0: "#DDDDDD", 1: "#222222" };
const mapLayout = [];
for (let y = 0; y < dimY; y++) {
	mapLayout[y] = [];
	for (let x = 0; x < dimX; x++) {
		mapLayout[y][x] = 0;
	}
}
const a = canvas.width / dimX;
const b = canvas.height / dimY;
const cSize = Math.min(a, b);

canvas.addEventListener("mousedown", (e) => {
	mouseF(e);
	canvas.addEventListener("mousemove", mouseF, { passive: true });
});
canvas.addEventListener("mouseup", (e) => {
	canvas.removeEventListener("mousemove", mouseF);
});
/**
 * @param {MouseEvent} e
 */
const mouseF = (e) => {
	const relativeX = Math.floor(e.offsetX / cSize);
	const relativeY = Math.floor(e.offsetY / cSize);
	mapLayout[relativeY][relativeX] = 1;
	loop();
};
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

const loop = () => {
	drawLayout();
	cv.grid(cSize);
	requestAnimationFrame(loop);
};
loop();
