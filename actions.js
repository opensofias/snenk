import { step, enqueue } from "./game.js"
import { defaults } from "./defaults.js"

export const boostableActions = new Set(['step', 'fullQueue', 'dequeue', 'clearQueue', 'enqueueRightStickMajor', 'enqueueRightStickMinor'])

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
				case 'enqueueRightStickMajor':
					newState = enqueueRightStickAxis(newState, true)
					break
				case 'enqueueRightStickMinor':
					newState = enqueueRightStickAxis(newState, false)
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

const enqueueRightStickAxis = (state, useMajorAxis) => {
	const {gamepadCursorOffset} = state
	
	if (!gamepadCursorOffset) return state
	
	const absDelta = gamepadCursorOffset.map(Math.abs)
	const majorAxis = absDelta[0] >= absDelta[1] ? 0 : 1
	const targetAxis = useMajorAxis ? majorAxis : (1 - majorAxis)
	
	const deltaValue = gamepadCursorOffset[targetAxis]
	if (deltaValue === 0) return state
	
	const positive = deltaValue > 0
	const unitVector = targetAxis === 0 ? 
		[positive ? 1 : -1, 0] : 
		[0, positive ? 1 : -1]
	
	let newState = state
	for ({} of Math.abs(deltaValue))
		newState = enqueue(newState, unitVector)
	
	return newState
}