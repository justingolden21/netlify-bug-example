/**
 * Utility file for exporting a `Cube` class
 *
 * `Cube` class represents a 3d cube and can be moved, reset, and obtain corner and edge faces
 * Used by `RubiksScrambleMap.svelte` to display scramble map after applying scramble moves
 * Used by `RubiksCube3DModel.svelte` for representing the rubiks cube data in the 3d model
 *
 * @author Chahm
 * @link https://notchahm.github.io/js_speedcube_scrambler/cube.js
 */

const CORNERS = ['WRG', 'WGO', 'WOB', 'WBR', 'YGR', 'YOG', 'YBO', 'YRB'];
const EDGES = ['WR', 'WG', 'WO', 'WB', 'YR', 'YG', 'YO', 'YB', 'GR', 'GO', 'BO', 'BR'];

export type Face = 'W' | 'R' | 'G' | 'O' | 'B' | 'Y';

type Corner = (typeof CORNERS)[number];
type Edge = (typeof EDGES)[number];

export type Piece = Face | Corner | Edge;

// 24 corner squares and 24 edge squares on 2d scramble map
export type SquareKey =
	| 'A'
	| 'B'
	| 'C'
	| 'D'
	| 'E'
	| 'F'
	| 'G'
	| 'H'
	| 'I'
	| 'J'
	| 'K'
	| 'L'
	| 'M'
	| 'N'
	| 'O'
	| 'P'
	| 'Q'
	| 'R'
	| 'S'
	| 'T'
	| 'U'
	| 'V'
	| 'W'
	| 'X';

type CornerOrientation = 0 | 1 | 2;
type EdgeOrientation = 0 | 1;

type EdgeIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;
type CornerIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

type CornerPermutationMap = [
	CornerIdx,
	CornerIdx,
	CornerIdx,
	CornerIdx,
	CornerIdx,
	CornerIdx,
	CornerIdx,
	CornerIdx
];
type CornerOrientationMap = [
	CornerOrientation,
	CornerOrientation,
	CornerOrientation,
	CornerOrientation,
	CornerOrientation,
	CornerOrientation,
	CornerOrientation,
	CornerOrientation
];
type EdgePermutationMap = [
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx,
	EdgeIdx
];
type EdgeOrientationMap = [
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation,
	EdgeOrientation
];

export type Move =
	| 'R'
	| "R'"
	| 'R2'
	| 'L'
	| "L'"
	| 'L2'
	| 'U'
	| "U'"
	| 'U2'
	| 'D'
	| "D'"
	| 'D2'
	| 'F'
	| "F'"
	| 'F2'
	| 'B'
	| "B'"
	| 'B2';

export default class Cube {
	cornerPermutations: Corner[];
	cornerOrientations: CornerOrientation[];
	edgePermutations: Edge[];
	edgeOrientations: EdgeOrientation[];

	// Consts
	cornerFaceMap: string[][];
	edgeFaceMap: string[][];

	/**
	 * Represent a 3x3x3 cube by
	 * - its compontent movable pieces: 8 Corners, 12 Edges
	 * - valid cube moves: 3 turns(clockwise, counterclocwise, and 180 degree rotation) * 6 faces (U, D, L, R, F, B)
	 * Adapted from https://github.com/hkociemba/RubiksCube-TwophaseSolver/blob/master/cubie.py
	 */

	constructor() {
		// Initialize corners
		this.cornerPermutations = [];
		this.cornerOrientations = [];

		// Initialize edges
		this.edgePermutations = [];
		this.edgeOrientations = [];

		// Map the corner positions to facelet positions in Spefz notation
		this.cornerFaceMap = [
			['C', 'M', 'J'],
			['D', 'I', 'F'],
			['A', 'E', 'R'],
			['B', 'Q', 'N'],
			['V', 'K', 'P'],
			['U', 'G', 'L'],
			['X', 'S', 'H'],
			['W', 'O', 'T']
		];

		// Map the edge positions to facelet positions
		this.edgeFaceMap = [
			['B', 'M'],
			['C', 'I'],
			['D', 'E'],
			['A', 'Q'],
			['V', 'O'],
			['U', 'K'],
			['X', 'G'],
			['W', 'S'],
			['J', 'P'],
			['L', 'F'],
			['R', 'H'],
			['T', 'N']
		];

		this.resetState();
	}

	// Resets the cube to initial (solved) state
	resetState() {
		this.cornerPermutations = [];
		this.cornerOrientations = [];
		this.edgePermutations = [];
		this.edgeOrientations = [];
		CORNERS.forEach((corner) => this.cornerPermutations.push(corner));
		CORNERS.forEach(() => this.cornerOrientations.push(0));
		EDGES.forEach((edge) => this.edgePermutations.push(edge));
		EDGES.forEach(() => this.edgeOrientations.push(0));
	}

	// Multiply this `Cube` object with another cube, restricted to the corners. Does not change the other cube.
	cornerMultiply(
		cornerPermutationMap: CornerPermutationMap,
		cornerOrientationMap: CornerOrientationMap
	) {
		const newCornerOrientations: CornerOrientation[] = [];
		const newCornerPermutations = [];
		let newOrientation = 0;
		for (const cornerIndex in CORNERS) {
			const newIndex = cornerPermutationMap[cornerIndex];
			newCornerPermutations.push(this.cornerPermutations[newIndex]);
			const oriA = this.cornerOrientations[newIndex];
			const oriB = cornerOrientationMap[cornerIndex];
			if (oriA < 3 && oriB < 3) {
				// Two regular cubes
				newOrientation = oriA + oriB;
				if (newOrientation >= 3) {
					newOrientation -= 3;
				}
			} else if (oriA < 3 && oriB >= 3) {
				// Cube B is in a mirrored state
				newOrientation = oriA + oriB;
				if (newOrientation >= 6) {
					newOrientation -= 3; // The composition also is in a mirrored state
				}
			} else if (oriA >= 3 && oriB < 3) {
				// Cube A is in a mirrored state
				newOrientation = oriA - oriB;
				if (newOrientation < 3) {
					newOrientation += 3; // The composition is a mirrored cube
				}
			} else if (oriA >= 3 && oriB >= 3) {
				// Both cubes are in mirrored states
				newOrientation = oriA - oriB;
				if (newOrientation < 0) {
					newOrientation += 3; // The composition is a regular cube
				}
			}
			newCornerOrientations.push(newOrientation as CornerOrientation);
		}
		this.cornerPermutations = newCornerPermutations;
		this.cornerOrientations = newCornerOrientations;
	}

	// Multiply this `Cube` object with another cube, restricted to the edges. Does not change the other cube.
	edgeMultiply(edgePermutationMap: EdgePermutationMap, edgeOrientationMap: EdgeOrientationMap) {
		const newEdgePermutations = [];
		const newEdgeOrientations: EdgeOrientation[] = [];
		for (const edgeIndex in EDGES) {
			const newIndex = edgePermutationMap[edgeIndex];
			newEdgePermutations.push(this.edgePermutations[newIndex]);
			newEdgeOrientations.push(
				((edgeOrientationMap[edgeIndex] + this.edgeOrientations[newIndex]) % 2) as EdgeOrientation
			);
		}
		this.edgePermutations = newEdgePermutations;
		this.edgeOrientations = newEdgeOrientations;
	}

	// Multiply this `Cube` object with another cube. Does not change the other cube.
	multiply(
		cornerPermutationMap: CornerPermutationMap,
		cornerOrientationMap: CornerOrientationMap,
		edgePermutationMap: EdgePermutationMap,
		edgeOrientationMap: EdgeOrientationMap
	) {
		this.cornerMultiply(cornerPermutationMap, cornerOrientationMap);
		this.edgeMultiply(edgePermutationMap, edgeOrientationMap);
	}

	// Updates the cube state to apply any changes caused by rotating one face
	applyMove(move: Move) {
		let cornerPermutationMap: CornerPermutationMap = [0, 1, 2, 3, 4, 5, 6, 7];
		let cornerOrientationMap: CornerOrientationMap = [0, 0, 0, 0, 0, 0, 0, 0];
		let edgePermutationMap: EdgePermutationMap = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
		let edgeOrientationMap: EdgeOrientationMap = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
		if (move[0] == 'U') {
			// A 'U' move only rotates the permutation of the top 4 edges and corners
			// Orientation of all pieces are not affected
			cornerPermutationMap = [3, 0, 1, 2, 4, 5, 6, 7];
			edgePermutationMap = [3, 0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11];
		} else if (move[0] == 'R') {
			// An 'R' move affects the right for edges and corners
			// Edge orientation is not changed by
			cornerPermutationMap = [4, 1, 2, 0, 7, 5, 6, 3];
			cornerOrientationMap = [2, 0, 0, 1, 1, 0, 0, 2];
			edgePermutationMap = [8, 1, 2, 3, 11, 5, 6, 7, 4, 9, 10, 0];
		} else if (move[0] == 'F') {
			cornerPermutationMap = [1, 5, 2, 3, 0, 4, 6, 7];
			cornerOrientationMap = [1, 2, 0, 0, 2, 1, 0, 0];
			edgePermutationMap = [0, 9, 2, 3, 4, 8, 6, 7, 1, 5, 10, 11];
			edgeOrientationMap = [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0];
		} else if (move[0] == 'D') {
			cornerPermutationMap = [0, 1, 2, 3, 5, 6, 7, 4];
			edgePermutationMap = [0, 1, 2, 3, 5, 6, 7, 4, 8, 9, 10, 11];
		} else if (move[0] == 'L') {
			cornerPermutationMap = [0, 2, 6, 3, 4, 1, 5, 7];
			cornerOrientationMap = [0, 1, 2, 0, 0, 2, 1, 0];
			edgePermutationMap = [0, 1, 10, 3, 4, 5, 9, 7, 8, 2, 6, 11];
		} else if (move[0] == 'B') {
			cornerPermutationMap = [0, 1, 3, 7, 4, 5, 2, 6];
			cornerOrientationMap = [0, 0, 1, 2, 0, 0, 2, 1];
			edgePermutationMap = [0, 1, 2, 11, 4, 5, 6, 10, 8, 9, 3, 7];
			edgeOrientationMap = [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1];
		}
		this.multiply(
			cornerPermutationMap,
			cornerOrientationMap,
			edgePermutationMap,
			edgeOrientationMap
		);
		if (move[1] == '2' || move[1] == "'") {
			this.multiply(
				cornerPermutationMap,
				cornerOrientationMap,
				edgePermutationMap,
				edgeOrientationMap
			);
		}
		if (move[1] == "'") {
			this.multiply(
				cornerPermutationMap,
				cornerOrientationMap,
				edgePermutationMap,
				edgeOrientationMap
			);
		}
	}

	// Gets the corners of the current cube state by color value at face position in Spefz notation
	getCornerFaces() {
		const cornerFaces: any = {};
		for (const cornerIndex in this.cornerPermutations) {
			const currentPermutation: Corner = this.cornerPermutations[cornerIndex];
			const currentOrientation: CornerOrientation = this.cornerOrientations[cornerIndex];

			for (let twistIndex = 0; twistIndex < 3; twistIndex++) {
				const faceLetter = this.cornerFaceMap[cornerIndex][
					(twistIndex + currentOrientation) % 3
				] as Face;
				cornerFaces[faceLetter] = currentPermutation[twistIndex];
			}
		}
		return cornerFaces as Record<SquareKey, Face>;
	}

	// Gets the edges of the current cube state by color value at face position in Spefz notation
	getEdgeFaces() {
		const edgeFaces: any = {};
		for (const edgeIndex in this.edgePermutations) {
			const currentPermutation: Edge = this.edgePermutations[edgeIndex];
			const currentOrientation: EdgeOrientation = this.edgeOrientations[edgeIndex];
			for (let flipIndex = 0; flipIndex < 2; flipIndex++) {
				const faceLetter = this.edgeFaceMap[edgeIndex][
					(flipIndex + currentOrientation) % 2
				] as Face;
				edgeFaces[faceLetter] = currentPermutation[flipIndex];
			}
		}
		return edgeFaces as Record<SquareKey, Face>;
	}
}
