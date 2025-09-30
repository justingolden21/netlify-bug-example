/**
 * Find the nearest city name to a given lat, long
 *
 * @link https://stackoverflow.com/a/21297385/4907950
 */

import cityPositions from '$lib/data/cityPositions.json';

export default function (lat: number, long: number) {
	let minDiff = 99999;
	let closest = '';

	let key: keyof typeof cityPositions;
	for (key in cityPositions) {
		const diff = pythagorasEquirectangular(lat, long, cityPositions[key][0], cityPositions[key][1]);
		if (diff < minDiff) {
			closest = key;
			minDiff = diff;
		}
	}

	return closest;
}

// Distance between two locations
function pythagorasEquirectangular(lat1: number, long1: number, lat2: number, long2: number) {
	lat1 = degToRad(lat1);
	lat2 = degToRad(lat2);
	long1 = degToRad(long1);
	long2 = degToRad(long2);
	const R = 6371; // radius of earth in km
	const x = (long2 - long1) * Math.cos((lat1 + lat2) / 2);
	const y = lat2 - lat1;
	return Math.sqrt(x * x + y * y) * R;
}

function degToRad(deg: number) {
	return (deg * Math.PI) / 180;
}
