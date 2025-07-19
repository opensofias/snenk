import { defaults } from "./defaults.js"
import { keyMap } from "./keyMap.js"
import { canvas, render } from "./render.js"
import { step, enqueue } from "./game.js"
import {} from "https://opensofias.github.io/dimekit/dimekit.js"
import {} from "https://opensofias.github.io/dimekit/vectorOps.js"
import { keyListener, pointerListener } from "./inputs.js"

let state = defaults

onkeydown = keyListener
canvas.onpointerdown = pointerListener

const loop = () => {
	if (state.pause) return;

	state = step (state)
	render (state)

	if (state.snake.alive) setTimeout (loop, 1000/4)
}

loop ()