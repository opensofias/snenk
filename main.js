import { defaults } from "./defaults.js"
import { keymap } from "./keymap.js"
import { canvas, render } from "./render.js"
import { step, enqueue, addVecs, negVecs } from "./game.js"
import {} from "https://opensofias.github.io/dimekit/dimekit.js"

let state = defaults

onkeydown = ({key, repeat: keyRepeat, ctrlKey, shiftKey}) => {

	const repeat = shiftKey ? 4 : 1

	if (key == ' ')
		for ({} of ctrlKey ? state.queue : repeat)
			state = step (state)

	if (key in keymap && !keyRepeat)
		for ({} of repeat) state = enqueue (state, keymap [key])

	if (key == 'Backspace')
		state = {...state, queue: ctrlKey ? [] : state.queue.slice (0, -repeat)}

	if (key == 'Enter') {
		if (!state.snake.alive) {
			state = defaults
			loop ()
		} else {
			const {pause} = state
			state.pause = !pause
			if (pause) loop ()
		}
	}

	render (state)
}

export const pointerListener = ({
	target: {clientWidth, clientHeight}, button, x, y
}) => {
	const {arena, queue, snake} = state
	const queueTip = addVecs (snake.segments [0], ...queue)
	const pointerVec = [
		x / clientWidth * arena [0],
		y / clientHeight * arena [1],
	]
	const deltaVec = addVecs (...negVecs (queueTip), pointerVec)
	const absDelta = deltaVec.map (x => Math.abs (x))
	
	const axis = ((absDelta [0] < absDelta [1]) + (button == 1)) % 2 // middle mouse button means choosing the smaller axis
	const positive = deltaVec [axis] > 0
	
	for (let counter = 0 - (!positive); counter < absDelta [axis]; counter ++) {
		state = enqueue (state, axis ? [0, positive ? 1 : -1] : [positive ? 1 : -1 ,0])
	}

	render (state)
}

canvas.onpointerdown = pointerListener

const loop = () => {
	if (state.pause) return;

	state = step (state)
	render (state)

	if (state.snake.alive) setTimeout (loop, 1000/4)
}

loop ()