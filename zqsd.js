import { Point, Angle, Vecteur, Raycaster } from "./class/Geometry.js";
import { CanvasInterface, CanvasRenderer } from "./class/Canvas.js";
import { fpsMeter } from "./class/FpsMeter.js";
window.oncontextmenu = (e) => e.preventDefault();
const cSize = 64;

const ball = new Point(4.5 * cSize, 1.5 * cSize);
let angleDirection = new Angle(-180);

const ballSpeed = (350 * cSize) / 100;
const FOV = new Angle(75);
const displayGrid = true;
const mapLayout = [
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
	[0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1],
	[0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
	[0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
	[0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1],
	[1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
	[1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
const mapColors = { 0: "#DDDDDD", 1: "#222222" };
const caster = new Raycaster(mapLayout, cSize);
const fps = new fpsMeter();

const cv = new CanvasInterface({ width: 1000, height: 1000 }); // { width: mapLayout[0].length, height: mapLayout.length }
const cv3d = new CanvasInterface(document.getElementById("zqsd"));
const ctx3d = cv3d.element.getContext("2d");
const key = [];
let tLast = 0;
document.addEventListener("keydown", (e) => (key[e.key.toLowerCase()] = true), false);
document.addEventListener("keyup", (e) => (key[e.key.toLowerCase()] = false), false);

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
/**
 * @param {Angle} angleDirection
 */
const drawFOV = (angleDirection) => {
	const ang = new Angle(FOV.rad / (rayCount + -1), true);
	const halfHeight = cv3d.height / 2;
	const coef = cv3d.width / (2 * Math.tan(FOV.rad / 2));
	for (let i = 0; i < rayCount; i++) {
		const rayAngle = angleDirection.rad - FOV.rad / 2 + ang.rad * i;
		const { intersect, collide } = caster.castRay(ball, rayAngle);
		const distance = ball.distance(intersect) * Math.cos(rayAngle - angleDirection.rad);
		const segmentSize = (cSize / distance) * coef;
		collide ? mapLayout[collide.y][collide.x] : null;

		const sx = Math.floor((((intersect.x % cSize) + (intersect.y % cSize)) * wall.width) / cSize);
		ctx3d.drawImage(wall, sx, 0, 1, wall.height, i, halfHeight - segmentSize / 2, 1, segmentSize);
	}
};

const moveBall = (t = 0) => {
	// v = d/t d = vxt
	const d = ballSpeed * (t / 1000);
	if (key["q"]) angleDirection = angleDirection.add((-180 * t) / 1000);
	if (key["d"]) angleDirection = angleDirection.add((180 * t) / 1000);
	const v = Vecteur.fromAngle(angleDirection).scal(d);

	if (key["z"] || key["s"]) {
		const mov = key["z"] ? v : Vecteur.scal(v, -1);
		const next = Point.translate(ball, mov);
		const cell = next.transpose(1 / cSize);
		const offsetX = next.x % cSize;
		const offsetY = next.y % cSize;

		const minDistance = 10;
		if (mov.x > 0) {
			if (mapLayout[cell.y][cell.x + 1] !== 0 && offsetX > cSize - minDistance) {
				next.x -= offsetX - (cSize - minDistance);
			}
		} else {
			if (mapLayout[cell.y][cell.x - 1] !== 0 && offsetX < minDistance) {
				next.x += minDistance - offsetX;
			}
		}
		if (mov.y > 0) {
			if (mapLayout[cell.y + 1]?.[cell.x] !== 0 && offsetY > cSize - minDistance) {
				next.y -= offsetY - (cSize - minDistance);
			}
		} else {
			if (mapLayout[cell.y - 1]?.[cell.x] !== 0 && offsetY < minDistance) {
				next.y += minDistance - offsetY;
			}
		}

		ball.copy(next);
	}
};

const wall = new Image();
wall.src = "wall.png";

const loop = (t = 0) => {
	cv.clear();
	cv3d.clear();
	cv3d.rect(0, 0, cv3d.width, cv3d.height / 2, { style: "#1b237a" });
	cv3d.rect(0, cv3d.height / 2, cv3d.width, cv3d.height / 2, { style: "#555555" });
	moveBall(t - tLast);
	const cell = ball.transpose(1 / cSize);
	fps.push(t - tLast);

	drawLayout();
	if (displayGrid) cv.grid(cSize);
	cv.ball(ball, { style: "#AA0000" });
	drawFOV(angleDirection);
	cv3d.textGroup(["θ : " + Math.floor(angleDirection.deg), `Position: (${cell.x}, ${cell.y})`, `${fps.value}`], cv3d.width - 150, 20, {
		style: "#FFFFFF",
	});
	ctx3d.drawImage(cv.element, 0, 0, 150, 150);

	tLast = t;
	requestAnimationFrame(loop);
};
cv3d.element.width = window.innerWidth;
cv3d.element.height = window.innerHeight;
const rayCount = cv3d.element.width;
requestAnimationFrame(loop);
