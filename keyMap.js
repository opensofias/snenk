export const keyMap = {
	ArrowUp: [0, -1], w: [0, -1], W: [0, -1], 
	ArrowDown: [0, 1], s: [0, 1], S: [0, 1],
	ArrowRight: [1, 0], d: [1, 0], D: [1, 0],
	ArrowLeft: [-1, 0], a: [-1, 0], A: [-1, 0],
	' ': 'step',
	Enter: 'pause',
	Backspace: 'dequeue',
	Ctrl: {
		' ': 'fullQueue',
		Backspace: 'clearQueue',
		Enter: 'restartGame'
	}
}

export const gamepadMap = {
	// D-pad
	12: [0, -1], // up
	13: [0, 1],  // down
	14: [-1, 0], // left
	15: [1, 0],  // right
	0: 'step',   // A button
	1: 'dequeue', // B button
	9: 'pause',  // Start button
	LeftBumper: {
		0: 'fullQueue',   // A + RB
		1: 'clearQueue',  // B + RB
		9: 'restartGame'  // Start + RB
	},
	
	// Left stick
	axes: {
		0: [-1, 0, 1, 0], // X-axis: [left, none, right, none]
		1: [0, -1, 0, 1]  // Y-axis: [none, up, none, down]
	}
}