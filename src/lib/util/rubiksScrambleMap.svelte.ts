import { get } from 'svelte/store';
import TailwindColors from 'tailwindcss/colors.js';

import { getKeys } from '$/types';
import { settings } from '$lib/stores/settings';
import Cube, { type Face, type Move, type SquareKey } from '$lib/util/rubiksCube';
import getScramble from '$lib/util/rubiksScrambleGenerator';

// (x, y) positions on canvas to draw squares
type Position = [number, number];

type Cubie = {
	x: number;
	y: number;
	color: string;
};

let squares = $state<Cubie[]>([]);

export function getSquares() {
	return squares;
}

function addSquare(position: Position, color: string) {
	squares.push({
		x: position[0],
		y: position[1],
		color: color
	});
}

// Modified from https://github.com/notchahm/js_speedcube_scrambler
function drawScramble(cube: Cube) {
	const cornerLetterPositionMap = {
		A: [155, 0],
		B: [255, 0],
		C: [255, 100],
		D: [155, 100],
		E: [0, 155],
		F: [100, 155],
		G: [100, 255],
		H: [0, 255],
		I: [155, 155],
		J: [255, 155],
		K: [255, 255],
		L: [155, 255],
		M: [310, 155],
		N: [410, 155],
		O: [410, 255],
		P: [310, 255],
		Q: [465, 155],
		R: [565, 155],
		S: [565, 255],
		T: [465, 255],
		U: [155, 310],
		V: [255, 310],
		W: [255, 410],
		X: [155, 410]
	} as Record<SquareKey, Position>;
	const edgeLetterPositionMap = {
		A: [205, 0],
		B: [255, 50],
		C: [205, 100],
		D: [155, 50],
		E: [50, 155],
		F: [100, 205],
		G: [50, 255],
		H: [0, 205],
		I: [205, 155],
		J: [255, 205],
		K: [205, 255],
		L: [155, 205],
		M: [360, 155],
		N: [410, 205],
		O: [360, 255],
		P: [310, 205],
		Q: [515, 155],
		R: [565, 205],
		S: [515, 255],
		T: [465, 205],
		U: [205, 310],
		V: [255, 360],
		W: [205, 410],
		X: [155, 360]
	} as Record<SquareKey, Position>;
	const centerPositionMap = {
		W: [205, 50],
		Y: [205, 360],
		O: [50, 205],
		R: [360, 205],
		B: [515, 205],
		G: [205, 205]
	} as Record<Face, Position>;

	// Same as `colorRGB` in `RubiksCube3DModel.svelte`
	const colorMap = {
		W: '#fff',
		Y: TailwindColors.yellow[400], // #facc15
		O: TailwindColors.orange[500], // #f97316
		R: TailwindColors.red[600], // #dc2626
		B: TailwindColors.blue[600], // #2563eb
		G: TailwindColors.green[600] // #16a34a
	};
	const cornerFaces = cube.getCornerFaces();
	const edgeFaces = cube.getEdgeFaces();
	squares = [];
	for (const face of getKeys(centerPositionMap)) {
		const position = centerPositionMap[face];
		const color = colorMap[face];
		addSquare(position, color);
	}
	for (const letter of getKeys(cornerFaces)) {
		const position = cornerLetterPositionMap[letter];
		const color = colorMap[cornerFaces[letter]];
		addSquare(position, color);
	}
	for (const letter of getKeys(edgeFaces)) {
		const position = edgeLetterPositionMap[letter];
		const color = colorMap[edgeFaces[letter]];
		addSquare(position, color);
	}
}

export function generateScramble(newScramble = true) {
	const settingsValue = get(settings);

	// create a new scramble
	if (newScramble) {
		// Use the current timestamp as a seed for random scramble
		settingsValue.rubiks.scramble = getScramble(new Date().toISOString());
	}

	// Create a new cube and apply the scramble to it
	const c = new Cube();
	settingsValue.rubiks.scramble.split(' ').forEach((m) => c.applyMove(m as Move));

	// Draw the 2d scramble map given the scrambled 3d cube representation
	drawScramble(c);

	settings.set(settingsValue);
}
