import { pixelRender, canvas } from "./pixelRender.js"
// import { svgRender } from "./svgRender.js" // For future use

const renderers = {
	pixel: pixelRender,
	// svg: svgRender // For future use
}

export const render = (state) => {
	const renderer = renderers[state.render] || renderers.pixel
	return renderer(state)
}

// Export canvas for input handling (maintains compatibility)
export { canvas }