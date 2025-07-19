export const step = state => {
	let {snake: {segments, face, alive}, apple, arena, queue, win} = state
	
	if (segments.length > 1 ) {
		const neck = segments [0].sclMul (-1).add (segments [1])
		while (queue.length && queue [0].eq (neck))
		queue = queue.slice (1)
	}
	
	face = queue.length ? queue [0] : face

	const target = segments [0].add (face);

	alive &&= 
		target.every ((pos, idx) => 0 <= pos && pos < arena [idx]) &&
		segments.every (seg => !seg.eq (target));

	const eaten = alive && target.eq (apple);

	segments = (!alive) ? segments :
		eaten ? [target, ...segments] :
			[target, ...segments].slice (0, -1);

	if (segments.length == arena.reduce ((cur, pre) => cur * pre, 1))
		win ||= (alert ('woah, nice!') || true)
	else while (segments.some (seg => seg.eq (apple)))
		apple = arena.map (max => Math.floor (Math.random () * max));

	return {
		...state, apple, win,
		snake: {segments, alive, face},
		queue: queue.slice (1)
	};
};

export const enqueue = (state, direction) => {
	let {queue} = state
	
	// Get the current tip of the queue (or snake face if queue is empty)
	const queueTip = queue.length ? queue[queue.length - 1] : state.snake.face
	
	// Check if new direction is opposite to queue tip
	const isOpposite = direction.every((val, idx) => val === -queueTip[idx])
	
	if (direction.eq (queueTip)) {
		// Remove the tip instead of adding opposite direction
		queue = queue.slice(0, -1)
	} else {
		// Add the new direction normally
		queue = [...queue, direction]
	}
	
	return {...state, queue}
}