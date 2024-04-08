import { defaults } from "./default.js"
import { keymap } from "./keymap.js"
import { canvas, render } from "./render.js"
import { step, enqueue, addVecs, negVecs } from "./game.js"

let state = defaults

onkeydown = (ev) => {
	const {key, repeat} = ev  

	if (key == ' ')
		state = step (state)

	if (key in keymap && !repeat)
		state = enqueue (state, keymap [key])

	if (key == 'Backspace')
		state = {...state, queue: []}

	render (state)
}

export const pointerListener = ev => {
	const {target, button, x, y} = ev
	const {clientWidth, clientHeight} = target
	const {arena, queue, snake} = state
	const queueTip = addVecs (snake.segments [0], ...queue)
	const pointerVec = [
		x / clientWidth * arena [0],
		y / clientHeight * arena [1],
	]
	const deltaVec = addVecs (...negVecs (queueTip), pointerVec)
	const absDelta = deltaVec.map (x => Math.abs (x))
	
	const bigAxis = (absDelta [0] > absDelta [1]) ? 0 : 1
	const pos = deltaVec [bigAxis] > 0
	
	for (let counter = 0 - (!pos); counter < absDelta [bigAxis]; counter ++) {
		state = enqueue (state, bigAxis ? [0, pos ? 1 : -1] : [pos ? 1 : -1 ,0])
	}

	render (state)
}

canvas.onpointerdown = pointerListener

const loop = () => {
	state = step (state)
	render (state)

	if (state.snake.alive) setTimeout (loop, 1000/4)
}

loop ()