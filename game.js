export const queueTipPosition = state => {
	const {snake: {segments}, queue} = state
	return queue.reduce ((tip, direction) => tip.add (direction), segments [0])
}

export const queueTipDirection = state => {
	const {queue, snake: {face}} = state
	return queue.length ? queue [queue.length - 1] : face
}

export const step = state => {
	let {snake: {segments, face, alive}, apple, arena, queue, win} = state
	
	if (segments.length > 1) {
		const neck = segments [0].sclMul (-1).add (segments [1])
		while (queue.length && queue [0].eq (neck))
			queue = queue.slice (1)
	}
	
	face = queue.length ? queue [0] : face

	const target = segments [0].add (face)

	alive &&= 
		target.every ((pos, idx) => 0 <= pos && pos < arena [idx]) &&
		segments.every (seg => !seg.eq (target))

	const eaten = alive && target.eq (apple)

	segments = (!alive) ? segments :
		eaten ? [target, ...segments] :
			[target, ...segments].slice (0, -1)

	if (segments.length == arena.reduce ((cur, pre) => cur * pre, 1))
		win ||= (alert ('woah, nice!') || true)
	else while (segments.some (seg => seg.eq (apple)))
		apple = arena.map (max => Math.floor (Math.random () * max))

	return {
		...state, apple, win,
		snake: {segments, alive, face},
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