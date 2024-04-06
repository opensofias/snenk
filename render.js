import { defaults } from "./default.js"

const canvas = document.createElement ('canvas')
canvas.height = defaults.arena [0]
canvas.width = defaults.arena [1]
document.body.appendChild (canvas)
const ctx = canvas.getContext('2d')

export const render = (state) => {
	const {arena, snake, apple} = state
	ctx.fillStyle = '#000'
	ctx.fillRect (0, 0, ...arena)
	ctx.fillStyle = snake.alive ? '#0f0' : '#888'
	snake.segments.forEach(seg =>
		ctx.fillRect (...seg, 1, 1)
	);
	ctx.fillStyle = '#f00'
	ctx.fillRect (...apple, 1, 1)
	return state
}

