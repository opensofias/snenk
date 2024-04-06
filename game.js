import { addVecs, vecEq } from "./main.js";

export const step = ({ snake, apple, arena }) => {
	const target = addVecs(snake.segments[0], snake.face);

	const alive = snake.alive &&
		target.every((pos, idx) => 0 <= pos && pos < arena[idx]) &&
		snake.segments.every(seg => !vecEq(seg, target));

	const eaten = alive && vecEq(target, apple);

	const segments = (!alive) ? snake.segments :
		eaten ? [target, ...snake.segments] :
			[target, ...snake.segments].slice(0, -1);

	while (segments.some(seg => vecEq(seg, apple)))
		apple = arena.map(max => Math.floor(Math.random() * max));

	return {
		snake: { ...snake, segments, alive },
		apple, arena
	};
};

export const face = (state, face) =>  {
	return {...state, snake: {...state.snake, face}}
}
