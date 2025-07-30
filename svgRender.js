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
	
	// Base gem shape and transitions (using stepTime for duration)
	sheet.insertRule(`
		.gem {
			transition-duration: ${stepTime}ms;
			transition-timing-function: linear;
			transform:
				translate(
					calc(var(--x) * 1px),
					calc(var(--y) * 1px)
				)
				translate(.5px, .5px)
				scale(calc(1/16 * var(--gemZoom)))
				rotate(calc(360deg * var(--gemRot)))
			;
			--gemRot: 0;
			--gemZoom: 1;
			d: path('M-7,0 L-5,5 L0,7 L5,5 L7,0 L5,-5 L0,-7 L-5,-5 Z');
		}
	`)
	
	// Queue marks should not transition (stay in place)
	sheet.insertRule(`
		.queue-mark {
			transition: none !important;
		}
	`)
	
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

// Helper to create gem path element
const createGem = (className, x, y) => {
	const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
	path.setAttribute('class', `gem ${className}`)
	path.setAttribute('data-x', x)
	path.setAttribute('data-y', y)
	return path
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
		const segment = createGem(aliveClass, 0, 0)
		snakeElements.push(segment)
		snakeGroup.appendChild(segment)
	}
	
	// Remove excess snake segments if needed
	while (snakeElements.length > snake.segments.length) {
		const element = snakeElements.pop()
		snakeGroup.removeChild(element)
	}
	
	// Update snake segment positions and colors
	snake.segments.forEach((segment, idx) => {
		const element = snakeElements[idx]
		element.setAttribute('class', `gem ${aliveClass}`)
		updatePosition(element, segment)
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
		const mark = createGem('queue-mark', newPosition[0], newPosition[1])
		queueElements.push(mark)
		queueGroup.appendChild(mark)
	}
	
	// Update apple
	if (!appleElement) {
		appleElement = createGem('apple', 0, 0)
		appleGroup.appendChild(appleElement)
	}
	updatePosition(appleElement, apple)
	
	// Update gamepad cursor
	if (gamepadCursorOffset) {
		const cursorPos = queueTipPosition(state).add(gamepadCursorOffset)
		
		if (!cursorElement) {
			cursorElement = document.createElementNS('http://www.w3.org/2000/svg', 'path')
			cursorElement.setAttribute('class', 'gem gamepad-cursor')
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