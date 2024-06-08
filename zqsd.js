import { Point, Angle, Vecteur, Raycaster } from "./geometry.js";
import { CanvasInterface, CanvasRenderer } from "./canvas.js";
window.oncontextmenu = (e) => e.preventDefault();
const cSize = 100;

const ball = new Point(8.5 * cSize, 5.5 * cSize);
let angleDirection = new Angle(59);

const ballSpeed = 350;
const FOV = new Angle(75);
const rayCount = 1200;
const joystick = false;
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
const canvas = document.getElementById("top");

//const renderer = new CanvasRenderer(canvas);
const cv = new CanvasInterface(canvas); //renderer.interface;
const cv3d = new CanvasInterface(document.getElementById("zqsd"));
const key = [];
let tLast = 0;
const mouseOrigin = new Point(0, 0);
let mouseVect = new Vecteur(0, 0);

const calcPointer = (e) => (mouseVect = Vecteur.fromPoints(joystick ? mouseOrigin : ball, new Point(e.offsetX, e.offsetY)).normalize());
canvas.addEventListener("pointerdown", (e) => {
	mouseOrigin.set(e.offsetX, e.offsetY);
	calcPointer(e);
	//throtle
	canvas.addEventListener("pointermove", calcPointer);
});
document.addEventListener("pointerup", (e) => {
	canvas.removeEventListener("pointermove", calcPointer);
	mouseVect = new Vecteur(0, 0);
});
document.addEventListener("keydown", (e) => (key[e.key] = true), false);
document.addEventListener("keyup", (e) => (key[e.key] = false), false);

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
	const ang = new Angle(FOV.deg / (rayCount + -1));
	const tpl = [];
	const H = cv3d.height;
	let last = { x: null, y: null };
	let lr = { x: null, y: null };
	for (let i = 0; i < rayCount; i++) {
		const rayAngle = angleDirection.rad - FOV.rad / 2 + ang.rad * i;
		const { intersect, collide } = caster.castRay(ball, rayAngle);
		tpl.push(intersect);
		const distance = ball.distance(intersect) * Math.cos(rayAngle - angleDirection.rad);
		const tSize = (cSize / distance) * (cv3d.width / (2 * Math.tan(FOV.rad / 2)));

		const r = { x: intersect.x % cSize, y: intersect.y % cSize };
		const isEdge = collide.x !== last.x || collide.y !== last.y || (r.x !== lr.x && r.y !== lr.y); //  !!! affichage gauche -> droite, peut s'appliquer sur le pixel suivant
		const color = isEdge ? "#000000" : "#3c3c3c";
		isEdge && cv.ball(intersect, { radius: 10, style: "#880000" });
		last = collide;
		lr = r;

		cv3d.rect(i, H / 2 - tSize / 2, 1, tSize, { style: color });
	}
	cv.shape([ball, ...tpl], { style: "#0095DD" });
	const intersect = caster.castRay(ball, angleDirection.rad);
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

const loop = (t = 0) => {
	cv.clear();
	cv3d.clear();
	cv3d.rect(0, 0, cv3d.width, cv3d.height / 2, { style: "#0162ec" });
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
	// renderer.render();

	tLast = t;
	requestAnimationFrame(loop);
};
const fps = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

requestAnimationFrame(loop);
