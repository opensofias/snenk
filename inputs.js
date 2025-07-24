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
	lStick: discretizeLeftStick (gamepad.axes.slice (0, 2)),
	rStick: discretizeRightStick (gamepad.axes.slice (2, 4))
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
	
	// Handle right trigger for minor axis enqueuing
	const rightTrigger = gamepadState.buttons[7]?.pressed || false
	const oldRightTrigger = oldGamepadState.buttons?.[7]?.pressed || false
	
	if (rightTrigger && !oldRightTrigger) {
		for ({} of boost)
			actions.push('enqueueRightStickMinor')
	}
	
	// Handle left stick movement
	const currentStick = gamepadState.lStick
	const oldStick = oldGamepadState.lStick || [0, 0]
	
	// Only process if stick position changed and not in deadzone
	if (!currentStick.eq(oldStick) && !currentStick.eq([0, 0])) {
		const absStick = currentStick.map(Math.abs)
		
		// Determine major and minor axes
		const majorAxis = absStick[0] >= absStick[1] ? 0 : 1
		const minorAxis = 1 - majorAxis
		
		// Enqueue major axis first if non-zero
		if (currentStick[majorAxis] !== 0) {
			const majorVector = majorAxis === 0 ? 
				[currentStick[majorAxis] > 0 ? 1 : -1, 0] :
				[0, currentStick[majorAxis] > 0 ? 1 : -1]
			
			for ({} of boost) actions.push(majorVector)
		}
		
		// Then enqueue minor axis if non-zero
		if (currentStick[minorAxis] !== 0) {
			const minorVector = minorAxis === 0 ?
				[currentStick[minorAxis] > 0 ? 1 : -1, 0] :
				[0, currentStick[minorAxis] > 0 ? 1 : -1]
			
			for ({} of boost) actions.push(minorVector)
		}
	}
	
	return actions
}

const euclideanDistance = (v1, v2) =>
	Math.sqrt (
		(v1[0] - v2[0]) ** 2 +
		(v1[1] - v2[1]) ** 2 
	)

const discretizeRightStick = (vec, factor = 4) =>
	vec.sclMul (factor).map (Math.round)

const discretizeLeftStick = (vec) => {
	const targets = [
		[0, 0], //deadzone
		[1, -2/3], [1, 0], [1, 2/3],
		[2/3, 1], [0, 1], [-2/3, 1],
		[-1, 2/3], [-1, 0], [-1, -2/3],
		[-2/3, -1], [0, -1], [2/3, -1]
	]
	
	// Find closest target by euclidean distance
	let closestTarget = []
	let minDistance = Infinity
	
	for (const target of targets) {
		const distance = euclideanDistance (vec, target)
		if (distance < minDistance) {
			minDistance = distance
			closestTarget = target
		}
	}
	
	return closestTarget
}