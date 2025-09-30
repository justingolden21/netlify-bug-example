/**
 * Given an input, use its min and max and attempt to parse the current input value
 * Always returns a valid int between min and max, attempts to return the current input's value
 * @param input HTML number input element with min, max, and value
 * @returns validated int between min and max
 */
export default function validateInt(input: HTMLInputElement, defaultVal?: number): number {
	const min = +input.min;
	const max = +input.max;
	const val = input.value;

	if (!val.length || Number.isNaN(parseInt(val)) || val == null) return defaultVal ?? min;
	return Math.max(Math.min(parseInt(val), max), min);
}

/**
 * Same as above but uses `parseFloat`
 */
export function validateFloat(input: HTMLInputElement): number {
	const min = +input.min;
	const max = +input.max;
	const val = input.value;

	if (!val.length || Number.isNaN(parseFloat(val)) || val == null) return min;
	return Math.max(Math.min(parseFloat(val), max), min);
}
