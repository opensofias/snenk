import { defaults } from "./default.js"
import { keymap } from "./keymap.js"
import { render } from "./render.js"
import { step, face } from "./game.js"

let state = defaults

onkeydown = (ev) => {
	const {key} = ev  

	if (key == ' ') {
		state = step (state)
		render (state)
	}

	if (key in keymap)
		state = face (state, keymap [key])

	console.log (state)
}



export const addVecs = (...vectors) =>
	vectors.reduce (
		(prev, cur) => prev.map ((val, idx) => val + cur[idx])
		,
		new Int8Array (Math.max(...vectors.map(x => x.length)))
	)


const negVecs = (...vectors) => vectors.map (x => x.map (x = 0 - x))


export const vecEq = (vec1, vec2) =>
	vec1.length == vec2.length &&
	vec1.every ((val, idx) => val == vec2 [idx])

const loop = () => {
	state = step (state)
	render (state)

	setTimeout (loop, 1000/4)
}

loop ()