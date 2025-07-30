import {} from "https://opensofias.github.io/dimekit/dimekit.js"
import {} from "https://opensofias.github.io/dimekit/vectorOps.js"
import { getInitialState } from "./defaults.js"
import { render, canvas } from "./render.js"
import { step } from "./game.js"
import { startInputListeners } from "./inputs.js"

let gameState = getInitialState()
let loopTimeout = null

const loop = () => {
	if (gameState.pause) return

	gameState = step(gameState)
	render(gameState)

	if (gameState.snake.alive) {
		loopTimeout = setTimeout(loop, gameState.stepTime)
	}
}

const startLoop = () => {
	if (loopTimeout) clearTimeout(loopTimeout)
	loop()
}

const stopLoop = () => {
	if (loopTimeout) {
		clearTimeout(loopTimeout)
		loopTimeout = null
	}
}

export const game = {
	get state() {
		return gameState
	},
	
	set state(newState) {
		const wasPaused = gameState.pause
		gameState = newState
		
		// Handle pause state changes
		if (wasPaused !== gameState.pause) {
			if (gameState.pause) {
				stopLoop()
			} else {
				startLoop()
			}
		}
		
		render(gameState)
	},
	
	setState(newState) {
		this.state = newState
	}
}

startInputListeners()
startLoop()