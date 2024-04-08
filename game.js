export const step = state => {
	let {snake, apple, arena, queue} = state
	
	if (snake.segments.length > 1 ) {
		const neck = addVecs (snake.segments [1], ...negVecs(snake.segments [0]))
		while (queue.length && vecEq (queue [0], neck))
		queue = queue.slice (1)
	}
	
	const face = queue.length ? queue [0] : snake.face

	const target = addVecs(snake.segments[0], face);

	const alive = snake.alive &&
		target.every((pos, idx) => 0 <= pos && pos < arena[idx]) &&
		snake.segments.every(seg => !vecEq(seg, target));

	const eaten = alive && vecEq(target, apple);

	const segments = (!alive) ? snake.segments :
		eaten ? [target, ...snake.segments] :
			[target, ...snake.segments].slice(0, -1);

	if (segments.length == arena.reduce ((cur, pre) => cur * pre, 1))
		state.win ||= (alert ('woah, nice!') || true)
	else while (segments.some(seg => vecEq(seg, apple)))
		apple = arena.map(max => Math.floor(Math.random() * max));

	return {
		...state,
		snake: { ...snake, segments, alive, face},
		apple, queue: queue.slice (1)
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