import { pixelRender, canvas as pixelCanvas } from "./pixelRender.js"
import { svgRender, canvas as svgCanvas } from "./svgRender.js"

const renderers = {
	pixel: pixelRender,
	svg: svgRender
}

const canvases = {
	pixel: pixelCanvas,
	svg: svgCanvas
}

export const render = (state) => {
	const renderer = renderers[state.render] || renderers.pixel
	return renderer(state)
}

// Export appropriate canvas/svg for input handling
export const canvas = (state) => canvases[state?.render] || canvases.pixel