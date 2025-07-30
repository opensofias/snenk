import { defaults } from "./defaults.js"
import { queueTipPosition } from "./game.js"

export const canvas = document.createElement('canvas')
canvas.height = defaults.arena[1]
canvas.width = defaults.arena[0]
canvas.style.display = 'none' // Hidden by default
document.body.appendChild(canvas)
const ctx = canvas.getContext('2d')

export const pixelRender = (state) => {
	// Show canvas only for pixel rendering
	canvas.style.display = 'block'
	
	const {arena, snake, apple, gamepadCursorOffset, colors} = state
	ctx.fillStyle = colors.background
	ctx.fillRect (0, 0, ...arena)
	ctx.fillStyle = snake.alive ? colors.snake : colors.snakeDead
	snake.segments.forEach (seg =>
		ctx.fillRect (...seg, 1, 1)
	)
	ctx.fillStyle = colors.apple
	ctx.fillRect (...apple, 1, 1)

	ctx.fillStyle = colors.queueMark
	
	let queueMark = state.snake.segments [0]
	state.queue.forEach (queued => {
		queueMark = queueMark.add (queued)
		ctx.fillRect (...queueMark, 1, 1)
	})

	// Render gamepad cursor if present
	if (gamepadCursorOffset) {
		const gamepadCursor = queueTipPosition (state).add (gamepadCursorOffset)
		ctx.fillStyle = colors.gamepadCursor
		ctx.fillRect (...gamepadCursor, 1, 1)
	}

	return state
}