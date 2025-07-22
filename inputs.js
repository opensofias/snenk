import { defaults } from "./defaults.js"
import { keyMap, gamepadMap } from "./keyMap.js"
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

export const pollGamepad = gamepad => ({
	buttons: gamepad.buttons.map(b => ({pressed: b.pressed, value: b.value})),
	axes: [...gamepad.axes]
})

export const handleGamepad = (gameState, loop, gamepadState, oldGamepadState) => {
	let newState = gameState
	
	// Calculate boost from left trigger
	const boost = Math.floor((gamepadState.buttons[6]?.value || 0) * 3) + 1
	
	gamepadState.buttons.forEach((button, index) => {
		if (
			button.pressed && !(oldGamepadState.buttons[index]?.pressed || false) // Fresh press only
		) { 
			if (index in gamepadMap) {
				// Apply boost to directional inputs
				for (let j = 0; j < boost; j++) {
					newState = enqueue(newState, gamepadMap[index])
				}
			}
			
			// Handle special buttons
			if (index === 0) { // A button - step/boost step
				for (let j = 0; j < boost; j++) {
					newState = step(newState)
				}
			}
			if (index === 9) { // Start button - pause/unpause
				if (!newState.snake.alive) {
					newState = defaults
					loop()
				} else {
					const {pause} = newState
					newState.pause = !pause
					if (pause) loop()
				}
			}
		}
	})
	
	// Handle analog sticks with deadzone
	gamepadState.axes.forEach((axis, index) => {
		const lastAxis = oldGamepadState.axes[index] || 0
		const deadzone = 0.5
		
		// Check if axis crossed threshold (fresh input)
		if (
			Math.abs(axis) > deadzone &&
			!Math.abs(lastAxis) > deadzone &&
			index in gamepadMap.axes
		) {
			const direction = axis > 0 ? 1 : 0
			const mapping = gamepadMap.axes[index]
			const directionVector = direction === 0 ? 
				[mapping[0], mapping[1]] : [mapping[2], mapping[3]]
			
			// Apply boost to analog stick inputs
			for (let j = 0; j < boost; j++) {
				newState = enqueue(newState, directionVector)
			}
		}
	})
		
	return newState
}