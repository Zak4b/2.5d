export class fpsMeter {
	#value = 0;
	#time;
	#stack = 0;
	#count = 0;
	constructor(time = 500) {
		this.#time = time;
	}
	get value() {
		return this.#value;
	}

	push(e) {
		this.#stack += e;
		this.#count++;
		if (this.#stack >= this.#time) {
			this.#value = Math.round(1 / (this.#stack / this.#count / 1000));
			this.#stack = 0;
			this.#count = 0;
		}
	}
}
