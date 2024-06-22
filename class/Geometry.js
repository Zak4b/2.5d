export class Point {
	x;
	y;
	constructor(x = 0, y = 0) {
		this.set(x, y);
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	set(x, y) {
		this.x = x;
		this.y = y;
	}
	/**
	 * @param {Point} point
	 * @returns {Point}
	 */
	static copy(point) {
		return new Point(point.x, point.y);
	}
	/**
	 * @param {Point} point
	 * @returns {Point}
	 */
	copy(point) {
		return this.set(point.x, point.y);
	}
	/**
	 * @param {Point} p1
	 * @param {Point} p2
	 * @returns {number}
	 */
	static distance(p1, p2) {
		return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
	}
	/**
	 * @param {Point} point
	 * @returns {number}
	 */
	distance(point) {
		return Point.distance(this, point);
	}
	/**
	 * @param {Point} point
	 * @param {number} k
	 * @returns {Point}
	 */
	static transpose(point, k) {
		return new Point(Math.floor(point.x * k), Math.floor(point.y * k));
	}
	/**
	 * @param {number} k
	 * @returns {Point}
	 */
	transpose(k) {
		return Point.transpose(this, k);
	}
	/**
	 * @param {Point} point
	 * @param {Vecteur} v
	 * @returns {Point}
	 */
	static translate(point, v) {
		return new Point(point.x + v.x, point.y + v.y);
	}
	/**
	 * @param {Vecteur} v
	 * @returns {Point}
	 */
	translate(v) {
		this.copy(Point.translate(this, v));
		return this;
	}
	/**
	 * @param {Point} point
	 * @param {Point} center
	 * @param {Angle} angle radian
	 * @returns {Point}
	 */
	static translateCirc(point, center, angle) {
		const { x, y } = point;
		const px = Math.cos(angle.rad) * (x - center.x) - Math.sin(angle.rad) * (y - center.y) + center.x;
		const py = Math.sin(angle.rad) * (x - center.x) + Math.cos(angle.rad) * (y - center.y) + center.y;

		return new Point(px, py);
	}
	/**
	 * @param {Point} center
	 * @param {Angle} angle radian
	 * @returns {Point}
	 */
	translateCirc(center, angle) {
		this.copy(Point.translateCirc(this, center, angle));
		return this;
	}
}

export class Vecteur {
	x;
	y;
	constructor(x = 0, y = 0) {
		this.set(x, y);
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 */
	set(x, y) {
		this.x = x;
		this.y = y;
	}
	/**
	 * @param {Vecteur} vecteur
	 * @returns {Vecteur}
	 */
	static copy(vecteur) {
		return new Vecteur(vecteur.x, vecteur.y);
	}
	/**
	 * @param {Vecteur} vecteur
	 * @returns {Vecteur}
	 */
	copy(vecteur) {
		this.set(vecteur.x, vecteur.y);
		return this;
	}
	/**
	 * @param {Point} p1
	 * @param {Point} p2
	 * @returns {Point}
	 */
	static fromPoints(p1, p2) {
		return new Vecteur(p2.x - p1.x, p2.y - p1.y);
	}
	/**
	 * @param {Angle} angle
	 * @returns {Vecteur}
	 */
	static fromAngle(angle) {
		return new Vecteur(Math.cos(angle.rad), Math.sin(angle.rad));
	}
	/**
	 * @param {Vecteur} v
	 * @returns {number}
	 */
	static norme(v) {
		return Math.sqrt(v.x ** 2 + v.y ** 2);
	}
	get norme() {
		return Vecteur.norme(this);
	}
	/**
	 * @param {Vecteur} v
	 * @returns {boolean}
	 */
	static isNull(v) {
		return v.x == 0 && v.y == 0;
	}
	get isNull() {
		return Vecteur.isNull(this);
	}
	/**
	 * @param {Vecteur} v
	 * @returns {Vecteur}
	 */
	static normalize(v) {
		const n = Vecteur.norme(v);
		return n ? new Vecteur(v.x / n, v.y / n) : v;
	}
	normalize() {
		this.copy(Vecteur.normalize(this));
		return this;
	}
	/**
	 * @param {Vecteur} v1
	 * @param {Vecteur} v2
	 * @returns {Vecteur}
	 */
	static add(v1, v2) {
		return new Vecteur(v1.x + v2.x, v1.y + v2.y);
	}
	/**
	 * @param {Vecteur} v
	 * @returns {Vecteur}
	 */
	add(v) {
		this.copy(Vecteur.add(this, v));
		return this;
	}
	/**
	 * @param {Vecteur} v
	 * @param {number} k
	 * @returns {Vecteur}
	 */
	static scal(v, k) {
		return new Vecteur(v.x * k, v.y * k);
	}
	/**
	 * @param {number} k
	 * @returns {Vecteur}
	 */
	scal(k) {
		this.copy(Vecteur.scal(this, k));
		return this;
	}
	/**
	 * @param {Vecteur} v1
	 * @param {Vecteur} v2
	 * @returns {number}
	 */
	static prodscal(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	}
	/**
	 * @param {Vecteur} v
	 * @returns {number}
	 */
	prodscal(v) {
		return Vecteur.prodscal(this, v);
	}

	get angle() {
		return new Angle(Math.atan2(this.y, this.x), true);
	}
}

export class Droite {
	#p1;
	#p2;
	#v;
	#m;
	#b;
	#f;
	#g;
	#fDefined;
	#gDefined;
	/**
	 * @param {Point} p1
	 * @param {Point} p2
	 */
	constructor(p1, p2) {
		p1 = Point.copy(p1);
		p2 = Point.copy(p2);
		this.#p1 = p1;
		this.#p2 = p2;
		this.#v = Vecteur.fromPoints(p1, p2);
		this.#v.x = Math.floor(this.#v.x * 100000) / 100000;
		this.#v.y = Math.floor(this.#v.y * 100000) / 100000;
		this.#v.normalize();
		this.#m = this.v.y / this.v.x;
		this.#b = p1.y - this.#m * p1.x;

		this.#fDefined = this.#m !== Infinity && this.#m !== -Infinity;
		this.#gDefined = this.#m !== 0;
		this.#f = this.fDefined ? (x) => this.#m * x + this.#b : (x) => undefined;
		this.#g = this.gDefined ? (this.fDefined ? (y) => (y - this.#b) / this.#m : (y) => p1.x) : (y) => undefined;
	}
	get p1() {
		return this.#p1;
	}
	get p2() {
		return this.#p2;
	}
	get v() {
		return this.#v;
	}

	get fDefined() {
		return this.#fDefined;
	}
	get f() {
		return this.#f;
	}
	get gDefined() {
		return this.#gDefined;
	}
	get g() {
		return this.#g;
	}
	get string() {
		return `${this.#m}x + ${this.#b}`;
	}
}

export class Angle {
	rad;
	constructor(value = 0, rad = false) {
		this.rad = (rad ? value : Angle.rad(value)) % (Math.PI * 2);
		if (this.rad < 0) this.rad += Math.PI * 2;
	}
	/**
	 * @param {number} rad
	 * @returns {number}
	 */
	static deg(rad) {
		return (rad * 180) / Math.PI;
	}
	/**
	 * @returns {number}
	 */
	get deg() {
		return Angle.deg(this.rad);
	}
	/**
	 * @param {number} deg
	 * @returns {number}
	 */
	static rad(deg) {
		return (deg * Math.PI) / 180;
	}
	/**
	 * @returns {number}
	 */
	get rad() {
		return this.rad;
	}
	/**
	 * @param {number} deg
	 * @returns {Angle}
	 */
	add(deg = 0) {
		return new Angle(this.deg + deg);
	}
	/**
	 * @param {Vecteur} v1
	 * @param {Vecteur} v2
	 * @returns
	 */
	static calc(v1, v2 = new Vecteur(1, 0)) {
		return new Angle(Math.acos(Vecteur.prodscal(v1, v2) / (Vecteur.norme(v1) * Vecteur.norme(v2))), true);
	}
}

export class Raycaster {
	constructor(mapLayout, cSize) {
		this.mapLayout = mapLayout;
		this.cellSize = cSize;
	}

	/**
	 *
	 * @param {Point} start
	 * @param {number} angle radian
	 * @returns {{intersect:Point, collide:Point|null}}
	 */
	castRay(start, angle) {
		const tanAngle = Math.tan(angle);

		const { x, y } = start;

		const stepX = Math.cos(angle) > 0 ? this.cellSize : -this.cellSize;
		const stepY = Math.sin(angle) > 0 ? this.cellSize : -this.cellSize;

		let nextVerticalX = Math.floor(x / this.cellSize) * this.cellSize + (stepX > 0 ? this.cellSize : 0);
		let nextVerticalY = y + (nextVerticalX - x) * tanAngle;
		let nextHorizontalY = Math.floor(y / this.cellSize) * this.cellSize + (stepY > 0 ? this.cellSize : 0);
		let nextHorizontalX = x + (nextHorizontalY - y) / tanAngle;

		let intersect = false;
		let currentCellX, currentCellY;
		while (!intersect) {
			if (Math.abs(nextVerticalX - x) < Math.abs(nextHorizontalX - x)) {
				currentCellX = Math.floor(nextVerticalX / this.cellSize) + (stepX < 0 ? -1 : 0);
				currentCellY = Math.floor(nextVerticalY / this.cellSize);
				if (!this.isWithinBounds(currentCellX, currentCellY) || this.mapLayout[currentCellY][currentCellX] === 1) {
					intersect = new Point(nextVerticalX, nextVerticalY);
				}
				nextVerticalX += stepX;
				nextVerticalY += stepX * tanAngle;
			} else {
				currentCellX = Math.floor(nextHorizontalX / this.cellSize);
				currentCellY = Math.floor(nextHorizontalY / this.cellSize) + (stepY < 0 ? -1 : 0);
				if (!this.isWithinBounds(currentCellX, currentCellY) || this.mapLayout[currentCellY][currentCellX] === 1) {
					intersect = new Point(nextHorizontalX, nextHorizontalY);
				}
				nextHorizontalX += stepY / tanAngle;
				nextHorizontalY += stepY;
			}
		}
		const collide = this.isWithinBounds(currentCellX, currentCellY) ? new Point(currentCellX, currentCellY) : null;
		return { intersect, collide };
	}
	/**
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	isWithinBounds(x, y) {
		return y >= 0 && y < this.mapLayout.length && x >= 0 && x < this.mapLayout[0].length;
	}
}
