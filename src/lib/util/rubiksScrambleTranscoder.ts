/**
 * Encodes scrambles for url and decodes scrambles for use in application
 *
 * Encodes scrambles of form F, F2, F' split by spaces
 * into scrambles of form F1, F2, F3 without spaces
 * Eg. "F F2 F'" -> "F1F2F3"
 *
 * We use this format so that there are no url encoding problems.
 * It's readable, and every move is 2 characters
 *
 * Used by `RubiksScrambleWalkthroughModal.svelte` to encode scramble into url param
 * Used by `routes/rubikscube/+page.svelte` to decode scramble from url param
 */

const encodeScramble = (scramble: string) =>
	scramble
		.split(' ')
		.map((m) => (m.length === 1 ? m + '1' : m[1] === "'" ? m[0] + '3' : m))
		.join('');

const decodeScramble = (scramble: string) =>
	scramble
		.match(/.{2}/g) // split into groups of 2 chars
		?.map((m) => (m[1] === '1' ? m[0] : m[1] === '3' ? m[0] + "'" : m))
		.join(' ');

export { decodeScramble, encodeScramble };
