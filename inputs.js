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

let lastGamepadState = new Map() // Store previous gamepad states

export const handleGamepad = (state, loop) => {
	const gamepads = navigator.getGamepads()
	let newState = state
	
	for (let i = 0; i < gamepads.length; i++) {
		const gamepad = gamepads[i]
		if (!gamepad) continue
		
		const lastState = lastGamepadState.get(i) || { buttons: [], axes: [] }
		
		// Calculate boost from shoulder triggers (buttons 6 and 7)
		const leftTrigger = gamepad.buttons[6]?.value || 0
		const rightTrigger = gamepad.buttons[7]?.value || 0
		const boost = Math.max(1, Math.floor(Math.max(leftTrigger, rightTrigger) * 4) + 1)
		
		// Handle buttons - only on fresh press
		gamepad.buttons.forEach((button, index) => {
			const wasPressed = lastState.buttons[index]?.pressed || false
			const isPressed = button.pressed
			
			if (isPressed && !wasPressed) { // Fresh press only
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
				if (index === 1) { // B button - pause/unpause
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
		gamepad.axes.forEach((axis, index) => {
			const lastAxis = lastState.axes[index] || 0
			const deadzone = 0.5
			
			// Check if axis crossed threshold (fresh input)
			const wasActive = Math.abs(lastAxis) > deadzone
			const isActive = Math.abs(axis) > deadzone
			
			if (isActive && !wasActive && index in gamepadMap.axes) {
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
		
		// Store current state for next frame
		lastGamepadState.set(i, {
			buttons: gamepad.buttons.map(b => ({pressed: b.pressed, value: b.value})),
			axes: [...gamepad.axes]
		})
	}
	
	return newState
}