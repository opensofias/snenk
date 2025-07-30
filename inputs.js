import { keyMap, gamepadMap } from "./keyMap.js"
import { enqueue, queueTipPosition } from "./game.js"
import { boostableActions, applyActions } from "./actions.js"
import { majorAxis, minorAxis, euclideanDistance } from "./vectorUtils.js"
import { canvas } from "./render.js"
import { game } from "./main.js"
import { defaults } from "./defaults.js"

export const handlePointer = (state, {
	target: {clientWidth, clientHeight}, button, offsetX, offsetY
}) => {
	const {arena} = state
	const pointerVec = [
		offsetX / clientWidth * arena [0],
		offsetY / clientHeight * arena [1],
	].map (Math.floor)
	const deltaVec = pointerVec.add (queueTipPosition (state).sclMul (-1))

	const targetVector = (button != 1 ? majorAxis : minorAxis) (deltaVec)

	return [targetVector]
}

export const handleKey = ({key, repeat: keyRepeat, ctrlKey, shiftKey}) => {
	if (keyRepeat) return []
	
	const boost = shiftKey ? defaults.boostFactor : 1
	const actions = []
	
	const action = ctrlKey && keyMap.Ctrl?. [key] ? 
		keyMap.Ctrl [key] : keyMap [key]
	
	if (action) {
		const isBoostable = boostableActions.has (action) || Array.isArray (action)
		
		for ({} of isBoostable ? boost : 1) actions.push (action)
	}
	
	return actions
}

export const pollGamepad = gamepad => ({
	buttons: gamepad.buttons.map (b => ({pressed: b.pressed, value: b.value})),
	lStick: discretizeLeftStick (gamepad.axes.slice (0, 2)),
	rStick: discretizeRightStick (gamepad.axes.slice (2, 4))
})

export const handleGamepad = (gamepadState, oldGamepadState) => {
	const actions = []
	
	// Calculate boost from left trigger: lerp between 1 and boostFactor
	const triggerValue = gamepadState.buttons[6]?.value || 0
	const boost = 1 + triggerValue * (defaults.boostFactor - 1)
	const leftBumper = gamepadState.buttons [4]?.pressed || false
	
	gamepadState.buttons.forEach ((button, index) => {
		if (button.pressed && !(oldGamepadState.buttons [index]?.pressed || false)) {
			const action = leftBumper && gamepadMap.LeftBumper?. [index] ? 
				gamepadMap.LeftBumper [index] : gamepadMap [index]
			
			if (action) {
				const isBoostable = boostableActions.has (action) || Array.isArray (action)
				
				if (isBoostable && Array.isArray (action)) {
					actions.push (action.sclMul (boost))
				} else {
					const boostCount = isBoostable ? boost : 1
					for ({} of boostCount)
						actions.push (action)
				}
			}
		}
	})
	
	// Handle right trigger for minor axis enqueuing
	const rightTrigger = gamepadState.buttons [7]?.pressed || false
	const oldRightTrigger = oldGamepadState.buttons?. [7]?.pressed || false
	
	if (rightTrigger && !oldRightTrigger) {
		for ({} of boost)
			actions.push ('enqueueRightStickMinor')
	}
	
	// Handle left stick movement
	const currentStick = gamepadState.lStick
	const oldStick = oldGamepadState.lStick || [0, 0]
	
	if (!currentStick.eq (oldStick)) {
		const major = majorAxis (currentStick)
		const minor = minorAxis (currentStick)
		
		// Enqueue with boost using sclMul
		actions.push (major.sclMul (boost))
		actions.push (minor.map(Math.round).sclMul (boost))
	}
	
	return actions
}

const discretizeRightStick = (vec, factor = 4) =>
	vec.sclMul (factor).map (Math.round)

const discretizeLeftStick = (vec) => {
	const targets = [
		[0, 0], //deadzone
		[1, -2/3], [1, 0], [1, 2/3], // right side
		[2/3, 1], [0, 1], [-2/3, 1], // top side  
		[-1, 2/3], [-1, 0], [-1, -2/3], // left side
		[-2/3, -1], [0, -1], [2/3, -1] // bottom side
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

export const startInputListeners = () => {
	onkeydown = (event) => {
		const actions = handleKey(event)

		if (actions.length) {
			game.state = applyActions(game.state, actions)
		}
	}

	// Set up pointer events on the current canvas/svg
	const setupPointerEvents = () => {
		const currentCanvas = canvas(game.state)
		
		currentCanvas.onpointerdown = (event) => {
			game.state = applyActions(game.state, handlePointer(game.state, event))
		}

		currentCanvas.ondblclick = () => {
			game.state = applyActions(game.state, ['pause'])
		}
	}

	// Initial setup
	setupPointerEvents()

	// Curried self-calling rAF loop
	const gamepadLoop = (gamepadState = {buttons: [], axes: []}) => () => {
		const gamepad = navigator.getGamepads()[0]

		if (gamepad) {
			let oldGamepadState = gamepadState
			gamepadState = pollGamepad(gamepad)

			const actions = handleGamepad(gamepadState, oldGamepadState)
			
			// Update cursor offset based on right stick
			const {rStick} = gamepadState
			let newState = game.state
			if (rStick.eq([0, 0])) {
				newState = {...newState, gamepadCursorOffset: null}
			} else {
				newState = {...newState, gamepadCursorOffset: rStick}
			}
		
			// Only update state if it actually changed or cursor moved
			if (actions.length || !rStick.eq(oldGamepadState.rStick || [0, 0])) {
				game.state = applyActions(newState, actions)
			} else if (newState !== game.state) {
				game.state = newState
			}
		}
		
		requestAnimationFrame(gamepadLoop(gamepadState))
	}
	gamepadLoop()()
}