import { defaults } from "./defaults.js"
import { keyMap, gamepadMap } from "./keyMap.js"
import { step, enqueue } from "./game.js"
import { boostableActions } from "./actions.js"

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

export const handleKey = (state, {key, repeat: keyRepeat, ctrlKey, shiftKey}) => {
	if (keyRepeat) return []
	
	const boost = shiftKey ? 4 : 1
	const actions = []
	
	const action = ctrlKey && keyMap.Ctrl?.[key] ? 
		keyMap.Ctrl[key] : keyMap[key]
	
	if (action) {
		const isBoostable = boostableActions.has(action) || Array.isArray(action)
		const boostCount = isBoostable ? boost : 1
		
		for ({} of boostCount) actions.push(action)
	}
	
	return actions
}

export const pollGamepad = gamepad => ({
	buttons: gamepad.buttons.map(b => ({pressed: b.pressed, value: b.value})),
	axes: [...gamepad.axes]
})

export const handleGamepad = (gamepadState, oldGamepadState) => {
	const actions = []
	
	// Calculate boost from left trigger
	const boost = Math.floor((gamepadState.buttons[6]?.value || 0) * 3) + 1
	const leftBumper = gamepadState.buttons[4]?.pressed || false
	
	gamepadState.buttons.forEach((button, index) => {
		if (button.pressed && !(oldGamepadState.buttons[index]?.pressed || false)) {
			const action = leftBumper && gamepadMap.LeftBumper?.[index] ? 
				gamepadMap.LeftBumper[index] : gamepadMap[index]
			
			if (action) {
				const boostCount = boostableActions.has(action) || Array.isArray(action) ? boost : 1
				
				for ({} of boostCount)
					actions.push(action)
			}
		}
	})
	
	// Handle analog sticks with deadzone
	gamepadState.axes.forEach((axis, index) => {
		const lastAxis = oldGamepadState.axes[index] || 0
		const deadzone = 0.5
		
		if (
			Math.abs(axis) > deadzone &&
			!Math.abs(lastAxis) > deadzone &&
			index in gamepadMap.axes
		) {
			const direction = axis > 0 ? 1 : 0
			const mapping = gamepadMap.axes[index]
			const directionVector = direction === 0 ? 
				[mapping[0], mapping[1]] : [mapping[2], mapping[3]]
			
			for ({} of boost)
				actions.push(directionVector)
		}
	})
	
	return actions
}