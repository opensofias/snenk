import { defaults } from "./defaults.js"
import { keyMap } from "./keyMap.js"
import { step, enqueue } from "./game.js"

export const handlePointer = (state, {
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
	
	let newState = state
	for ({} of absDelta [axis])
		newState = enqueue (newState, axis ? [0, positive ? 1 : -1] : [positive ? 1 : -1 ,0])

	return newState
}

export const handleKey = (state, loop, {key, repeat: keyRepeat, ctrlKey, shiftKey}) => {
	const boost = shiftKey ? 4 : 1
	let newState = state

	if (key == ' ')
		for ({} of ctrlKey ? state.queue : boost)
			newState = step (newState)

	if (key in keyMap && !keyRepeat)
		for ({} of boost) newState = enqueue (newState, keyMap [key])

	if (key == 'Backspace')
		newState = {...newState, queue: ctrlKey ? [] : newState.queue.slice (0, -boost)}

	if (key == 'Enter') {
		if (!newState.snake.alive) {
			newState = defaults
			loop ()
		} else {
			const {pause} = newState
			newState.pause = !pause
			if (pause) loop ()
		}
	}

	return newState
}