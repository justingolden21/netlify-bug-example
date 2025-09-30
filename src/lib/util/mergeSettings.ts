// Custom logic to handle merging local settings with default settings
// Has special edge cases in case settings have changed and in case local settings are partially invalid

/**
 * Check if param is a non array, non null object
 * @param item
 * @returns {boolean} true if `item` is an object, otherwise false
 */
const isObject = (item: unknown): item is Record<string, unknown> =>
	!!item && typeof item === 'object' && !Array.isArray(item);

/**
 * Check if param is not undefined, null, or NaN
 * @param item
 * @returns {boolean} true if `item` is defined, not null, and not NaN
 */
const isValid = (item: unknown): item is Exclude<unknown, undefined | null> =>
	item !== undefined && item !== null && !Number.isNaN(item);

/**
 * Check if params have same `typeof`
 * @param item1, item2
 * @returns {boolean} true if both params share the same type, otherwise false
 */
const isSameType = (item1: unknown, item2: unknown): boolean => typeof item1 === typeof item2;

// const isPrimitiveType = (item: unknown): item is string | number | boolean =>
// 	['string', 'number', 'boolean'].includes(typeof item);

// overriden by user default
const validNulls = {
	timeFormat: 'string',
	timeFormatCustom: 'string',
	darkMode: 'boolean',
	metric: 'boolean',
	language: 'string',
	datetime: 'string',
	timezone: 'string',
	themeID: 'string',
	ampm: 'boolean',
	recentVersion: 'string'
} as const;

const isValidNull = (key: string): key is keyof typeof validNulls =>
	Object.keys(validNulls).includes(key);

/**
 * Deep merge two objects
 * @param target
 * @param ...sources
 * copy properties from sources to target
 * only if that property is present in target
 * and only if they are the same data type
 * undefined, null, and NaN values are ignored
 * as well as functions
 * falsey values such as false, 0, '', [], and {} are vaild
 * the property on the target can be null
 * but must be in validNulls
 * so timeFormat cannot be a number or boolean for example
 */
const mergeDeep = (
	target: Record<string, unknown>,
	...sources: Record<string, unknown>[]
): Record<string, unknown> => {
	if (!sources.length) {
		return target;
	}
	const source = sources.shift();

	if (!isObject(target)) {
		throw new Error('target must be an object');
	}
	if (!isObject(source)) {
		return target;
	}

	for (const key in source) {
		// only add properties present in original target object

		// hacky fix for rubiks cube
		// Code below breaks because the sessions will contain IDs
		// not found in `settings.ts` `defaultSettings`, so they will be deleted
		// since we delete keys that don't exist on the target element to prevent clutter.
		// We must set the target to the source since otherwise it will go deeper
		// and then the ID will be a non-predictable string (not "sessions").
		// We could make all uids start with "uid" and check for that if this problem arises in future pages
		if (key === 'sessions') {
			target[key] = source[key];
			continue;
		}

		// properties must exist. target is allowed to be null
		// (value intentionally set null to be overriden)
		if (!isValid(source[key])) continue;
		if (!isValid(target[key]) && target[key] !== null) continue;

		// if it's an object, recur
		const targetValue = target[key];
		if (isObject(targetValue)) {
			const sourceValue = source[key];
			if (isObject(sourceValue)) {
				mergeDeep(targetValue, sourceValue);
			}
			// only add properties if they are the same type
			// or if target is null (intentional lack of value) amd source isn't
		} else if (
			isSameType(target[key], source[key]) ||
			(target[key] === null &&
				source[key] !== null &&
				isValidNull(key) &&
				typeof source[key] === validNulls[key])
		) {
			target[key] = source[key];
		}
	}

	return mergeDeep(target, ...sources);
};

export default mergeDeep;
