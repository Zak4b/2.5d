import { Point, Angle, Vecteur, Raycaster } from "./geometry.js";
import { CanvasInterface, CanvasRenderer } from "./canvas.js";
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

const mapCanvas = document.createElement("canvas");
mapCanvas.width = 1000;
mapCanvas.height = 1000;
const cv = new CanvasInterface(mapCanvas);
const cv3d = new CanvasInterface(document.getElementById("zqsd"));
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
	const stack = [];
	const ang = new Angle(FOV.deg / (rayCount + -1));
	const tpl = [];
	const H = cv3d.height;
	const coef = cv3d.width / (2 * Math.tan(FOV.rad / 2));
	let last;
	for (let i = 0; i < rayCount; i++) {
		const rayAngle = angleDirection.rad - FOV.rad / 2 + ang.rad * i;
		const { intersect, collide } = caster.castRay(ball, rayAngle);
		tpl.push(intersect);
		const distance = ball.distance(intersect) * Math.cos(rayAngle - angleDirection.rad);
		const tSize = (cSize / distance) * coef;

		const isEdge = collide.x !== last?.collide.x || collide.y !== last?.collide.y || (intersect.x !== last?.intersect.x && intersect.y !== last?.intersect.y); //  !!! affichage gauche -> droite, peut s'appliquer sur le pixel suivant
		const color = isEdge ? "#000000" : "#3c3c3c";
		isEdge && stack.push(() => cv.ball(intersect, { radius: 5, style: "#880000" }));
		last = { intersect, collide };

		cv3d.rect(i, H / 2 - tSize / 2, 1, tSize, { style: color });
	}
	cv.shape([ball, ...tpl], { style: "#0095DD" });
	stack.forEach((f) => f());
	const { intersect } = caster.castRay(ball, angleDirection.rad);
	cv.line(ball, intersect, { width: 1, style: "#660000" });
};

const moveBall = (t = 0) => {
	// v = d/t d = vxt
	const d = ballSpeed * (t / 1000);
	if (key["q"]) angleDirection = angleDirection.add((-180 * t) / 1000);
	if (key["d"]) angleDirection = angleDirection.add((180 * t) / 1000);
	const v = Vecteur.fromAngle(angleDirection).scal(d);

	if (key["z"] || key["s"]) {
		const next = key["s"] ? Point.translate(ball, Vecteur.scal(v, -1)) : Point.translate(ball, v);
		const cell = next.transpose(1 / cSize);
		if (cell.x >= 0 && cell.x < mapLayout[0].length && cell.y >= 0 && cell.y < mapLayout.length && mapLayout[cell.y][cell.x] == 0) {
			ball.copy(next);
		}
	}
	return v;
};

const wall = new Image();
wall.src = "wall.png";
console.log(wall);

const loop = (t = 0) => {
	cv.clear();
	cv3d.clear();
	cv3d.rect(0, 0, cv3d.width, cv3d.height / 2, { style: "#1b237a" });
	cv3d.rect(0, cv3d.height / 2, cv3d.width, cv3d.height / 2, { style: "#555555" });
	const v = moveBall(t - tLast);
	const cell = ball.transpose(1 / cSize);
	fps.shift();
	fps.push(t - tLast);
	if (!v.isNull) angleDirection = v.angle;

	drawLayout();
	if (displayGrid) cv.grid(cSize);
	cv.ball(ball);
	drawFOV(angleDirection);
	cv.textGroup(["θ : " + Math.floor(angleDirection.deg), `Position: (${cell.x}, ${cell.y})`, `${Math.round(1 / (fps.reduce((accumulator, value) => accumulator + value) / 10 / 1000))}`], 20, 20, {
		style: "#000000",
	});
	cv3d.element.getContext("2d").drawImage(cv.element, 0, 0, 150, 150);
	// renderer.render();

	tLast = t;
	requestAnimationFrame(loop);
};
const fps = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
cv3d.element.width = window.innerWidth;
cv3d.element.height = window.innerHeight;
const rayCount = cv3d.element.width;
document.body.append(cv.element);
requestAnimationFrame(loop);
