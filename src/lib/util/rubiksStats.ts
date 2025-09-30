/**
 * Utility file for obtaining high, low, and average from a list of rubiks times
 *
 * Takes penalty time into account
 * Used in `RubiksSessionsModal` and `RubiksSingleSessionModal` to display session stats
 */

import type { RubiksTime } from '$lib/components/pages/rubiks/RubiksCubeTimer.svelte';

export function getLo(times: RubiksTime[]) {
	let lo = Infinity;
	for (const t of times) {
		if (!t.dnf && t.time + t.penalty < lo) {
			lo = t.time + t.penalty;
		}
	}
	return lo;
}

export function getHi(times: RubiksTime[]) {
	let hi = -Infinity;
	for (const t of times) {
		if (!t.dnf && t.time + t.penalty > hi) {
			hi = t.time + t.penalty;
		}
	}
	return hi;
}

export function getAvg(times: RubiksTime[]) {
	const validTimes = times.filter((t) => !t.dnf);
	return Math.floor(validTimes.reduce((acc, t) => acc + t.time + t.penalty, 0) / validTimes.length);
}
