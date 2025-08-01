import { defaults } from "./defaults.js"
import { queueTipPosition } from "./game.js"

// Create SVG element
export const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
svg.setAttribute('viewBox', `0 0 ${defaults.arena[0]} ${defaults.arena[1]}`)
svg.setAttribute('class', 'playfield')
svg.style.cssText = `
	width: 100vmin;
	height: 100vmin;
	display: none;
`

// Create groups for different elements
const snakeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
snakeGroup.setAttribute('class', 'snake-group')
const queueGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
queueGroup.setAttribute('class', 'queue-group')
const appleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
appleGroup.setAttribute('class', 'apple-group')
const cursorGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g')
cursorGroup.setAttribute('class', 'cursor-group')

svg.appendChild(snakeGroup)
svg.appendChild(queueGroup)
svg.appendChild(appleGroup)
svg.appendChild(cursorGroup)

document.body.appendChild(svg)

// Generate CSS for positioning and styling
const generateSvgStyles = () => {
	const sheet = new CSSStyleSheet()
	const {arena, colors, stepTime} = defaults
	
	// Base sprite shape and transitions (using stepTime for duration)
	sheet.insertRule(`
		.sprite {
			pointer-events: none;
			transition-duration: ${stepTime}ms;
			transition-timing-function: linear;
			transform:
				translate(
					calc(var(--x) * 1px),
					calc(var(--y) * 1px)
				)
				translate(.5px, .5px)
				scale(calc(1/16 * var(--spriteZoom)))
				rotate(calc(360deg * var(--spriteRot)))
			;
			--spriteRot: 0;
			--spriteZoom: 1;
			d: path('M-7,0 L-5,5 L0,7 L5,5 L7,0 L5,-5 L0,-7 L-5,-5 Z');
		}
	`)
	
	// Queue marks should not transition (stay in place)
	sheet.insertRule(`
		.queue-mark {
			transition: none !important;
		}
	`)
	// Generating directional snake segment shapes
	for (const origin of ['top', 'bottom', 'left', 'right'])
		for (const target of ['top', 'bottom', 'left', 'right']) {
			if (origin == target) continue
		
			const edges = {
				...{top: 7, bottom: 7, left: 7, right: 7, left: 7},
				[origin]: 12,
				[target]: 0,
			}
			
			sheet.insertRule(
				`[data-${target}-edge="-1"][data-${origin}-edge="1"]
				{ d: path("M ${-edges.left} 0 L -6 6 L 0 ${edges.bottom} L 6 6 L ${edges.right} 0 L 6 -6 L 0 ${-edges.top} L -6 -6 Z"); }`)
	}
	
	// Generate position attribute selectors for arena size
	for (let x = 0; x < arena[0]; x++) {
		sheet.insertRule(`[data-x="${x}"] { --x: ${x} }`)
	}
	for (let y = 0; y < arena[1]; y++) {
		sheet.insertRule(`[data-y="${y}"] { --y: ${y} }`)
	}
	
	// Color classes
	sheet.insertRule(`.snake-alive { fill: ${colors.snake} }`)
	sheet.insertRule(`.snake-dead { fill: ${colors.snakeDead} }`)
	sheet.insertRule(`.apple { fill: ${colors.apple} }`)
	sheet.insertRule(`.queue-mark { fill: ${colors.queueMark} }`)
	sheet.insertRule(`.gamepad-cursor { fill: ${colors.gamepadCursor} }`)
	
	// SVG styling
	sheet.insertRule(`
		svg {
			background: ${colors.background};
		}
	`)
	
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
	return sheet
}

// Initialize styles
generateSvgStyles()

// Helper to create sprite path element
const createSprite = (className, x, y) => {
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	path.setAttribute('class', `sprite ${className}`)
	path.setAttribute('data-x', x)
	path.setAttribute('data-y', y)
	return path
}

// Helper to calculate direction vector between two positions
const getDirectionVector = (from, to) => {
	return [to[0] - from[0], to[1] - from[1]]
}

// Helper to set edge attributes based on direction vectors
const setEdgeAttributes = (element, fromDir, toDir) => {
	// Clear all edge attributes first
	element.removeAttribute('data-left-edge')
	element.removeAttribute('data-right-edge')
	element.removeAttribute('data-top-edge')
	element.removeAttribute('data-bottom-edge')
	
	// Set "from" direction as tail (1)
	if (fromDir[0] === 1) element.setAttribute('data-right-edge', '1')  // came from right
	else if (fromDir[0] === -1) element.setAttribute('data-left-edge', '1')   // came from left
	if (fromDir[1] === 1) element.setAttribute('data-bottom-edge', '1') // came from bottom
	else if (fromDir[1] === -1) element.setAttribute('data-top-edge', '1')    // came from top
	
	// Set "to" direction as mouth (-1)
	if (toDir[0] === 1) element.setAttribute('data-right-edge', '-1')  // going right
	else if (toDir[0] === -1) element.setAttribute('data-left-edge', '-1')   // going left
	if (toDir[1] === 1) element.setAttribute('data-bottom-edge', '-1') // going down
	else if (toDir[1] === -1) element.setAttribute('data-top-edge', '-1')    // going up
}

// Helper to update element position via data attributes
const updatePosition = (element, [x, y]) => {
	element.setAttribute('data-x', x)
	element.setAttribute('data-y', y)
}

// Helper to update element position via inline style (for fractional positions)
const updateInlinePosition = (element, [x, y]) => {
	element.style.setProperty('--x', x)
	element.style.setProperty('--y', y)
}

// Track existing elements to minimize DOM manipulation
let snakeElements = []
let queueElements = []
let appleElement = null
let cursorElement = null

export const svgRender = (state) => {
	const {snake, apple, queue, gamepadCursorOffset} = state
	
	// Show SVG only for SVG rendering
	svg.style.display = 'block'
	
	// Update snake segments
	const aliveClass = snake.alive ? 'snake-alive' : 'snake-dead'
	
	// Add new snake segments if needed
	while (snakeElements.length < snake.segments.length) {
		const segment = createSprite(aliveClass, 0, 0)
		snakeElements.push(segment)
		snakeGroup.appendChild(segment)
	}
	
	// Remove excess snake segments if needed
	while (snakeElements.length > snake.segments.length) {
		const element = snakeElements.pop()
		snakeGroup.removeChild(element)
	}
	
	// Update snake segment positions, colors, and shapes
	snake.segments.forEach((segment, idx) => {
		const element = snakeElements[idx]
		element.setAttribute('class', `sprite ${aliveClass}`)
		updatePosition(element, segment)
		
		// Calculate directional shape for this segment
		let fromDir = [0, 0]  // Where this segment came from
		let toDir = [0, 0]    // Where this segment is going
		
		if (idx === 0) {
			// Head: going in face direction
			toDir = [...snake.face]
			if (snake.segments.length > 1) {
				// Came from next segment
				fromDir = getDirectionVector(segment, snake.segments[1])
			}
		} else if (idx === snake.segments.length - 1) {
			// Tail: came from previous segment
			toDir = getDirectionVector(segment, snake.segments[idx - 1])
			// For tail, we need to know where it was going previously
			// This is tricky - we'll use the direction from the previous segment for now
			if (snake.segments.length > 1) {
				fromDir = getDirectionVector(snake.segments[idx - 1], segment)
			}
		} else {
			// Body: came from next segment, going to previous segment
			fromDir = getDirectionVector(segment, snake.segments[idx + 1])
			toDir = getDirectionVector(segment, snake.segments[idx - 1])
		}
		
		setEdgeAttributes(element, fromDir, toDir)
	})
	
	// Update queue marks - they should stay in place once created
	let queueMark = snake.segments[0]
	const queuePositions = queue.map(direction => {
		queueMark = queueMark.add(direction)
		return [...queueMark]
	})
	
	// Remove consumed queue elements from front
	while (queueElements.length > queuePositions.length) {
		const element = queueElements.shift() // Remove from front (FIFO)
		queueGroup.removeChild(element)
	}
	
	// Add new queue elements at the end
	while (queueElements.length < queuePositions.length) {
		const newPosition = queuePositions[queueElements.length]
		const mark = createSprite('queue-mark', newPosition[0], newPosition[1])
		queueElements.push(mark)
		queueGroup.appendChild(mark)
	}
	
	// Update apple
	if (!appleElement) {
		appleElement = createSprite('apple', 0, 0)
		appleGroup.appendChild(appleElement)
	}
	updatePosition(appleElement, apple)
	
	// Update gamepad cursor
	if (gamepadCursorOffset) {
		const cursorPos = queueTipPosition(state).add(gamepadCursorOffset)
		
		if (!cursorElement) {
			cursorElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			cursorElement.setAttribute('class', 'sprite gamepad-cursor')
			cursorGroup.appendChild(cursorElement)
		}
		
		// Use inline style for fractional positioning
		updateInlinePosition(cursorElement, cursorPos)
	} else if (cursorElement) {
		cursorGroup.removeChild(cursorElement)
		cursorElement = null
	}
	
	return state
}

// Export svg for input handling (maintains compatibility with canvas export)
export { svg as canvas }