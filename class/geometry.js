export class Point {
	x;
	y;
	constructor(x = 0, y = 0) {
		this.set(x, y);
	}
	set(x, y) {
		this.x = x;
		this.y = y;
	}

	static copy(point) {
		return new Point(point.x, point.y);
	}
	copy(point) {
		return this.set(point.x, point.y);
	}

	static distance(p1, p2) {
		return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
	}
	distance(point) {
		return Point.distance(this, point);
	}

	static transpose(point, k) {
		return new Point(Math.floor(point.x * k), Math.floor(point.y * k));
	}
	transpose(k) {
		return Point.transpose(this, k);
	}

	static translate(point, v) {
		return new Point(point.x + v.x, point.y + v.y);
	}
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
	set(x, y) {
		this.x = x;
		this.y = y;
	}

	static copy(vecteur) {
		return new Vecteur(vecteur.x, vecteur.y);
	}
	copy(vecteur) {
		return this.set(vecteur.x, vecteur.y);
	}

	static fromPoints(p1, p2) {
		return new Vecteur(p2.x - p1.x, p2.y - p1.y);
	}
	static fromAngle(angle) {
		return new Vecteur(Math.cos(angle.rad), Math.sin(angle.rad));
	}

	static norme(v) {
		return Math.sqrt(v.x ** 2 + v.y ** 2);
	}
	get norme() {
		return Vecteur.norme(this);
	}

	static isNull(v) {
		return v.x == 0 && v.y == 0;
	}
	get isNull() {
		return Vecteur.isNull(this);
	}

	static normalize(v) {
		const n = Vecteur.norme(v);
		return n ? new Vecteur(v.x / n, v.y / n) : v;
	}
	normalize() {
		this.copy(Vecteur.normalize(this));
		return this;
	}
	static add(v1, v2) {
		return new Vecteur(v1.x + v2.x, v1.y + v2.y);
	}
	add(v) {
		this.copy(Vecteur.add(this, v));
		return this;
	}

	static scal(v, k) {
		return new Vecteur(v.x * k, v.y * k);
	}
	scal(k) {
		this.copy(Vecteur.scal(this, k));
		return this;
	}

	static prodscal(v1, v2) {
		return v1.x * v2.x + v1.y * v2.y;
	}
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

	intersect(cSize, xMin, yMin, xMax, yMax, collide = () => false) {
		const distance = 15;
		// Direction x et y
		const dx = this.v.x > 0 ? 1 : -1;
		const dy = this.v.y > 0 ? 1 : -1;
		let origin = Point.copy(this.p1);

		//console.groupCollapsed();
		//console.log("D ", this.v.angle.deg);
		//console.log(this);
		//console.log("dx", dx, "dy", dy);
		for (let i = 1; i < distance; i++) {
			const relativeOrigin = origin.transpose(1 / cSize);
			// Prochains x et y intersect
			const x0 = cSize * (relativeOrigin.x + (dx + 1) / 2);
			const y0 = cSize * (relativeOrigin.y + (dy + 1) / 2);
			// Coords intersect
			const interX = new Point(x0, this.f(x0));
			const interY = new Point(this.g(y0), y0);
			const pts = [];
			if (this.fDefined) {
				// Collide interX
				const relativeInterXi = interX.transpose(1 / cSize);
				relativeInterXi.x -= dx < 0 ? 1 : 0;
				pts.push({ type: "interX", point: interX, relativePoint: relativeInterXi });
			}
			if (this.gDefined) {
				// Collide interY
				const relativeInterYi = interY.transpose(1 / cSize);
				relativeInterYi.y -= dy < 0 ? 1 : 0;
				pts.push({ type: "interY", point: interY, relativePoint: relativeInterYi });
			}

			if (this.fDefined && this.gDefined) {
				const vv = Vecteur.fromPoints(interX, interY);
				const kx = Math.floor(Math.abs(vv.x) / cSize); // Nombre d'intersect x entre p1 et p2
				const ky = Math.floor(Math.abs(vv.y) / cSize); // Nombre d'intersect y entre p1 et p2
				for (let j = 1; j <= kx; j++) {
					const xi = x0 + j * cSize * dx;
					console.log(xi);
					const interXi = new Point(xi, this.f(xi));
					const relativeInterXi = interXi.transpose(1 / cSize);
					relativeInterXi.x -= dx < 0 ? 1 : 0;
					pts.push({ type: "interX", point: interXi, relativePoint: relativeInterXi });
				}
				for (let j = 1; j <= ky; j++) {
					const yi = y0 + j * cSize * dy;
					const interYi = new Point(this.g(yi), yi);
					const relativeInterYi = interYi.transpose(1 / cSize);
					relativeInterYi.y -= dy < 0 ? 1 : 0;
					pts.push({ type: "interY", point: interYi, relativePoint: relativeInterYi });
				}
			}
			const result = pts
				.map((e) => {
					e.distance = e.point.distance(origin);
					return e;
				})
				.sort((a, b) => a.distance - b.distance);
			//console.log("O= ", origin);
			//console.log("S= ", result);
			for (const elem of result) {
				if (elem.point.x <= xMin || elem.point.y <= yMin || elem.point.x >= xMax || elem.point.y >= yMax || collide(elem)) {
					//console.log(elem);
					//console.groupEnd();
					if (i > 5) console.warn(i);
					return elem.point;
				}
			}
			/*
			if (!this.fDefined) {
				result = result.filter((elem) => {
					elem.type != "interX";
				});
			}
			if (!this.gDefined) {
				result = result.filter((elem) => {
					elem.type != "interY";
				});
			}
			*/
			(this.v.angle.deg == -90 || this.v.angle.deg == 180) && console.log(result);
			origin = Point.copy(result[result.length - 1].point);
		}
		//console.log("Pas de soluce");
		//console.groupEnd();
		console.error(distance);
		return;
	}
}

export class Angle {
	rad;
	constructor(value = 0, rad = false) {
		this.rad = rad ? value : Angle.rad(value);
	}

	static deg(rad) {
		return (rad * 180) / Math.PI;
	}
	get deg() {
		return Angle.deg(this.rad);
	}

	static rad(deg) {
		return (deg * Math.PI) / 180;
	}
	get rad() {
		return this.rad;
	}

	add(deg = 0) {
		return new Angle(this.deg + deg);
	}

	static calc(v1, v2 = new Vecteur(1, 0)) {
		return new Angle(Math.acos(Vecteur.prodscal(v1, v2) / (Vecteur.norme(v1) * Vecteur.norme(v2))), true);
	}
}

export class Raycaster {
	constructor(mapLayout, cSize) {
		this.mapLayout = mapLayout;
		this.cellSize = cSize;
	}

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

	isWithinBounds(x, y) {
		return y >= 0 && y < this.mapLayout.length && x >= 0 && x < this.mapLayout[0].length;
	}
}
