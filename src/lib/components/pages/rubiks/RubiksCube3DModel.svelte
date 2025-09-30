<script module lang="ts">
	// Right, left, up, down, front, and back
	export type Direction = 'R' | 'L' | 'U' | 'D' | 'F' | 'B';
	// prettier-ignore
	export type Move = 'R' | "R'" | 'R2' | 'L' | "L'" | 'L2' | 'U' | "U'" | 'U2' | 'D' | "D'" | 'D2' | 'F' | "F'" | 'F2' | 'B' | "B'" | 'B2';
</script>

<script lang="ts">
	/**
	 * WebGL code to render a 3d Rubik's cube
	 *
	 * Used to display a single rotation or
	 * display a given state and animate moves
	 * In the future, will allow for more options and intractability
	 *
	 * Used by `RubiksInteractableCubeModal.svelte` to display an interactable cube that can have moves applied and be reset
	 * Used by `RubiksScrambleGuideModal.svelte` to rotate a specific face
	 * Used by `RubiksScrambleWalkthroughModal.svelte` to be given a specific scramble and index of that scramble to perform
	 */

	import { onMount } from 'svelte';

	import { dictionary } from '$lib/stores/languageDictionary';
	import Cube, { type Piece } from '$lib/util/rubiksCube';

	interface Props {
		move?: Move | null; // The move to animate
		target_angle?: number; // The angle at which to stop the rotation animation
		current_angle?: number; // How far along the rotation to display
		velocity?: number; // How much to change the angle per animation frame
		scramble?: Move[]; // A sequence of scramble moves that can be passed in from
	}

	let {
		move = $bindable(null),
		target_angle = $bindable(-1),
		current_angle = $bindable(0),
		velocity = $bindable(0.0),
		scramble = []
	}: Props = $props();
	let scramble_move_index: number = 0; // Keeps track of the current progress within the scramble string
	const input_move_queue: Move[] = []; // Keeps track of moves to apply to cube state
	let reset_cube_flag: boolean = false; // Keeps track of request to reset cube to original state

	let webgl_error = $state(false);

	/**
	 * Exported functions
	 *
	 * Functions called from consumers that use `<RubiksCube3DModel/>` to set moves and reset cube
	 */

	// Can be called from parent to set the progress within the scramble string
	export function set_scramble_move_index(index: number) {
		scramble_move_index = index;
	}

	// Can be called from parent to set apply single move to cube state
	export function input_move(move: Move) {
		input_move_queue.push(move);
	}

	// Can be called from parent to clear all input moves to revert to original cube state
	export function reset_cube() {
		reset_cube_flag = true;
	}

	let canvas = $state() as HTMLCanvasElement;

	/**
	 * Vertex and fragment shaders
	 *
	 * Code to run on the GPU kernel - `vertexShaderText` and `fragmentShaderText`
	 */

	// Defines vertices for shapes
	const vertexShaderText = [
		'precision mediump float;', // Sets all floats in this kernel to medium precision (`mediump`)
		'', // Below we define variables available to the kernel
		'attribute vec3 vertex_position;', // x,y,z values of each vertex
		'attribute vec3 vertex_color;', // Defines which faces to color how much
		'varying vec3 fragment_color;', // Passed to fragment shader
		'uniform mat3 input_color;', // Unique RGB color for a piece
		'uniform mat4 m_piece;', // Per piece transformation
		'uniform mat4 m_face;', // Face rotation
		'uniform mat4 m_world;', // World orientation
		'uniform mat4 m_view;', // Camera orientation
		'uniform mat4 m_proj;', // Projection
		'',
		'void main()',
		'{', // Calculates color and position. `gl_Position` is an openGL variable name
		'  fragment_color = input_color * vertex_color;',
		'  gl_Position = m_proj * m_view * m_world * m_face * m_piece * vec4(vertex_position, 1.0);',
		'}'
	].join('\n');

	// Interpolation of all pixels between defined vertices
	const fragmentShaderText = [
		'precision mediump float;',
		'',
		'varying vec3 fragment_color;',
		'void main()',
		'{', // Shades the color
		'  gl_FragColor = vec4(fragment_color, 1.0);',
		'}'
	].join('\n');

	/**
	 * Box vertices and indices
	 */

	/**
	 * Generic cube vertices (reused for all 26 cubes and overrriden)
	 *
	 * Each cube has 6 faces (commented below)
	 * Each square has 24 values
	 * Each square has 4 vertices and each vertex has 6 attributes (two vec3 `attribute`s above).
	 * 3 are for position and 3 are for color
	 * 4 vertices * 6 attributes = 24 values
	 */
	const boxVertices = [
		// Up
		-1.0, 1.0, -1.0, 1.0, 0.0, 0.0, -1.0, 1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 0.0, 0.0,
		1.0, 1.0, -1.0, 1.0, 0.0, 0.0,
		// Left
		-1.0, 1.0, 1.0, 0.0, 1.0, 0.0, -1.0, -1.0, 1.0, 0.0, 1.0, 0.0, -1.0, -1.0, -1.0, 0.0, 1.0, 0.0,
		-1.0, 1.0, -1.0, 0.0, 1.0, 0.0,
		// Right
		1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, -1.0, -1.0, 0.0, 0.0, 0.0,
		1.0, 1.0, -1.0, 0.0, 0.0, 0.0,
		// Front
		1.0, 1.0, 1.0, 0.0, 0.0, 1.0, 1.0, -1.0, 1.0, 0.0, 0.0, 1.0, -1.0, -1.0, 1.0, 0.0, 0.0, 1.0,
		-1.0, 1.0, 1.0, 0.0, 0.0, 1.0,
		// Back
		1.0, 1.0, -1.0, 0.0, 0.0, 0.0, 1.0, -1.0, -1.0, 0.0, 0.0, 0.0, -1.0, -1.0, -1.0, 0.0, 0.0, 0.0,
		-1.0, 1.0, -1.0, 0.0, 0.0, 0.0,
		// Down
		-1.0, -1.0, -1.0, 0.0, 0.0, 0.0, -1.0, -1.0, 1.0, 0.0, 0.0, 0.0, 1.0, -1.0, 1.0, 0.0, 0.0, 0.0,
		1.0, -1.0, -1.0, 0.0, 0.0, 0.0
	];

	/**
	 * Indices of `boxVertices` array to be used for a generic cube
	 *
	 * Each cube has 6 faces defined below
	 * Each cube is made of 2 triangles which each have 3 vertices
	 * Of the 6 values, there will be 4 unique since 2 will be shared vertices
	 *
	 * Note: order matters and affects what's inside vs outside the triangle
	 * Eg. `0,2,3` is different from `0,3,2`
	 */
	const boxIndices = [
		// Up
		0, 1, 2, 0, 2, 3,
		// Left
		5, 4, 6, 6, 4, 7,
		// Right
		8, 9, 10, 8, 10, 11,
		// Front
		13, 12, 14, 15, 14, 12,
		// Back
		16, 17, 18, 16, 18, 19,
		// Down
		21, 20, 22, 22, 20, 23
	];

	/**
	 * Loaders
	 *
	 * Load shaders, program, buffers, attributes
	 */

	// Loads kernels defined above - `vertexShaderText` and `fragmentShaderText`
	function load_shaders(gl: WebGLRenderingContext) {
		const vertexShader = gl.createShader(gl.VERTEX_SHADER);
		const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

		if (vertexShader !== null && fragmentShader !== null) {
			gl.shaderSource(vertexShader, vertexShaderText);
			gl.shaderSource(fragmentShader, fragmentShaderText);

			gl.compileShader(vertexShader);
			if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
				console.error('ERROR compiling vertex shader!', gl.getShaderInfoLog(vertexShader));
				return null;
			}
			gl.compileShader(fragmentShader);
			if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
				console.error('ERROR compiling fragment shader!', gl.getShaderInfoLog(fragmentShader));
				return null;
			}
			return [vertexShader, fragmentShader];
		}
	}

	// Run the two shaders defined above
	function load_program(gl: WebGLRenderingContext, shaders: WebGLShader[]) {
		const program = gl.createProgram();
		if (program !== null && shaders !== null) {
			gl.attachShader(program, shaders[0]);
			gl.attachShader(program, shaders[1]);
			gl.linkProgram(program);
			if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
				console.error('ERROR linking program!', gl.getProgramInfoLog(program));
				return null;
			}
			gl.validateProgram(program);
			if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
				console.error('ERROR validating program!', gl.getProgramInfoLog(program));
				return null;
			}
			return program;
		}
	}

	// Gets `vertexShaderText` and `fragmentShaderText` JS values, allocates space on the GPU, then puts them in the GPU
	// Returns their handles (identifiers to reference a specific buffer) so we can use them
	function load_buffers(gl: WebGLRenderingContext) {
		const box_vertex_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, box_vertex_buffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(boxVertices), gl.STATIC_DRAW);

		const box_index_buffer = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, box_index_buffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(boxIndices), gl.STATIC_DRAW);
		return [box_vertex_buffer, box_index_buffer];
	}

	// Defines attributes for vertex color and position in kernel (defines how space will be allocated for each vertex)
	function load_attributes(gl: WebGLRenderingContext, program: WebGLProgram) {
		const position_handle = gl.getAttribLocation(program, 'vertex_position');
		const color_handle = gl.getAttribLocation(program, 'vertex_color');
		gl.vertexAttribPointer(
			position_handle,
			3,
			gl.FLOAT,
			false,
			6 * Float32Array.BYTES_PER_ELEMENT,
			0
		);
		gl.vertexAttribPointer(
			color_handle,
			3,
			gl.FLOAT,
			false,
			6 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(position_handle);
		gl.enableVertexAttribArray(color_handle);
		return [position_handle, color_handle];
	}

	/**
	 * Matrix math
	 *
	 * Utility functions for matrix rotation, translation, multiplication
	 */

	// Rotates in_matrix by angle theta along the X axis, populating the result in out_matrix
	function matrix_rotate_x(out_matrix: Float32Array, in_matrix: Float32Array, theta: number) {
		// 3D rotation along x axis is accomplished by multiplying input (in_matrix) with the following matrix
		// [1    0       0      0]
		// [0  cos(t)  -sin(t)  0]
		// [0  sin(t)  cos(t)   0]
		// [0    0       0      1]
		// where t = theta
		const sin_theta = Math.sin(theta);
		const cos_theta = Math.cos(theta);
		// 1st row (x axis) should remain unchaged for x rotation
		out_matrix[0] = in_matrix[0];
		out_matrix[1] = in_matrix[1];
		out_matrix[2] = in_matrix[2];
		out_matrix[3] = in_matrix[3];
		// 2nd row (y axis) is evaluated as dot products, or weighted sums of input column values, where weights are cos/sin of desired angle
		out_matrix[4] = in_matrix[4] * cos_theta + in_matrix[8] * sin_theta;
		out_matrix[5] = in_matrix[5] * cos_theta + in_matrix[9] * sin_theta;
		out_matrix[6] = in_matrix[6] * cos_theta + in_matrix[10] * sin_theta;
		out_matrix[7] = in_matrix[7] * cos_theta + in_matrix[11] * sin_theta;
		// 3rd row (z axis) is evaluated as dot products, or weighted sums of input column values, where weights are cos/sin of desired angle
		out_matrix[8] = in_matrix[8] * cos_theta - in_matrix[4] * sin_theta;
		out_matrix[9] = in_matrix[9] * cos_theta - in_matrix[5] * sin_theta;
		out_matrix[10] = in_matrix[10] * cos_theta - in_matrix[6] * sin_theta;
		out_matrix[11] = in_matrix[11] * cos_theta - in_matrix[7] * sin_theta;
		// 4th row (translation channel) should remain unchaged
		out_matrix[12] = in_matrix[12];
		out_matrix[13] = in_matrix[13];
		out_matrix[14] = in_matrix[14];
		out_matrix[15] = in_matrix[15];
		return out_matrix;
	}

	// Rotates in_matrix by angle theta along the Y axis, populating the result in out_matrix
	function matrix_rotate_y(out_matrix: Float32Array, in_matrix: Float32Array, theta: number) {
		// 3D rotation along y axis is accomplished by multiplying input (in_matrix) with the following matrix
		// [ cos(t)  0  sin(t)  0]
		// [  0      1    0     0]
		// [-sin(t)  0  cos(t)  0]
		// [  0      0    0     1]
		// where t = theta
		const sin_theta = Math.sin(theta);
		const cos_theta = Math.cos(theta);
		// 1st row (x axis) is evaluated as dot products, or weighted sums of input column values, where weights are cos/sin of desired angle
		out_matrix[0] = in_matrix[0] * cos_theta - in_matrix[8] * sin_theta;
		out_matrix[1] = in_matrix[1] * cos_theta - in_matrix[9] * sin_theta;
		out_matrix[2] = in_matrix[2] * cos_theta - in_matrix[10] * sin_theta;
		out_matrix[3] = in_matrix[3] * cos_theta - in_matrix[11] * sin_theta;
		// 2nd row (7 axis) should remain unchaged for x rotation
		out_matrix[4] = in_matrix[4];
		out_matrix[5] = in_matrix[5];
		out_matrix[6] = in_matrix[6];
		out_matrix[7] = in_matrix[7];
		// 3rd row (z axis) is evaluated as dot products, or weighted sums of input column values, where weights are cos/sin of desired angle
		out_matrix[8] = in_matrix[8] * cos_theta + in_matrix[0] * sin_theta;
		out_matrix[9] = in_matrix[9] * cos_theta + in_matrix[1] * sin_theta;
		out_matrix[10] = in_matrix[10] * cos_theta + in_matrix[2] * sin_theta;
		out_matrix[11] = in_matrix[11] * cos_theta + in_matrix[3] * sin_theta;
		// 4th row (translation channel) should remain unchaged
		out_matrix[12] = in_matrix[12];
		out_matrix[13] = in_matrix[13];
		out_matrix[14] = in_matrix[14];
		out_matrix[15] = in_matrix[15];
		return out_matrix;
	}

	// Rotates in_matrix by angle theta along the Y axis, populating the result in out_matrix
	function matrix_rotate_z(out_matrix: Float32Array, in_matrix: Float32Array, theta: number) {
		// 3D rotation along z axis is accomplished by multiplying input (in_matrix) with the following matrix
		// [cos(t)  -sin(t)  0  0]
		// [sin(t)  cos(t)   0  0]
		// [  0        0     0  0]
		// [  0        0     0  1]
		// where t = theta
		const sin_theta = Math.sin(theta);
		const cos_theta = Math.cos(theta);
		// 1st row (x axis) is evaluated as dot products, or weighted sums of input column values, where weights are cos/sin of desired angle
		out_matrix[0] = in_matrix[0] * cos_theta + in_matrix[4] * sin_theta;
		out_matrix[1] = in_matrix[1] * cos_theta + in_matrix[5] * sin_theta;
		out_matrix[2] = in_matrix[2] * cos_theta + in_matrix[6] * sin_theta;
		out_matrix[3] = in_matrix[3] * cos_theta + in_matrix[7] * sin_theta;
		// 2nd row (y axis) is evaluated as dot products, or weighted sums of input column values, where weights are cos/sin of desired angle
		out_matrix[4] = in_matrix[4] * cos_theta - in_matrix[0] * sin_theta;
		out_matrix[5] = in_matrix[5] * cos_theta - in_matrix[1] * sin_theta;
		out_matrix[6] = in_matrix[6] * cos_theta - in_matrix[2] * sin_theta;
		out_matrix[7] = in_matrix[7] * cos_theta - in_matrix[3] * sin_theta;
		// 3rd row (z axis) should remain unchaged for x rotation
		out_matrix[8] = in_matrix[8];
		out_matrix[9] = in_matrix[9];
		out_matrix[10] = in_matrix[10];
		out_matrix[11] = in_matrix[11];
		// 4th row (translation channel) should remain unchaged
		out_matrix[12] = in_matrix[12];
		out_matrix[13] = in_matrix[13];
		out_matrix[14] = in_matrix[14];
		out_matrix[15] = in_matrix[15];
		return out_matrix;
	}

	// Performs a matrix translation operation upon input matrix, described by translation vector, returning the transformed matrix
	function matrix_translate(matrix: Float32Array, translation_vector: number[]) {
		matrix[12] +=
			matrix[0] * translation_vector[0] +
			matrix[4] * translation_vector[1] +
			matrix[8] * translation_vector[2];
		matrix[13] +=
			matrix[1] * translation_vector[0] +
			matrix[5] * translation_vector[1] +
			matrix[9] * translation_vector[2];
		matrix[14] +=
			matrix[2] * translation_vector[0] +
			matrix[6] * translation_vector[1] +
			matrix[10] * translation_vector[2];
		matrix[15] +=
			matrix[3] * translation_vector[0] +
			matrix[7] * translation_vector[1] +
			matrix[11] * translation_vector[2];
		return matrix;
	}

	// Performs a matrix multiplication operation between in_matrix_a * in_matrix_b, with the resulting product populting out_matrix
	function matrix_multiply(
		out_matrix: Float32Array,
		in_matrix_a: Float32Array,
		in_matrix_b: Float32Array
	) {
		// A general matrix multiplication is basically a bunch of dot products

		// 1st row (x axis) is evaluated as dot products of matrix_a columns . 1st row of matrix_b
		out_matrix[0] =
			in_matrix_a[0] * in_matrix_b[0] +
			in_matrix_a[4] * in_matrix_b[1] +
			in_matrix_a[8] * in_matrix_b[2] +
			in_matrix_a[12] * in_matrix_b[3];
		out_matrix[1] =
			in_matrix_a[1] * in_matrix_b[0] +
			in_matrix_a[5] * in_matrix_b[1] +
			in_matrix_a[9] * in_matrix_b[2] +
			in_matrix_a[13] * in_matrix_b[3];
		out_matrix[2] =
			in_matrix_a[2] * in_matrix_b[0] +
			in_matrix_a[6] * in_matrix_b[1] +
			in_matrix_a[10] * in_matrix_b[2] +
			in_matrix_a[14] * in_matrix_b[3];
		out_matrix[3] =
			in_matrix_a[3] * in_matrix_b[0] +
			in_matrix_a[7] * in_matrix_b[1] +
			in_matrix_a[11] * in_matrix_b[2] +
			in_matrix_a[15] * in_matrix_b[3];

		// 2nd row (y axis) is evaluated as dot products of matrix_a columns . 2nd row of matrix_b
		out_matrix[4] =
			in_matrix_a[0] * in_matrix_b[4] +
			in_matrix_a[4] * in_matrix_b[5] +
			in_matrix_a[8] * in_matrix_b[6] +
			in_matrix_a[12] * in_matrix_b[7];
		out_matrix[5] =
			in_matrix_a[1] * in_matrix_b[4] +
			in_matrix_a[5] * in_matrix_b[5] +
			in_matrix_a[9] * in_matrix_b[6] +
			in_matrix_a[13] * in_matrix_b[7];
		out_matrix[6] =
			in_matrix_a[2] * in_matrix_b[4] +
			in_matrix_a[6] * in_matrix_b[5] +
			in_matrix_a[10] * in_matrix_b[6] +
			in_matrix_a[14] * in_matrix_b[7];
		out_matrix[7] =
			in_matrix_a[3] * in_matrix_b[4] +
			in_matrix_a[7] * in_matrix_b[5] +
			in_matrix_a[11] * in_matrix_b[6] +
			in_matrix_a[15] * in_matrix_b[7];

		// 3rd row (z axis) is evaluated as dot products of matrix_a columns . 2nd row of matrix_b
		out_matrix[8] =
			in_matrix_a[0] * in_matrix_b[8] +
			in_matrix_a[4] * in_matrix_b[9] +
			in_matrix_a[8] * in_matrix_b[10] +
			in_matrix_a[12] * in_matrix_b[11];
		out_matrix[9] =
			in_matrix_a[1] * in_matrix_b[8] +
			in_matrix_a[5] * in_matrix_b[9] +
			in_matrix_a[9] * in_matrix_b[10] +
			in_matrix_a[13] * in_matrix_b[11];
		out_matrix[10] =
			in_matrix_a[2] * in_matrix_b[8] +
			in_matrix_a[6] * in_matrix_b[9] +
			in_matrix_a[10] * in_matrix_b[10] +
			in_matrix_a[14] * in_matrix_b[11];
		out_matrix[11] =
			in_matrix_a[3] * in_matrix_b[8] +
			in_matrix_a[7] * in_matrix_b[9] +
			in_matrix_a[11] * in_matrix_b[10] +
			in_matrix_a[15] * in_matrix_b[11];

		// 4th row (alpha channel) is evaluated as dot products of matrix_a columns . 2nd row of matrix_b
		out_matrix[12] =
			in_matrix_a[0] * in_matrix_b[12] +
			in_matrix_a[4] * in_matrix_b[13] +
			in_matrix_a[8] * in_matrix_b[14] +
			in_matrix_a[12] * in_matrix_b[15];
		out_matrix[13] =
			in_matrix_a[1] * in_matrix_b[12] +
			in_matrix_a[5] * in_matrix_b[13] +
			in_matrix_a[9] * in_matrix_b[14] +
			in_matrix_a[13] * in_matrix_b[15];
		out_matrix[14] =
			in_matrix_a[2] * in_matrix_b[12] +
			in_matrix_a[6] * in_matrix_b[13] +
			in_matrix_a[10] * in_matrix_b[14] +
			in_matrix_a[14] * in_matrix_b[15];
		out_matrix[15] =
			in_matrix_a[3] * in_matrix_b[12] +
			in_matrix_a[7] * in_matrix_b[13] +
			in_matrix_a[11] * in_matrix_b[14] +
			in_matrix_a[15] * in_matrix_b[15];

		return out_matrix;
	}

	// Calcuate a view matrix that forms an orthonormal basis relative the the viewer's perspective of the target object
	function matrix_look_at(out: Float32Array, eye: number[], center: number[], global_up: number[]) {
		const EPSILON = 0.000001;

		if (
			Math.abs(eye[0] - center[0]) < EPSILON &&
			Math.abs(eye[1] - center[1]) < EPSILON &&
			Math.abs(eye[2] - center[2]) < EPSILON
		) {
			return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
		}

		// The forward vector describes the path from the eye to the center point of the view
		let forward_x = eye[0] - center[0];
		let forward_y = eye[1] - center[1];
		let forward_z = eye[2] - center[2];

		// Divide by the Euclidian distance to normalize to unit length
		const inv_forward_distance =
			1 / Math.sqrt(forward_x * forward_x + forward_y * forward_y + forward_z * forward_z);
		forward_x *= inv_forward_distance;
		forward_y *= inv_forward_distance;
		forward_z *= inv_forward_distance;

		// Apply cross product of forward vector and global up vector to determine the right vector as the vector perpendecular to both
		let right_x = global_up[1] * forward_z - global_up[2] * forward_y;
		let right_y = global_up[2] * forward_x - global_up[0] * forward_z;
		let right_z = global_up[0] * forward_y - global_up[1] * forward_x;
		// Again, divide by the Euclidian distance to normalize to unit length
		let inv_right_distance = Math.sqrt(right_x * right_x + right_y * right_y + right_z * right_z);
		if (!inv_right_distance) {
			right_x = 0;
			right_y = 0;
			right_z = 0;
		} else {
			inv_right_distance = 1 / inv_right_distance;
			right_x *= inv_right_distance;
			right_y *= inv_right_distance;
			right_z *= inv_right_distance;
		}

		// Apply cross product again of forward and right vectors to find up relative to the view, these form an orthonormal basis
		let up_x = forward_y * right_z - forward_z * right_y;
		let up_y = forward_z * right_x - forward_x * right_z;
		let up_z = forward_x * right_y - forward_y * right_x;

		// Again, divide by the Euclidian distance to normalize to unit length
		let inv_up_distance = Math.sqrt(up_x * up_x + up_y * up_y + up_z * up_z);
		if (!inv_up_distance) {
			up_x = 0;
			up_y = 0;
			up_z = 0;
		} else {
			inv_up_distance = 1 / inv_up_distance;
			up_x *= inv_up_distance;
			up_y *= inv_up_distance;
			up_z *= inv_up_distance;
		}

		// Apply dot products to get the amount to translate in newly calculated orthonormal basis
		const translation_x = right_x * eye[0] + right_y * eye[1] + right_z * eye[2]; // Positive X is in the right direction relative to the viewer
		const translation_y = up_x * eye[0] + up_y * eye[1] + up_z * eye[2]; // Positive Y is in the up direction relative to the viewer
		const translation_z = forward_x * eye[0] + forward_y * eye[1] + forward_z * eye[2]; // Poxitive Z is in the forward direction relative to the viewer

		out[0] = right_x;
		out[1] = up_x;
		out[2] = forward_x;
		out[3] = 0;
		out[4] = right_y;
		out[5] = up_y;
		out[6] = forward_y;
		out[7] = 0;
		out[8] = right_z;
		out[9] = up_z;
		out[10] = forward_z;
		out[11] = 0;
		out[12] = -translation_x;
		out[13] = -translation_y;
		out[14] = -translation_z;
		out[15] = 1;

		return out;
	}

	// Apply perspective transformation according to field of view, aspect ratio, and depth bounds
	function matrix_perspective(
		out: Float32Array,
		vertical_field_of_view: number,
		aspect_ratio: number,
		near_bound: number,
		far_bound: number
	) {
		const y_scale = 1.0 / Math.tan(vertical_field_of_view / 2);
		const inv_depth_range = 1 / (near_bound - far_bound);
		out[0] = y_scale / aspect_ratio;
		out[1] = 0;
		out[2] = 0;
		out[3] = 0;
		out[4] = 0;
		out[5] = y_scale;
		out[6] = 0;
		out[7] = 0;
		out[8] = 0;
		out[9] = 0;
		out[10] = (far_bound + near_bound) * inv_depth_range;
		out[11] = -1;
		out[12] = 0;
		out[13] = 0;
		out[14] = 2 * far_bound * near_bound * inv_depth_range;
		out[15] = 0;
		return out;
	}

	/**
	 * Main
	 *
	 * Core logic that runs on page load
	 */

	function main() {
		// Set canvas width and height to container
		// @link https://stackoverflow.com/a/10215724/4907950
		canvas.style.width = '100%';
		canvas.style.height = '100%';
		canvas.width = canvas.offsetWidth;
		canvas.height = canvas.offsetHeight;

		// A virtual representation of the cube that moves can be applied to
		const cube = new Cube();

		scramble.forEach((m) => cube.applyMove(m as Move));
		let current_scramble_index = scramble.length;

		// Initialize the GL context
		const gl = (canvas.getContext('webgl') ||
			canvas.getContext('experimental-webgl') ||
			canvas.getContext('moz-webgl') ||
			canvas.getContext('webkit-3d')) as WebGLRenderingContext | null;

		// Only continue if WebGL is available and working
		// Change to `!==` to test error state
		if (gl === null) {
			webgl_error = true;
			return;
		}

		// Set viewport
		// Avoid putting `viewportWidth` and `viewportHeight` on the `WebGLRenderingContext`
		// @link https://webglfundamentals.org/webgl/lessons/webgl-anti-patterns
		gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

		// Set the clear color to black, fully opaque
		gl.clearColor(0.0, 0.0, 0.0, 1.0);
		// Clear the color buffer with specified clear color
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Optimizations
		gl.enable(gl.DEPTH_TEST); // Avoid drawing objects behind other objects or very far away
		gl.enable(gl.CULL_FACE); // Only calculate the visible side of the face (each triangle has two faces)

		gl.frontFace(gl.CCW); // Defines the front of the triangle face as counter-clockwise vertices
		gl.cullFace(gl.BACK); // Cull the back face using `CULL_FACE`

		// Shaders
		const shaders = load_shaders(gl);
		if (shaders == null) {
			webgl_error = true;
			return;
		}
		const program = load_program(gl, shaders);
		if (program == null) {
			webgl_error = true;
			return;
		}

		// Buffers
		load_buffers(gl);
		// Attributes
		load_attributes(gl, program);
		// Start GL program
		gl.useProgram(program);

		// Get handles to transformation matrices that will be used in the WebGL kernel
		// References to uniform variables in GPU - updated from JS local values below
		const color_vector_handle = gl.getUniformLocation(program, 'input_color');
		const world_matrix_handle = gl.getUniformLocation(program, 'm_world');
		const piece_matrix_handle = gl.getUniformLocation(program, 'm_piece');
		const face_matrix_handle = gl.getUniformLocation(program, 'm_face');
		const view_matrix_handle = gl.getUniformLocation(program, 'm_view');
		const projection_matrix_handle = gl.getUniformLocation(program, 'm_proj');

		const identity_matrix = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
		const field_of_view_radians = 0.785398; //45 degrees in radians

		// Allocate JS array counterparts to above matrices that we can modify locally
		// Local copies of the variables above - manipulated in JS and passed to above handles
		const world_matrix_local = new Float32Array(16);
		const piece_matrix_local = new Float32Array(16);
		const face_matrix_local = new Float32Array(16);
		const view_matrix_local = new Float32Array(16);
		const projection_matrix_local = new Float32Array(16);

		// Initialize face, piece, and world matrices with no transformations
		face_matrix_local.set(identity_matrix);
		piece_matrix_local.set(identity_matrix);
		world_matrix_local.set(identity_matrix);

		// 3 arrays are: 1. camera position, 2. camera points to (translation), 3. which direction is up (rotation)
		// Position `[10, 10` allows visibility of other faces and -10 is 10 units back (so we aren't inside the cube)
		// Camera pointing to `[0,0,0]` means it's pointed at the origin
		// Up direction of `[0,1,0]` defines Y as straight up in the coordinate system
		matrix_look_at(view_matrix_local, [10, 10, -10], [0, 0, 0], [0, 1, 0]);
		matrix_perspective(
			// Defines projection area (a cone)
			projection_matrix_local,
			field_of_view_radians,
			// Aspect ratio
			canvas.clientWidth / canvas.clientHeight,
			// Near and far clip distances
			0.1,
			1000.0
		);

		// Send locally set values for matrices to corresponding WebGL locations (send JS values to GPU)
		gl.uniformMatrix3fv(color_vector_handle, false, [0, 0, 0, 0, 0, 0, 0, 0, 0]);
		gl.uniformMatrix4fv(world_matrix_handle, false, world_matrix_local);
		gl.uniformMatrix4fv(face_matrix_handle, false, face_matrix_local);
		gl.uniformMatrix4fv(view_matrix_handle, false, view_matrix_local);
		gl.uniformMatrix4fv(projection_matrix_handle, false, projection_matrix_local);

		// Transformation matrices
		const x_rotation_matrix = new Float32Array(16);
		const y_rotation_matrix = new Float32Array(16);

		type Layer = {
			edges: number[];
			corners: number[];
			center: number;
		};

		// Mapping of which pieces are in which layer
		const layer_map = {
			U: { edges: [0, 1, 2, 3], corners: [0, 1, 2, 3], center: 0 },
			D: { edges: [4, 5, 6, 7], corners: [4, 5, 6, 7], center: 5 },
			R: { edges: [0, 4, 8, 11], corners: [0, 3, 4, 7], center: 3 },
			L: { edges: [2, 6, 9, 10], corners: [1, 2, 5, 6], center: 4 },
			F: { edges: [1, 5, 8, 9], corners: [0, 1, 4, 5], center: 1 },
			B: { edges: [3, 7, 10, 11], corners: [2, 3, 6, 7], center: 2 }
		} as Record<Direction, Layer>;

		// Same as `colorMap` in `RubiksScrambleMap.svelte`
		const colorRGB = {
			white: [1, 1, 1],
			green: [0.09, 0.64, 0.29],
			blue: [0.15, 0.39, 0.92],
			red: [0.86, 0.15, 0.15],
			orange: [0.98, 0.45, 0.09],
			yellow: [0.98, 0.8, 0.08]
		};

		// Mapping of piece names to color matrices (3 colors for 3 faces) to pass to kernel
		const color_map = {
			W: [...colorRGB.white, 0, 0, 0, 0, 0, 0],
			G: [...colorRGB.green, 0, 0, 0, 0, 0, 0],
			B: [...colorRGB.blue, 0, 0, 0, 0, 0, 0],
			R: [...colorRGB.red, 0, 0, 0, 0, 0, 0],
			O: [...colorRGB.orange, 0, 0, 0, 0, 0, 0],
			Y: [...colorRGB.yellow, 0, 0, 0, 0, 0, 0],
			WR: [...colorRGB.white, ...colorRGB.red, 0, 0, 0],
			WG: [...colorRGB.white, ...colorRGB.green, 0, 0, 0],
			WO: [...colorRGB.white, ...colorRGB.orange, 0, 0, 0],
			WB: [...colorRGB.white, ...colorRGB.blue, 0, 0, 0],
			YR: [...colorRGB.yellow, ...colorRGB.red, 0, 0, 0],
			YG: [...colorRGB.yellow, ...colorRGB.green, 0, 0, 0],
			YO: [...colorRGB.yellow, ...colorRGB.orange, 0, 0, 0],
			YB: [...colorRGB.yellow, ...colorRGB.blue, 0, 0, 0],
			GR: [...colorRGB.green, ...colorRGB.red, 0, 0, 0],
			GO: [...colorRGB.green, ...colorRGB.orange, 0, 0, 0],
			BO: [...colorRGB.blue, ...colorRGB.orange, 0, 0, 0],
			BR: [...colorRGB.blue, ...colorRGB.red, 0, 0, 0],
			WRG: [...colorRGB.white, ...colorRGB.green, ...colorRGB.red],
			WGO: [...colorRGB.white, ...colorRGB.orange, ...colorRGB.green],
			WOB: [...colorRGB.white, ...colorRGB.blue, ...colorRGB.orange],
			WBR: [...colorRGB.white, ...colorRGB.red, ...colorRGB.blue],
			YGR: [...colorRGB.yellow, ...colorRGB.red, ...colorRGB.green],
			YOG: [...colorRGB.yellow, ...colorRGB.green, ...colorRGB.orange],
			YBO: [...colorRGB.yellow, ...colorRGB.orange, ...colorRGB.blue],
			YRB: [...colorRGB.yellow, ...colorRGB.blue, ...colorRGB.red]
		} as Record<Piece, number[]>;

		const HALF_PI = Math.PI * 0.5; // Equivalent to 90 degrees, a quarter turn

		// 2D array of colors and rotations, translations passed to kernel of all 26 pieces
		// Each box goes from -1 to 1 (width of 2), gap of 0.1
		const piece_variables_list = [
			['W', 0, 0, [0, 2.1, 0.0]],
			['G', 0, -HALF_PI, [0, 2.1, 0.0]],
			['B', 0, HALF_PI, [0, 2.1, 0.0]],
			['R', -HALF_PI, HALF_PI, [0, 2.1, 0.0]],
			['O', -HALF_PI, -HALF_PI, [0, 2.1, 0.0]],
			['Y', 0, Math.PI, [0, 2.1, 0.0]],
			['WR', 0, 0, [-2.1, 2.1, 0.0]],
			['WG', -HALF_PI, 0, [-2.1, 2.1, 0.0]],
			['WO', Math.PI, 0, [-2.1, 2.1, 0.0]],
			['WB', HALF_PI, 0, [-2.1, 2.1, 0.0]],
			['YR', 0, Math.PI, [-2.1, 2.1, 0.0]],
			['YG', -HALF_PI, Math.PI, [-2.1, 2.1, 0.0]],
			['YO', Math.PI, Math.PI, [-2.1, 2.1, 0.0]],
			['YB', HALF_PI, Math.PI, [-2.1, 2.1, 0.0]],
			['GR', 0, -HALF_PI, [-2.1, 2.1, 0.0]],
			['GO', Math.PI, HALF_PI, [-2.1, 2.1, 0.0]],
			['BO', Math.PI, -HALF_PI, [-2.1, 2.1, 0.0]],
			['BR', 0, HALF_PI, [-2.1, 2.1, 0.0]],
			['WRG', -HALF_PI, 0, [-2.1, 2.1, 2.1]],
			['WGO', Math.PI, 0, [-2.1, 2.1, 2.1]],
			['WOB', HALF_PI, 0, [-2.1, 2.1, 2.1]],
			['WBR', 0, 0, [-2.1, 2.1, 2.1]],
			['YGR', 0, Math.PI, [-2.1, 2.1, 2.1]],
			['YOG', -HALF_PI, Math.PI, [-2.1, 2.1, 2.1]],
			['YBO', Math.PI, Math.PI, [-2.1, 2.1, 2.1]],
			['YRB', HALF_PI, Math.PI, [-2.1, 2.1, 2.1]]
		] as [Piece, number, number, number[]][];

		// Update the internal cube representation to the set scramble index, setting up the last move to be animated
		function update_scramble(move_index: number) {
			cube.resetState();
			const partial_scramble = scramble.slice(0, move_index);
			partial_scramble.forEach((m) => cube.applyMove(m));
			current_scramble_index = move_index;
			move = scramble[current_scramble_index - 1];
			if (move !== null) {
				apply_move(move);
			}
		}

		function apply_move(move: string) {
			if (['R', "L'", 'D', "U'", 'F', "B'"].includes(move)) {
				target_angle = 0;
				current_angle = -HALF_PI;
				velocity = Math.PI / 90;
			} else if (["R'", 'L', 'U', "D'", "F'", 'B'].includes(move)) {
				target_angle = 0;
				current_angle = HALF_PI;
				velocity = -Math.PI / 90;
			} else if (['R2', 'L2', 'U2', 'D2', 'F2', 'B2'].includes(move)) {
				target_angle = 0;
				current_angle = -Math.PI;
				velocity = Math.PI / 45;
			}
		}

		// Animation loop
		function handle_animation_frame() {
			if (gl === null) return;

			if (scramble_move_index != current_scramble_index) {
				// The scramble index was changed, update the internal cube representation
				update_scramble(scramble_move_index);
			}
			if (input_move_queue.length > 0) {
				const new_move = input_move_queue.shift() as Move;
				cube.applyMove(new_move);
				move = new_move;
				apply_move(move);
			}
			if (reset_cube_flag == true) {
				cube.resetState();
				reset_cube_flag = false;
			}

			if (move != null) {
				// Update the angle in the rotation animation by the velocity amount
				current_angle += velocity;
			}
			if (Math.round(current_angle * 180) == Math.round(target_angle * 180)) {
				// When the target angle has been reached, animation can be stopped
				target_angle = 0;
				current_angle = 0;
				move = null;
			}
			// angle = (performance.now() / 1000 / 6) * 2 * Math.PI;
			gl.clearColor(0.9, 0.9, 0.9, 1); // Color when nothing is present, background color
			gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);

			// Commented lines for world rotation:
			// mat4.rotate(y_rotation_matrix, identity_matrix, angle, [0, 1, 0]);
			// mat4.rotate(x_rotation_matrix, identity_matrix, angle / 2, [1, 0, 0]);
			// mat4.mul(world_matrix_local, y_rotation_matrix, x_rotation_matrix);

			piece_variables_list.forEach((piece_variables, piece_index) => {
				let piece_color = piece_variables[0];
				let piece_orientation = 0;
				const layer_membership = [];
				if (piece_index < 6) {
					// Center pieces
					// Determine which layer the center piece belongs to
					for (const direction in layer_map) {
						if (layer_map[direction as Direction]['center'] == piece_index) {
							layer_membership.push(direction);
						}
					}
				} else if (piece_index < 18) {
					// Edge pieces
					const edge_index = piece_index - 6;
					// Get the edge sticker colors from the virtual cube representation
					piece_color = cube.edgePermutations[edge_index];
					piece_orientation = cube.edgeOrientations[edge_index];
					// Determine which layer the edge piece belongs to
					for (const direction in layer_map) {
						if (layer_map[direction as Direction]['edges'].includes(edge_index)) {
							layer_membership.push(direction);
						}
					}
				} else {
					const corner_index = piece_index - 18;
					// Get the corner sticker colors from the virtual cube representation
					piece_color = cube.cornerPermutations[corner_index];
					piece_orientation = cube.cornerOrientations[corner_index];
					for (const direction in layer_map) {
						if (layer_map[direction as Direction]['corners'].includes(corner_index)) {
							layer_membership.push(direction);
						}
					}
				}
				let piece_color_matrix = color_map[piece_color];
				if (piece_color.length == 2) {
					// Edge piece
					// Apply edge flip to swap sticker colors if applicable
					if (piece_orientation > 0) {
						piece_color_matrix = piece_color_matrix
							.slice(3, 6)
							.concat(piece_color_matrix.slice(0, 3))
							.concat([0, 0, 0]);
					}
				} else if (piece_color.length == 3) {
					// Corner piece
					// Apply corner twists to rotate sticker colors if applicable
					for (let twist_index = 1; twist_index <= piece_orientation; twist_index++) {
						piece_color_matrix = piece_color_matrix
							.slice(3, 9)
							.concat(piece_color_matrix.slice(0, 3));
					}
				}

				// Animate face rotation by applying to the pieces in the corresponding layer
				if (move != null && target_angle != current_angle) {
					if (layer_membership.includes(move[0])) {
						if (move[0] == 'U' || move[0] == 'D') {
							// U and D faces rotate along the Y axis
							matrix_rotate_y(face_matrix_local, identity_matrix, current_angle);
						} else if (move[0] == 'R' || move[0] == 'L') {
							// R and L faces rotate along the X axis
							matrix_rotate_x(face_matrix_local, identity_matrix, current_angle);
						} else if (move[0] == 'F' || move[0] == 'B') {
							// F and D faces rotate along the Z axis
							matrix_rotate_z(face_matrix_local, identity_matrix, current_angle);
						}
					} else {
						face_matrix_local.set(identity_matrix);
					}
				} else {
					// This piece will not be rotating
					// Face rotation matrix is set to the identity matrix
					face_matrix_local.set(identity_matrix);
				}

				// Piece specific translation
				matrix_rotate_y(y_rotation_matrix, identity_matrix, piece_variables[1]);
				matrix_rotate_x(x_rotation_matrix, identity_matrix, piece_variables[2]);
				matrix_multiply(piece_matrix_local, y_rotation_matrix, x_rotation_matrix);
				matrix_translate(piece_matrix_local, piece_variables[3]);

				// Send JS values to GPU
				gl.uniformMatrix4fv(face_matrix_handle, false, face_matrix_local);
				gl.uniformMatrix4fv(world_matrix_handle, false, world_matrix_local);
				gl.uniformMatrix4fv(piece_matrix_handle, false, piece_matrix_local);
				gl.uniformMatrix3fv(color_vector_handle, false, piece_color_matrix);

				// Draw values on GPU
				gl.drawElements(gl.TRIANGLES, boxIndices.length, gl.UNSIGNED_SHORT, 0);
			});
			requestAnimationFrame(handle_animation_frame);
		}
		requestAnimationFrame(handle_animation_frame);

		webgl_error = false;
	}
	onMount(() => {
		main();
	});
</script>

{#if !webgl_error}
	<canvas bind:this={canvas} class="rounded aspect-square max-w-5xl mx-auto"></canvas>
{:else}
	<p class="h3">{$dictionary.error['Error']}</p>
{/if}
