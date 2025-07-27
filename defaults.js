import { initializeFreeCells } from "./game.js"

const baseDefaults = {
	snake: {
		face: [1, 0],
		segments: [[1, 0],[0, 0]],
		alive: true,
		grow: 0,
	},
	apple: [3, 0],
	arena: [16, 16],
	queue: [],
	pause: false,
	win: false,
	stepTime: 1000 / 4,
	boostFactor: 4,
	colors: {
		background: '#000',
		snake: '#0f0',
		snakeDead: '#888',
		apple: '#f00',
		queueMark: '#8f82',
		gamepadCursor: '#fc08'
	}
}

export const getInitialState = () => {
	const state = {...baseDefaults}
	state.freeCells = initializeFreeCells(state.arena, state.snake.segments)
	return state
}

// For backwards compatibility, export defaults as the initial state
export const defaults = getInitialState()