import { step, enqueue } from "./game.js"
import { defaults } from "./defaults.js"

export const boostableActions = new Set(['step', 'fullQueue', 'dequeue', 'clearQueue'])

export const applyActions = (state, loop, actions) => {
	let newState = state

	actions.forEach((action) => {
		if (Array.isArray(action)) {
			// Direction vector - always boostable via enqueue
			newState = enqueue(newState, action)
		} else {
			// String action
			switch (action) {
				case 'step':
					newState = step(newState)
					break
				case 'fullQueue':
					// Step through entire queue
					for ({} of newState.queue)
						newState = step(newState)
					break
				case 'dequeue':
					newState = {
						...newState, 
						queue: newState.queue.slice(0, -1)
					}
					break
				case 'clearQueue':
					newState = {...newState, queue: []}
					break
				case 'pause':
					if (!newState.snake.alive) {
						newState = defaults
						loop()
					} else {
						const {pause} = newState
						newState.pause = !pause
						if (pause) loop()
					}
					break
				case 'restartGame':
					newState = defaults
					loop()
					break
			}
		}
	})

	return newState
}