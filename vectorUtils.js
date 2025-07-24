export const majorAxis = vec => {
	const absVec = vec.map(Math.abs)
	const majorIndex = absVec[0] >= absVec[1] ? 0 : 1
	return vec.map((val, idx) => idx === majorIndex ? val : 0)
}

export const minorAxis = vec => {
	const absVec = vec.map(Math.abs)
	const majorIndex = absVec[0] >= absVec[1] ? 0 : 1
	return vec.map((val, idx) => idx !== majorIndex ? val : 0)
}

export const majorAxisIndex = vec => {
	const absVec = vec.map(Math.abs)
	return absVec[0] >= absVec[1] ? 0 : 1
}

export const toUnitVector = (axis, positive) =>
	axis === 0 ? [positive ? 1 : -1, 0] : [0, positive ? 1 : -1]

export const euclideanDistance = (v1, v2) =>
	Math.sqrt(
		(v1[0] - v2[0]) ** 2 +
		(v1[1] - v2[1]) ** 2 
	)