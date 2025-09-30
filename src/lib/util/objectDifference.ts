const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Find the differences between two objects
 * @param  {T} obj1 - Source object to compare obj2 against
 * @param  {U} obj2 - New object with potential changes
 * @return {Partial<U>} An object containing the differences between obj1 and obj2
 */
export function difference<T extends Record<any, any>, U extends Record<any, any>>(
	obj1: T,
	obj2: U
): DeepPartial<U> {
	const diff: Record<any, unknown> = {};
	for (const key of Object.keys(obj2)) {
		const value1 = obj1[key];
		const value2 = obj2[key];

		if (typeof value1 !== typeof value2 || isObject(value1) !== isObject(value2)) {
			diff[key] = value2;
			continue;
		}

		if (isObject(value1) && isObject(value2)) {
			const _diff = difference(value1, value2);
			if (Object.keys(_diff).length > 0) diff[key] = _diff;
		} else if (Array.isArray(value1) && Array.isArray(value2)) {
			diff[key] = value2.filter((v) => !value1.includes(v)) || undefined;
		} else if (value1 !== value2) {
			diff[key] = value2;
		}
	}
	return diff as DeepPartial<U>;
}
