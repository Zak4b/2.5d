export class CanvasInterface {
	#element;
	#ctx;
	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		this.#element = canvas;
		this.#ctx = canvas.getContext("2d");
	}

	get element() {
		return this.#element;
	}
	get width() {
		return this.element.width;
	}
	get height() {
		return this.element.height;
	}

	options(options = {}) {
		this.#ctx.fillStyle = options?.style ?? "#0095DD";
		this.#ctx.strokeStyle = this.#ctx.fillStyle;
		this.#ctx.lineWidth = options?.width ?? 3;
		this.#ctx.font = "16px Arial";
	}

	clear() {
		this.#ctx.clearRect(0, 0, this.#element.width, this.#element.height);
	}
	grid = (cSize) => {
		const nX = Math.floor(this.width / cSize);
		const nY = Math.floor(this.height / cSize);
		for (let i = 0; i <= nX; i++) {
			this.line({ x: i * cSize, y: 0 }, { x: i * cSize, y: this.height });
		}
		for (let i = 0; i <= nY; i++) {
			this.line({ x: 0, y: i * cSize }, { x: this.width, y: i * cSize });
		}
	};

	ball(point, options = null) {
		options && this.options(options);
		const radius = options?.radius ?? 10;

		this.#ctx.beginPath();
		this.#ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
		this.#ctx.fill();
		this.#ctx.closePath();
	}

	line(p1, p2, options = null) {
		options && this.options(options);

		this.#ctx.beginPath();
		this.#ctx.moveTo(p1.x, p1.y);
		this.#ctx.lineTo(p2.x, p2.y);
		this.#ctx.stroke();
		this.#ctx.closePath();
	}

	lineX(x, options = null) {
		options && this.options(options);
		this.line({ x, y: 0 }, { x, y: this.height });
	}

	lineY(y, options = null) {
		options && this.options(options);
		this.line({ x: 0, y }, { x: this.width, y });
	}

	shape(pts, options = null) {
		options && this.options(options);
		this.#ctx.beginPath();
		const first = pts.shift();
		this.#ctx.moveTo(first.x, first.y);
		pts.forEach((p) => this.#ctx.lineTo(p.x, p.y));
		this.#ctx.lineTo(first.x, first.y);
		this.#ctx.fill();
		this.#ctx.closePath();
	}

	rect(x, y, w, h, options = null) {
		options && this.options(options);

		this.#ctx.fillRect(x, y, w, h);
	}

	text(string, x, y, options = null) {
		options && this.options(options);
		this.#ctx.fillText(string, x, y);
	}
	textGroup(strings, x, y, options = null) {
		options && this.options(options);
		for (let i = 0; i < strings.length; i++) {
			this.text(strings[i], x, y + 20 * i);
		}
	}
}
export class CanvasRenderer {
	#element;
	#interface;
	#ctx;
	/**
	 * @param {HTMLCanvasElement} canvas
	 */
	constructor(canvas) {
		this.#element = canvas;
		const ic = document.createElement("canvas");
		ic.width = 1200;
		ic.height = 800;
		this.#interface = new CanvasInterface(ic);
		this.#ctx = canvas.getContext("2d");

		window.addEventListener("resize", (e) => {
			this.resize();
		});
		this.resize();
		document.querySelector("body").append(ic);
	}
	get interface() {
		return this.#interface;
	}
	resize() {
		this.#element.width = window.innerWidth - 5;
		this.#element.height = window.innerHeight - 5;
	}

	render() {
		const newCanvas = this.#element,
			original = this.#interface.element;

		newCanvas.getContext("2d").drawImage(original, 0, 0, newCanvas.width, newCanvas.height);
	}
}
