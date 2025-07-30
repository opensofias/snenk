// Helper functions for coordinate conversion
export const coordsToNum = ([x, y], arenaWidth) => y * arenaWidth + x

export const numToCoords = (num, arenaWidth) => [
	num % arenaWidth,
	Math.floor(num / arenaWidth)
]

export const initializeFreeCells = (arena, snakeSegments) => {
	const totalCells = arena[0] * arena[1]
	const freeCells = new Set()
	
	// Add all cells to free set
	for (const cellNum of totalCells) {
		freeCells.add(cellNum)
	}
	
	// Remove snake segments from free cells
	snakeSegments.forEach(segment => {
		freeCells.delete(coordsToNum(segment, arena[0]))
	})
	
	return freeCells
}

export const queueTipPosition = state => {
	const {snake: {segments}, queue} = state
	return queue.reduce ((tip, direction) => tip.add (direction), segments [0])
}

export const queueTipDirection = state => {
	const {queue, snake: {face}} = state
	return queue.length ? queue [queue.length - 1] : face
}

export const step = state => {
	let {snake: {segments, face, alive, grow}, apple, arena, queue, win, freeCells} = state
	
	if (win && !alive) return state

	// Neck biting protection: Remove opposite directions from queue
	if (segments.length > 1) {
		const neck = segments [0].sclMul (-1).add (segments [1])
		while (queue.length && queue [0].eq (neck))
			queue = queue.slice (1)
	}
	
	face = queue.length ? queue [0] : face

	const target = segments [0].add (face)

	alive &&= 
		target.every ((pos, idx) =>
			0 <= pos && pos < arena [idx] // Test for wall collissions
		) && segments.every (seg => !seg.eq (target)) // Test for self collision

	// Check if apple eaten and increment grow
	if (alive && target.eq (apple)) grow++
	
	// Get old tail before updating segments
	const oldTail = segments[segments.length - 1]

	segments =
		(!alive) ? segments : // Dead snake doesn't move
		grow ? [target, ...segments] : // Growing: add head, keep tail
		[target, ...segments].slice (0, -1) // Normal: add head, remove tail

	// Update freeCells
	if (alive) {
		// Remove new head position from free cells
		freeCells.delete(coordsToNum(target, arena[0]))
		
		// If snake didn't grow, add old tail back to free cells
		if (!grow) {
			freeCells.add(coordsToNum(oldTail, arena[0]))
		}
	}

	if (grow) grow --

	// Check for win condition
	if (freeCells.size <= 1) {
		win = true
		alert ('woah, nice!')
	}

	if (!win && alive && target.eq (apple)) {
		// Generate new apple using hybrid approach
		apple = null
		const phase1Attempts = Math.floor(Math.sqrt(arena[0] * arena[1]))
		
		// Phase 1: Random attempts
		for (const attempt of phase1Attempts) {
			const randomNumCandidate = Math.floor(Math.random() * (arena[0] * arena[1]))
			if (freeCells.has(randomNumCandidate)) {
				apple = numToCoords(randomNumCandidate, arena[0])
				break
			}
		}
		
		// Phase 2: Fallback to guaranteed method
		if (apple === null && freeCells.size > 0) {
			const freeCellsArray = [...freeCells]
			const randomIndex = Math.floor(Math.random() * freeCellsArray.length)
			apple = numToCoords(freeCellsArray[randomIndex], arena[0])
		}
	}

	return {
		...state, apple, win, freeCells,
		snake: {segments, alive, face, grow},
		queue: queue.slice (1)
	}
}

export const enqueue = (state, direction) => {
	const magnitude = Math.max (...direction.map (Math.abs))
	const unitDirection = direction.map (x => x === 0 ? 0 : Math.sign (x))
	
	let newState = state
	for ({} of magnitude)
		newState = enqueueStep (newState, unitDirection)
	
	return newState
}

export const enqueueStep = (state, direction) => ({
	...state,
	// Opposite to directions cancel out
	queue: direction.eq (queueTipDirection (state).sclMul (-1)) ? 
		state.queue.slice (0, -1) :
		[...state.queue, direction]
})