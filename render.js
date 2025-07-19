import { defaults } from "./defaults.js"

export const canvas = document.createElement ('canvas')
canvas.height = defaults.arena [1]
canvas.width = defaults.arena [0]
document.body.appendChild (canvas)
const ctx = canvas.getContext ('2d')

export const render = (state) => {
	const {arena, snake, apple} = state
	ctx.fillStyle = '#000'
	ctx.fillRect (0, 0, ...arena)
	ctx.fillStyle = snake.alive ? '#0f0' : '#888'
	snake.segments.forEach (seg =>
		ctx.fillRect (...seg, 1, 1)
	);
	ctx.fillStyle = '#f00'
	ctx.fillRect (...apple, 1, 1)

	ctx.fillStyle = '#8f82'
	
	let queueMark = state.snake.segments [0]
	state.queue.forEach (queued => {
		queueMark = queueMark.add (queued)
		ctx.fillRect (...queueMark, 1, 1)
	})

	return state
}