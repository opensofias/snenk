import { defaults } from "./defaults.js"
import { canvas, render } from "./render.js"
import { step } from "./game.js"
import {} from "https://opensofias.github.io/dimekit/dimekit.js"
import {} from "https://opensofias.github.io/dimekit/vectorOps.js"
import { handleKey, handlePointer, handleGamepad, pollGamepad } from "./inputs.js"
import { applyActions } from "./actions.js"

let gameState = {...defaults, gamepadCursorOffset: null}

const loop = () => {
	if (gameState.pause) return;

	gameState = step (gameState)
	render (gameState)

	if (gameState.snake.alive) setTimeout (loop, 1000/4)
}

onkeydown = (event) => {
	const actions = handleKey(gameState, event)

	if (actions.length) {
		gameState = applyActions(gameState, loop, actions)
		render(gameState)
	}
}

canvas.onpointerdown = (event) => {
	gameState = handlePointer (gameState, event)
	render (gameState)
}

canvas.ondblclick = () => {
	gameState = applyActions (gameState, loop, ['pause'])
}

// Curried self-calling rAF loop
const gamepadLoop = (gamepadState = {buttons: [], axes: []}) => () => {
	const gamepad = navigator.getGamepads()[0]

	if (gamepad) {
		let oldGamepadState = gamepadState
		gamepadState = pollGamepad (gamepad)

		const actions = handleGamepad (gamepadState, oldGamepadState)
		
		// Update cursor offset based on right stick
		const {rStick} = gamepadState
		if (rStick.eq([0, 0])) {
			gameState = {...gameState, gamepadCursorOffset: null}
		} else {
			gameState = {...gameState, gamepadCursorOffset: rStick}
		}
	
		// Only render if state actually changed or cursor moved
		if (actions.length || !rStick.eq(oldGamepadState.rStick || [0, 0])) {
			gameState = applyActions (gameState, loop, actions)
			render (gameState)
		}
	}
	
	requestAnimationFrame(gamepadLoop(gamepadState))
}
gamepadLoop ()()

loop ()