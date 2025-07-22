import { defaults } from "./defaults.js"
import { keyMap } from "./keyMap.js"
import { canvas, render } from "./render.js"
import { step, enqueue } from "./game.js"
import {} from "https://opensofias.github.io/dimekit/dimekit.js"
import {} from "https://opensofias.github.io/dimekit/vectorOps.js"
import { handleKey, handlePointer, handleGamepad } from "./inputs.js"

let state = defaults

const loop = () => {
	if (state.pause) return;

	state = step (state)
	render (state)

	if (state.snake.alive) setTimeout (loop, 1000/4)
}

onkeydown = (event) => {
	state = handleKey (state, loop, event)
	render (state)
}

canvas.onpointerdown = (event) => {
	state = handlePointer (state, event)
	render (state)
}

// Curried self-calling rAF loop
const gamepadLoop = (gamepadState = {buttons: [], axes: []}) => () => {
	const gamepad = navigator.getGamepads()[0]

	if (gamepad) {
		const result = handleGamepad(state, loop, gamepad, gamepadState)
	
		// Only render if state actually changed
		if (state !== result.state) {
			state = result.state
			render(state)
		}

		gamepadState = result.gamepadState
	}
	
	requestAnimationFrame(gamepadLoop(gamepadState))
}
gamepadLoop ()()

loop ()