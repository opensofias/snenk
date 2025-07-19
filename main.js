import { defaults } from "./defaults.js"
import { keyMap } from "./keyMap.js"
import { canvas, render } from "./render.js"
import { step, enqueue } from "./game.js"
import {} from "https://opensofias.github.io/dimekit/dimekit.js"
import {} from "https://opensofias.github.io/dimekit/vectorOps.js"

let state = defaults

onkeydown = ({key, repeat: keyRepeat, ctrlKey, shiftKey}) => {

	const boost = shiftKey ? 4 : 1

	if (key == ' ')
		for ({} of ctrlKey ? state.queue : boost)
			state = step (state)

	if (key in keyMap && !keyRepeat)
		for ({} of boost) state = enqueue (state, keyMap [key])

	if (key == 'Backspace')
		state = {...state, queue: ctrlKey ? [] : state.queue.slice (0, -boost)}

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
	target: {clientWidth, clientHeight}, button, offsetX, offsetY
}) => {
	const {arena, queue, snake} = state
	const queueTip = snake.segments [0].add (...queue)
	const pointerVec = [
		offsetX / clientWidth * arena [0],
		offsetY / clientHeight * arena [1],
	].map (Math.floor)
	const deltaVec = pointerVec.add (queueTip.sclMul (-1))
	const absDelta = deltaVec.map (Math.abs)
	
	const axis = ((absDelta [0] < absDelta [1]) + (button == 1)) % 2 // middle mouse button means choosing the smaller axis
	const positive = deltaVec [axis] > 0
	
	for ({} of absDelta [axis])
		state = enqueue (state, axis ? [0, positive ? 1 : -1] : [positive ? 1 : -1 ,0])

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