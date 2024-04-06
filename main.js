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
}

const loop = () => {
	state = step (state)
	render (state)

	setTimeout (loop, 1000/4)
}

loop ()