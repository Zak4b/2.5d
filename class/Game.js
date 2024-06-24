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
		return this.#fov;
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
	get(x, y) {
		return this.layout[y]?.[x] ?? 1;
	}
	parse() {
		const parseMap = [];
		for (let y = 0; y < this.#dimY; y++) {
			for (let x = 0; x < this.#dimX; x++) {
				const value = this.layout[y][x];
				if (value != 0 && value != 1) {
					if (!parseMap[value]) parseMap[value] = [];
					parseMap[value].push([x, y]);
				}
			}
		}
		return parseMap;
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

	/** @type {CanvasInterface} */
	window;
	windowContext;
	#windowWidth;
	#windowHeight;
	wallTexture;
	#distanceToProjectionPlane;

	player;
	#transposeCoef;
	/** @type {Point[]} */
	#entities = [];
	map;
	#cellSize = 64;
	raycaster;

	/** @type {boolean[]} */
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
		window.oncontextmenu = (e) => e.preventDefault();

		const map = params.map;
		this.map = new GameMap(map.layout);
		const parseMap = this.map.parse();
		for (const entityType in parseMap) {
			parseMap[entityType].forEach((e) => this.#entities.push(new Point((e[0] + 0.5) * this.#cellSize, (e[1] + 0.5) * this.#cellSize)));
		}
		const player = params.player;
		this.player = new Player(player?.x, player?.y, player?.facing);
		this.player.speed *= this.#cellSize / 100;
		this.#transposeCoef = 1 / this.#cellSize;
		this.fps = new fpsMeter();

		this.loadImages();

		this.raycaster = new Raycaster(this.map.layout, this.#cellSize);
		document.addEventListener("keydown", (e) => (this.#keyState[e.code] = true), { passive: true });
		document.addEventListener("keyup", (e) => (this.#keyState[e.code] = false), { passive: true });

		this.updateWindowSize();
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
		this.#distanceToProjectionPlane = this.#windowWidth / (2 * Math.tan(this.player.fov.rad / 2));
	}

	loadImages() {
		CanvasInterface.loadImage("media/wall.png").then((image) => {
			this.wallTexture = image;
		});
		CanvasInterface.loadImage("media/treasure.png").then((image) => {
			CanvasInterface.chromaKey(image, "00FFFF");
			this.treasure = image;
		});
		CanvasInterface.loadImage("media/shotgun-1.png").then((image) => {
			CanvasInterface.chromaKey(image, "00FFFF");
			this.weap = image;
		});
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
			if (this.map.get(cell.x + 1, cell.y) === 1 && offsetX > cSize - minDistance) {
				next.x -= offsetX - (cSize - minDistance);
			}
		} else {
			if (this.map.get(cell.x - 1, cell.y) === 1 && offsetX < minDistance) {
				next.x += minDistance - offsetX;
			}
		}
		if (mov.y > 0) {
			if (this.map.get(cell.x, cell.y + 1) === 1 && offsetY > cSize - minDistance) {
				next.y -= offsetY - (cSize - minDistance);
			}
		} else {
			if (this.map.get(cell.x, cell.y - 1) === 1 && offsetY < minDistance) {
				next.y += minDistance - offsetY;
			}
		}

		this.player.pos.copy(next);
	}

	segmentSize(distance) {
		return (this.#cellSize / distance) * this.#distanceToProjectionPlane;
	}
	/**
	 * @param {Point} point
	 * @param {number} rayAngle radian
	 * @returns
	 */
	correctedDistance(point, rayAngle) {
		return this.player.pos.distance(point) * Math.cos(rayAngle - this.player.facing.rad);
	}

	drawBackground() {
		this.window.rect(0, 0, this.window.width, this.window.height / 2, { style: "#1b237a" });
		this.window.rect(0, this.window.height / 2, this.window.width, this.window.height / 2, { style: "#555555" });
	}
	drawWalls() {
		if (!this.wallTexture) return;
		const rayCount = this.#windowWidth;
		const ang = new Angle(this.player.fov.rad / (rayCount + -1), true);
		for (let i = 0; i < rayCount; i++) {
			const rayAngle = this.player.facing.rad - this.player.fov.rad / 2 + ang.rad * i;
			const { intersect, collide } = this.raycaster.castRay(this.player.pos, rayAngle);
			const distance = this.correctedDistance(intersect, rayAngle);
			const segmentSize = this.segmentSize(distance);
			collide ? this.map.get(collide.x, collide.y) : null;

			const sx = Math.floor((((intersect.x % this.#cellSize) + (intersect.y % this.#cellSize)) * this.wallTexture.width) / this.#cellSize);
			this.windowContext.drawImage(this.wallTexture, sx, 0, 1, this.wallTexture.height, i, (this.#windowHeight - segmentSize) / 2, 1, segmentSize);
		}
	}
	drawSprites() {
		const step = new Angle(this.player.fov.rad / (this.#windowWidth + -1), true).rad;
		const FOV_LEFT = this.player.facing.rad - this.player.fov.rad / 2;
		const FOV_RIGHT = FOV_LEFT + this.player.fov.rad;
		for (const entity of this.#entities) {
			const angleToEntity = Vecteur.fromPoints(this.player.pos, entity).angle.rad;
			const distanceToEntity = this.correctedDistance(entity, angleToEntity);
			const segmentSize = this.segmentSize(distanceToEntity);
			const floorLevel = (this.#windowHeight + segmentSize) / 2;

			if (FOV_LEFT < angleToEntity && angleToEntity < FOV_RIGHT) {
				const { intersect } = this.raycaster.castRay(this.player.pos, angleToEntity);
				if (this.player.pos.distance(intersect) > distanceToEntity) {
					const x = Math.floor((angleToEntity - FOV_LEFT) / step);
					this.windowContext.drawImage(this.treasure, x - segmentSize / 3 / 2, floorLevel - segmentSize / 3, segmentSize / 3, (segmentSize / 3 / this.treasure.width) * this.treasure.height);
				}
			}
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
		this.drawSprites();
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
