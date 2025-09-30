<script lang="ts">
	interface Props {
		sunrise: number;
		sunset: number;
		nadir: number;
		currentTime: number;
	}

	const { sunrise, sunset, nadir, currentTime }: Props = $props();

	const afterSunrise = $derived(currentTime - sunrise > 0);
	const afterSunset = $derived(currentTime - sunset > 0);

	/**
	 * Get the y svg position of the sun in the vector
	 *
	 * @param percent - percent to interpolate on the bezier curve, between 0 and 1 inclusive
	 */
	function getSunVectorPosition(percent: number) {
		/**
		 * The curve we are using is:
		 * `M0 24s8 0 16-8 16-16 28-16 28 16 28 16c0 0 8 8 16 8`
		 * When unminified and converted to absolute, it is:
		 * `M 0 24 S 8 24 16 16 S 32 0 44 0 S 72 16 72 16 C 72 16 80 24 88 24`
		 * When there is a shorthand curve, it uses the previous control point mirrored x,y about the previous point
		 * When there is no previous control point, the first control point is the same as the starting point
		 * So converting all shorthand curves (`s`) to curves (`c`), we get:
		 * `M 0 24 C 0 24 8 24 16 16 C 24 8 32 0 44 0 C 56 0 72 16 72 16 C 72 16 80 24 88 24`
		 * This gets us the points array:
		 * [[0,24], [0,24], [8,24], [16,16], [24, 8], [32, 0], [44, 0], [56, 0], [72, 16], [72, 16], [72, 16], [80, 24], [88, 24]]
		 * @see https://yqnn.github.io/svg-path-editor/
		 */
		// prettier-ignore
		const points = [[0, 24],[0, 24],[8, 24],[16, 16],[24, 8],[32, 0],[44, 0],[56, 0],[72, 16],[72, 16],[72, 16],[80, 24],[88, 24]] as Point[];

		// horizontal points are at 16, 44, 72, and 88
		if (!afterSunrise) {
			return interpolatePositionOnBezier(points[0], points[1], points[2], points[3], percent);
		} else if (!afterSunset && currentTime - sunrise < sunset - currentTime) {
			return interpolatePositionOnBezier(points[3], points[4], points[5], points[6], percent);
		} else if (!afterSunset) {
			return interpolatePositionOnBezier(points[6], points[7], points[8], points[9], percent);
		} else {
			return interpolatePositionOnBezier(points[9], points[10], points[11], points[12], percent);
		}
	}

	// A single point (x,y)
	type Point = [number, number];

	/**
	 * Interpolates a bezier curve defined by points p1, p2, p3, p4 by t percent
	 *
	 * Calls `interpolateSinglePositionOnBezier` for two dimensions (x and y)
	 * @param p1 - bezier point 1
	 * @param p2 - bezier point 2
	 * @param p3 - bezier point 3
	 * @param p4 - bezier point 4
	 * @param t - percent to interpolate, between 0 and 1 inclusive
	 */
	function interpolatePositionOnBezier(p1: Point, p2: Point, p3: Point, p4: Point, t: number) {
		return [
			interpolateSinglePositionOnBezier(p1[0], p2[0], p3[0], p4[0], t),
			interpolateSinglePositionOnBezier(p1[1], p2[1], p3[1], p4[1], t)
		];
	}

	/**
	 * Given a bezier curve from A to D with control points B and C, interpolate it t percent
	 *
	 * This interpolates a single dimension (ie. x or y)
	 * @param A - position of starting point
	 * @param B - position of first control point
	 * @param C - position of second control point
	 * @param D - position of end point
	 * @param t - percent to interpolate, between 0 and 1 inclusive
	 *
	 * @link https://math.stackexchange.com/a/2463582/527418
	 */
	function interpolateSinglePositionOnBezier(
		A: number,
		B: number,
		C: number,
		D: number,
		t: number
	) {
		return (
			(1 - t) * (1 - t) * (1 - t) * A +
			3 * t * (1 - t) * (1 - t) * B +
			3 * t * t * (1 - t) * C +
			t * t * t * D
		);
	}

	/**
	 * Value passed into `getSunVectorPosition` used for `sunPos`
	 * x,y position of yellow circle in svg coordinates
	 *
	 * Since we have four curves:
	 *  0. before sunrise
	 *  1. between sunrise and sunset closer to sunrise
	 *  2. between sunrise and sunset closer to sunset
	 *  3. after sunset
	 * We must pass in a value between 0 and 1 based on how far we are for each of those values.
	 *
	 * Previously, we had four curves but only three checks for the percent values below
	 * (the three checks were before sunrise, between sunrise and sunset, and after sunset).
	 * However, this meant that the middle curves were getting incorrect values.
	 * Above, we choose which middle curve (1 or 2) based off of if it's closer to sunrise or sunset.
	 * However, below we passed a value between 0-1 for how far we are between sunrise and sunset.
	 * This resulted in either passing the first curve a value between 0-0.5
	 * or the second curve a value between 0.5 and 1.
	 * This meant the middle 50% of these middle two curves was always unfilled.
	 * In other words, the middle section went from 0-25% for the first half
	 * then 75% to 100% for the second half.
	 *
	 * By multiplying the first part by 2, we change the 0-0.5 range to 0-1,
	 * and by multiplying the second part by 2 and subtracting 1,
	 * we change the 0.5-1 range to 0-1, thus fixing the curve.
	 *
	 * Note that `nadir` is before `sunrise`, so in the final calculation,
	 * we use tomorrow's `nadir` by just adding one day in ms to the previous `nadir`.
	 */
	const perc = $derived(
		!afterSunrise
			? (currentTime - nadir) / (sunrise - nadir)
			: !afterSunset && currentTime - sunrise < sunset - currentTime
				? ((currentTime - sunrise) / (sunset - sunrise)) * 2
				: !afterSunset
					? ((currentTime - sunrise) / (sunset - sunrise)) * 2 - 1
					: (currentTime - sunset) / (nadir + 24 * 60 * 60 * 1000 - sunset)
	);

	const sunPos = $derived(getSunVectorPosition(perc));

	// Curve gradient percents
	// Vertical points at 0,16,44,72,88
	const gradientPercents = $derived([
		afterSunrise ? 1 : sunPos[0] / 16,
		!afterSunrise ? 0 : afterSunset ? 1 : (sunPos[0] - 16) / (72 - 16),
		!afterSunset ? 0 : (sunPos[0] - 72) / (88 - 72)
		// afterSunrise ? 1 : (currentTime - nadir) / (sunrise - nadir),
		// !afterSunrise ? 0 : afterSunset ? 1 : (currentTime - sunrise) / (sunset - sunrise),
		// !afterSunset ? 0 : (currentTime - sunset) / (nadir + 24 * 60 * 60 * 1000 - sunset)
	]);

	// Colors used below are `blue-200` and `yellow-300`
</script>

<!-- Viewbox has 4 space around for sun circle with radius 4 -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="-4 -4 96 32">
	<defs>
		<linearGradient id="Gradient1">
			<stop stop-color="#bfdbfe" offset="0%" />
			<stop stop-color="#bfdbfe" offset="{gradientPercents[0] * 100}%" />
			<stop stop-color="transparent" offset="{gradientPercents[0] * 100}%" />
			<stop stop-color="transparent" offset="100%" />
		</linearGradient>

		<linearGradient id="Gradient2">
			<stop stop-color="#bfdbfe" offset="0%" />
			<stop stop-color="#bfdbfe" offset="{gradientPercents[1] * 100}%" />
			<stop stop-color="transparent" offset="{gradientPercents[1] * 100}%" />
			<stop stop-color="transparent" offset="100%" />
		</linearGradient>

		<linearGradient id="Gradient3">
			<stop stop-color="#bfdbfe" offset="0%" />
			<stop stop-color="#bfdbfe" offset="{gradientPercents[2] * 100}%" />
			<stop stop-color="transparent" offset="{gradientPercents[2] * 100}%" />
			<stop stop-color="transparent" offset="100%" />
		</linearGradient>
	</defs>

	<path d="M0 16h16c0 0-8 8-16 8h0z" fill="url(#Gradient1)" />
	<path d="M72 16h-56c8-8 16-16 28-16s28 16 28 16" fill="url(#Gradient2)" />
	<path d="M88 16h-16c0 0 8 8 16 8h0z" fill="url(#Gradient3)" />

	<path
		d="M0 24s8 0 16-8 16-16 28-16 28 16 28 16c0 0 8 8 16 8M0 16h88"
		class="stroke-base-200 dark:stroke-base-700"
		stroke-width="0.5"
		fill="none" />

	<circle cx={sunPos[0]} cy={sunPos[1]} r="4" fill="#fde047" />
</svg>
