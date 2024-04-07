import { defaults } from "./default.js"
import { keymap } from "./keymap.js"
import { render } from "./render.js"
import { step, enqueue } from "./game.js"

let state = defaults

onkeydown = (ev) => {
	const {key, repeat} = ev  

	if (key == ' ') {
		state = step (state)
		render (state)
	}

	if (key in keymap && !repeat)
		state = enqueue (state, keymap [key])
}

const loop = () => {
	state = step (state)
	render (state)

	if (state.snake.alive) setTimeout (loop, 1000/4)
}

loop ()