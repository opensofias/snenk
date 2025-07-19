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
	return {...state, queue: [...state.queue, direction]}
}