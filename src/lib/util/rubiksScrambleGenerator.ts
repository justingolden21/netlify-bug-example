/**
 * Generates scrambles using pregenerated phase 1 and phase 2 base 64 encoded files
 *
 * We could simply use pre-generated scrambles from https://notchahm.github.io/js_speedcube_scrambler/
 * And generate them with the following code:
 * `let str='';for(let i=0; i<1000; i++) str += cube.generate_scramble()[0] + '\n';`
 * However, these would be uncompressed and take up lots of space and/or not provide a sufficiently large number of scrambles
 * Chahm created a system that stores many scrambles in two phases in base64 files and loads them to turn them into a scramble
 *
 * Used by `RubiksScrambleMap.svelte` to generate a new random scramble
 *
 * @author Chahm
 */

import phase1Scrambles from '$lib/data/phase1Scrambles';
import phase2Scrambles from '$lib/data/phase2Scrambles';

type SimpleMove = 'R' | 'L' | 'U' | 'D' | 'F' | 'B';

// prettier-ignore
const phase1Map = ['U', 'U2', "U'", 'R', 'R2', "R'", 'F', 'F2', "F'", 'D', 'D2', "D'", 'L', 'L2', "L'", 'B', 'B2', "B'"];
const phase2Map = ['U', 'U2', "U'", 'D', 'D2', "D'", 'F2', 'B2', 'R2', 'L2'];
const rotatedMoveMap = [
	{ F: 'F', B: 'B', U: 'U', D: 'D', R: 'R', L: 'L' },
	{ F: 'U', B: 'D', U: 'R', D: 'L', R: 'F', L: 'B' },
	{ R: 'U', L: 'D', F: 'R', B: 'L', U: 'F', D: 'B' },
	{ F: 'B', B: 'F', U: 'D', D: 'U', R: 'L', L: 'R' },
	{ F: 'D', B: 'U', U: 'L', D: 'R', R: 'B', L: 'F' },
	{ R: 'D', L: 'U', F: 'L', B: 'R', U: 'B', D: 'F' }
] as Record<SimpleMove, SimpleMove>[];

const phase1Binary = atob(phase1Scrambles);
const phase2Binary = atob(phase2Scrambles);
const poolSize = phase1Binary.length / 8;

/**
 * Functions to get phase 1 and phase 2 moves
 */

function int64Divmod(
	bytes: string | null,
	dividendHigh: number,
	dividendLow: number,
	divisor: number
) {
	// Javascript doesn't natively support 64 bit integers, but we can do some bit pushing to do math on multiple 32-bit equivalents
	// TODO: apparently typescript does have native support for bigint, which would make this obsolete, but I can't figure out how to use it
	if (bytes !== null) {
		// Convert a byte string into 2 32-bit integers
		const uintArray = new Uint32Array(2);
		uintArray[0] = 0;
		uintArray[1] = 0;
		// The 4 least significant bytes make the "low" int32
		let bitShift = 0;
		for (let byteIndex = 0; byteIndex < 4; byteIndex++) {
			const byteOffset = bytes.length - byteIndex - 1;
			if (byteOffset >= 0) {
				uintArray[1] += bytes.charCodeAt(byteOffset) << bitShift;

				bitShift += 8;
			}
		}
		// The next 4 least significant bytes make the "high" int32
		bitShift = 0;
		for (let byteIndex = 0; byteIndex < 4; byteIndex++) {
			const byteOffset = bytes.length - byteIndex - 5;
			if (byteOffset >= 0) {
				uintArray[0] += bytes.charCodeAt(byteOffset) << bitShift;
				bitShift += 8;
			}
		}
		dividendHigh = uintArray[0];
		dividendLow = uintArray[1];
	}
	// Can't just do division independently on each 32-bit integer, so:
	//  1. Divide on the "high" int, and keep the remainder
	//  2. Carry the remainder over to a temporary "mid" int that combines the remainder with the most significant byte of the "low" int
	//  3. Divide on the "mid" int, and the carry the remainder to the the rest of the "low" int
	const dividendMid = (dividendHigh % divisor << 8) + Math.floor(dividendLow / 16777216); // 2^24
	dividendLow = ((dividendMid % divisor << 24) >>> 0) + (dividendLow & 16777215);
	const remainder = dividendLow % divisor;
	const quotientHigh = Math.floor(dividendHigh / divisor);
	const quotientLow =
		((Math.floor(dividendMid / divisor) << 24) >>> 0) + Math.floor(dividendLow / divisor);
	return [quotientHigh, quotientLow, remainder];
}

// Decodes a buffer containing a binary encoded list of scrambles into an array containing readable move sequences
function decodeMoves(
	buffer: string,
	scrambleIndex: number,
	bytesPerScramble: number,
	moveList: string[]
) {
	const moves = [];
	const bufferBegin = scrambleIndex * bytesPerScramble;
	const bufferEnd = bufferBegin + bytesPerScramble;
	const bytes = buffer.slice(bufferBegin, bufferEnd);
	const divmodResult = int64Divmod(bytes, 0, 0, moveList.length);
	let high = divmodResult[0];
	let low = divmodResult[1];
	let moveIndex = divmodResult[2];
	moves.unshift(moveList[moveIndex]);
	while (high > 0 || low > 0) {
		if (high > 0) {
			[high, low, moveIndex] = int64Divmod(null, high, low, moveList.length);
		} else {
			moveIndex = low % moveList.length;
			low = Math.floor(low / moveList.length);
		}
		moves.push(moveList[moveIndex]);
	}
	return moves;
}

function getPhase1(scrambleIndex: number) {
	return decodeMoves(phase1Binary, scrambleIndex, 8, phase1Map);
}

function getPhase2(scrambleIndex: number) {
	return decodeMoves(phase2Binary, scrambleIndex, 6, phase2Map);
}

/**
 * Functions for random seed generation
 */

/**
 * A fast 128-bit hashing function that can be used to seed psuedo-random number generators
 *
 * @link https://stackoverflow.com/questions/521295/seeding-the-random-number-generator-in-javascript
 */
function cyrb128(str: string) {
	let h1 = 1779033703,
		h2 = 3144134277,
		h3 = 1013904242,
		h4 = 2773480762;
	for (let i = 0, k; i < str.length; i++) {
		k = str.charCodeAt(i);
		h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
		h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
		h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
		h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
	}
	h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
	h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
	h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
	h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
	h1 ^= h2 ^ h3 ^ h4;
	h2 ^= h1;
	h3 ^= h1;
	h4 ^= h1;
	return [h1 >>> 0, h2 >>> 0, h3 >>> 0, h4 >>> 0];
}

/**
 * sfc32 is part of the PractRand random number testing suite
 *
 * sfc32 has a 128-bit state and is very fast in JS
 *
 * @link https://pracrand.sourceforge.net/
 * @link https://stackoverflow.com/a/47593316/4907950
 */
function sfc32(a: number, b: number, c: number, d: number) {
	return function () {
		/**
		 * By using `>>>= 0`, we perform an unsigned right shift 0 positions
		 * This does not change the number, but is used to treat it as an unsigned 32 bit integer
		 */
		a >>>= 0;
		b >>>= 0;
		c >>>= 0;
		d >>>= 0;
		let t = (a + b) | 0;
		a = b ^ (b >>> 9);
		b = (c + (c << 3)) | 0;
		c = (c << 21) | (c >>> 11);
		d = (d + 1) | 0;
		t = (t + d) | 0;
		c = (c + t) | 0;
		return t >>> 0;
	};
}

/**
 * Get a random scramble given an optional seed
 *
 * @param {string} randomSeed - used to seed a reproducable pseudorandom state. Uses `Math.random` if no seed is given
 * @returns {string} - a string describing a sequence of moves to scramble a cube to a random state
 */
export default function getScramble(randomSeed: string) {
	let phase1Index: number;
	let phase2Index: number;
	let rotationIndex: number;
	let invertFlag: boolean;
	if (!randomSeed) {
		phase1Index = Math.floor(Math.random() * poolSize);
		phase2Index = Math.floor(Math.random() * poolSize);
		rotationIndex = Math.floor(Math.random() * rotatedMoveMap.length);
		invertFlag = Math.random() < 0.5;
	} else {
		// Use cybr128 to generate a 128-bit hash from the seed string.
		const seed = cyrb128(randomSeed);
		// Four 32-bit component hashes provide the seed for sfc32.
		const rand = sfc32(seed[0], seed[1], seed[2], seed[3]);
		phase1Index = rand() % poolSize;
		phase2Index = rand() % poolSize;
		rotationIndex = rand() % rotatedMoveMap.length;
		invertFlag = rand() % 0 == 1;
	}
	// Scrambles were generated with 2-phase solver, Generate a new random scramble as the result of two independent random phases
	const phase1Moves = getPhase1(phase1Index);
	const phase2Moves = getPhase2(phase2Index);
	const lastPhase1 = phase1Moves[phase1Moves.length - 1];
	const firstPhase2 = phase2Moves[0];
	if (lastPhase1[0] == firstPhase2[0]) {
		// Two consecutive moves on same face, so we can combine or cancel
		if (phase2Moves[0][1] == '2') {
			if (lastPhase1.length == 1) {
				// Clockwise becomes counter-clockwise
				phase1Moves.pop();
				phase2Moves[0] = phase2Moves[0][0] + "'";
			} else if (lastPhase1[1] == "'") {
				// Counter-clockwise becomes clockwise
				phase1Moves.pop();
				phase2Moves[0] = phase2Moves[0][0];
			} else {
				// 2 double moves cancel each other
				phase1Moves.pop();
				phase2Moves.shift();
			}
		} else {
			if (lastPhase1 == firstPhase2) {
				// Two of the same single turn make a double turn
				phase1Moves.pop();
				phase2Moves[0] = phase2Moves[0][0] + '2';
			} else if (lastPhase1.length == 1 || lastPhase1[1] == "'") {
				// not the same, no doubles, so opposites -- they should cancel
				phase1Moves.pop();
				phase2Moves.shift();
			} else {
				if (firstPhase2.length == 1) {
					// Clockwise becomes counter-clockwise
					phase1Moves.pop();
					phase2Moves[0] = phase2Moves[0][0] + "'";
				} else if (firstPhase2[1] == "'") {
					// Counter-clockwise becomes clockwise
					phase1Moves.pop();
					phase2Moves[0] = phase2Moves[0][0];
				}
			}
		}
	}
	let scramble = phase1Moves.concat(phase2Moves);
	// random scrambles have been normalized to have domino reduction on UD axis
	//  1/6 chance of rotating to each face
	const moveMap = rotatedMoveMap[rotationIndex];
	for (let moveIndex = 0; moveIndex < scramble.length; moveIndex++) {
		const origMove = scramble[moveIndex];
		scramble[moveIndex] = moveMap[origMove[0] as SimpleMove];
		if (origMove.length > 1) {
			scramble[moveIndex] += origMove[1];
		}
	}

	// 50/50 chance of inverting scramble
	if (invertFlag) {
		const reversedMoves = [];
		for (const move of scramble) {
			if (move.length > 1) {
				if (move[1] == "'") {
					reversedMoves.unshift(move[0]);
				} else {
					reversedMoves.unshift(move);
				}
			} else {
				reversedMoves.unshift(move + "'");
			}
		}
		scramble = reversedMoves;
	}
	// Return list of moves as string
	return scramble.join(' ');
}
