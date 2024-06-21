import { Angle, Point, Vecteur, Raycaster } from "./Geometry.js";
import { CanvasInterface } from "./Canvas.js";
import { fpsMeter } from "./FpsMeter.js";

export class Player {
	#pos;
	#facingDirection;
	#fov;
	speed = 350;
	constructor(x, y, facing, fov = 75) {
		this.#pos = new Point((x + 0.5) * 64, (y + 0.5) * 64);
		this.#facingDirection = new Angle(facing);
		this.#fov = new Angle(fov);
	}
	set(data) {
		const { x, y, facing } = data;
		x && (this.#pos.x = x);
		y && (this.#pos.y = y);
		facing && (this.#facingDirection = facing);
	}
	get pos() {
		return this.#pos;
	}
	get facing() {
		return this.#facingDirection;
	}
	set facing(value) {
		this.#facingDirection = value;
	}
	get fov() {
		return this.#fov.rad;
	}
}

export class GameMap {
	layout;
	#dimX;
	#dimY;

	#cellSize = 12;
	canvas;
	canvasContext;
	#mapColors = { 0: "#DDDDDD", 1: "#222222" };
	/**
	 *
	 * @param {number[][]} layout
	 * @param {*} params
	 */
	constructor(layout, params) {
		this.layout = layout;
		this.#checkMap();
		this.canvas = new CanvasInterface({ width: this.#cellSize * this.#dimX, height: this.#cellSize * this.#dimY });
		this.canvasContext = this.canvas.element.getContext("2d");
		this.draw();
	}
	#checkMap() {
		const l = new Set();
		const dimY = this.layout.length;
		for (let i = 0; i < dimY; i++) {
			l.add(this.layout[i].length);
		}
		if (l.size == 1) {
			const [dimX] = l;
			this.#dimX = dimX;
			this.#dimY = dimY;
		} else {
			throw new Error("Invalid map");
		}
	}
	drawRect(x, y, options) {
		this.canvas.rect(x * this.#cellSize, y * this.#cellSize, this.#cellSize, this.#cellSize, options);
	}
	drawLayout() {
		for (let i = 0; i < this.#dimY; i++) {
			const row = this.layout[i];
			let style;
			for (let j = 0; j < row.length; j++) {
				style = this.#mapColors[this.layout[i][j]];
				this.drawRect(j, i, { style });
			}
		}
	}
	drawGrid() {
		this.canvas.options({ style: "black", width: 1 });
		this.canvas.grid(this.#cellSize);
	}
	draw(playerCoords = null) {
		this.canvas.clear();
		this.drawLayout();
		//this.drawGrid();

		playerCoords && this.drawRect(playerCoords.x, playerCoords.y, { style: "red" });
		return this.canvas.element;
	}
}

export class Game3D {
	#tLast = 0;

	window;
	windowContext;
	#windowWidth;
	#windowHeight;
	wallTexture = new Image();

	player;
	#transposeCoef;
	#entities = [];
	map;
	#cellSize = 64;
	raycaster;

	#keyState = [];
	#keyMap = { up: "KeyW", left: "KeyA", down: "KeyS", right: "KeyD" };
	fps;

	/**
	 *
	 * @param {{map:{layout: number[][]}, player:{x:number, y:number, facing: number}}} params
	 */
	constructor(params) {
		this.window = new CanvasInterface(document.getElementById("zqsd"));
		this.windowContext = this.window.element.getContext("2d");
		this.updateWindowSize();
		window.oncontextmenu = (e) => e.preventDefault();

		const map = params.map;
		this.map = new GameMap(map.layout);
		const player = params.player;
		this.player = new Player(player?.x, player?.y, player?.facing);
		this.player.speed *= this.#cellSize / 100;
		this.#transposeCoef = 1 / this.#cellSize;
		this.fps = new fpsMeter();
		CanvasInterface.loadImage("media/wall.png").then((image) => {
			this.wallTexture = image;
		});

		this.raycaster = new Raycaster(this.map.layout, this.#cellSize);
		document.addEventListener("keydown", (e) => (this.#keyState[e.code] = true), { passive: true });
		document.addEventListener("keyup", (e) => (this.#keyState[e.code] = false), { passive: true });

		requestAnimationFrame(this.update.bind(this));
	}
	get player() {
		return this.player;
	}
	updateWindowSize() {
		this.#windowWidth = window.innerWidth;
		this.#windowHeight = window.innerHeight;
		this.window.element.width = this.#windowWidth;
		this.window.element.height = this.#windowHeight;
	}

	key(string) {
		return this.#keyState[this.#keyMap[string]];
	}

	inputProcess(t) {
		if (this.key("left")) this.player.facing = this.player.facing.add((-180 * t) / 1000);
		if (this.key("right")) this.player.facing = this.player.facing.add((180 * t) / 1000);

		if (this.key("up") || this.key("down")) {
			this.movePlayer(t);
		}
	}

	movePlayer(t) {
		// v = d/t d = vxt
		const d = this.player.speed * (t / 1000);
		const cSize = this.#cellSize;
		const mapLayout = this.map.layout;

		const mov = Vecteur.fromAngle(this.player.facing).scal(d);
		this.key("down") && mov.scal(-1);

		const next = Point.translate(this.player.pos, mov);
		const cell = next.transpose(this.#transposeCoef);
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

		this.player.pos.copy(next);
	}

	drawBackground() {
		this.window.rect(0, 0, this.window.width, this.window.height / 2, { style: "#1b237a" });
		this.window.rect(0, this.window.height / 2, this.window.width, this.window.height / 2, { style: "#555555" });
	}
	drawWalls() {
		const rayCount = this.#windowWidth;
		const ang = new Angle(this.player.fov / (rayCount + -1), true);
		const halfHeight = this.#windowHeight / 2;
		const coef = this.#windowWidth / (2 * Math.tan(this.player.fov / 2));

		for (let i = 0; i < rayCount; i++) {
			const rayAngle = this.player.facing.rad - this.player.fov / 2 + ang.rad * i;
			const { intersect, collide } = this.raycaster.castRay(this.player.pos, rayAngle);
			const distance = this.player.pos.distance(intersect) * Math.cos(rayAngle - this.player.facing.rad);
			const segmentSize = (this.#cellSize / distance) * coef;
			collide ? this.map.layout[collide.y][collide.x] : null;

			const sx = Math.floor((((intersect.x % this.#cellSize) + (intersect.y % this.#cellSize)) * this.wallTexture.width) / this.#cellSize);
			this.windowContext.drawImage(this.wallTexture, sx, 0, 1, this.wallTexture.height, i, halfHeight - segmentSize / 2, 1, segmentSize);
		}
	}
	drawMiniMap() {
		this.windowContext.drawImage(this.map.draw(Point.transpose(this.player.pos, this.#transposeCoef)), 0, 0);
	}

	update(t = 0) {
		const time = t - this.#tLast;
		this.window.clear();

		this.inputProcess(time);

		this.drawBackground();
		this.drawWalls();
		this.drawMiniMap();

		const cell = this.player.pos.transpose(this.#transposeCoef);
		this.fps.push(time);
		this.window.textGroup(["θ : " + Math.floor(this.player.facing.deg), `Position: (${cell.x}, ${cell.y})`, this.fps.value], this.#windowWidth - 150, 20, {
			style: "#FFFFFF",
		});
		this.#tLast = t;
		requestAnimationFrame(this.update.bind(this));
	}
}
