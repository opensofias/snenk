export const step = state => {
	let {snake: {segments, face, alive}, apple, arena, queue, win} = state
	
	if (segments.length > 1 ) {
		const neck = addVecs (segments [1], ...negVecs(segments [0]))
		while (queue.length && vecEq (queue [0], neck))
		queue = queue.slice (1)
	}
	
	face = queue.length ? queue [0] : face

	const target = addVecs(segments[0], face);

	alive &&= 
		target.every((pos, idx) => 0 <= pos && pos < arena[idx]) &&
		segments.every(seg => !vecEq(seg, target));

	const eaten = alive && vecEq(target, apple);

	segments = (!alive) ? segments :
		eaten ? [target, ...segments] :
			[target, ...segments].slice(0, -1);

	if (segments.length == arena.reduce ((cur, pre) => cur * pre, 1))
		win ||= (alert ('woah, nice!') || true)
	else while (segments.some(seg => vecEq(seg, apple)))
		apple = arena.map(max => Math.floor(Math.random() * max));

	return {
		...state, apple, win,
		snake: {segments, alive, face},
		queue: queue.slice (1)
	};
};

export const enqueue = (state, direction) => {
	return {...state, queue: [...state.queue, direction]}
}

export const addVecs = (...vectors) =>
	vectors.reduce (
		(prev, cur) => prev.map ((val, idx) => val + cur[idx])
		,
		new Int8Array (Math.max(...vectors.map(x => x.length)))
	)


export const negVecs = (...vectors) => vectors.map (v => v.map (n => 0 - n))

const vecEq = (vec1, vec2) =>
	vec1.length == vec2.length &&
	vec1.every ((val, idx) => val == vec2 [idx])