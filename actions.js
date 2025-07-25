import { step, enqueue } from "./game.js"
import { defaults } from "./defaults.js"
import { majorAxis, minorAxis } from "./vectorUtils.js"

export const boostableActions = new Set(['step', 'fullQueue', 'dequeue', 'clearQueue', 'enqueueRightStickMajor', 'enqueueRightStickMinor'])

export const applyActions = (state, actions) => {
	let newState = state

	actions.forEach ((action) => {
		if (Array.isArray (action)) {
			// Direction vector
			newState = enqueue (newState, action)
		} else {
			// String action
			switch (action) {
				case 'step':
					newState = step (newState)
					break
				case 'fullQueue':
					// Step snake through entire queue
					for ({} of newState.queue)
						newState = step (newState)
					break
				case 'dequeue':
					newState = {
						...newState, 
						queue: newState.queue.slice (0, -1)
					}
					break
				case 'clearQueue':
					newState = {...newState, queue: []}
					break
				case 'enqueueRightStickMajor':
					newState = enqueueRightStickAxis (newState, true)
					break
				case 'enqueueRightStickMinor':
					newState = enqueueRightStickAxis (newState, false)
					break
				case 'pause':
					if (!newState.snake.alive) {
						newState = defaults
					} else {
						const {pause} = newState
						newState = {...newState, pause: !pause}
					}
					break
				case 'restartGame':
					newState = defaults
					break
			}
		}
	})

	return newState
}

const enqueueRightStickAxis = (state, useMajorAxis) => {
	const {gamepadCursorOffset} = state
	
	if (!gamepadCursorOffset) return state
	
	const targetVector = useMajorAxis ? 
		majorAxis (gamepadCursorOffset) : 
		minorAxis (gamepadCursorOffset)
	
	return enqueue (state, targetVector)
}