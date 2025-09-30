<script lang="ts">
	/**
	 * The app icon, which reacts to user colors, animated
	 */

	import TailwindColors from 'tailwindcss/colors';
	import { settings } from '$lib/stores/settings';

	const basePalette = $derived(
		TailwindColors[$settings.baseColorPalette] as Record<ColorLightness, string>
	);
	const accentPalette = $derived(
		TailwindColors[$settings.accentColorPalette] as Record<ColorLightness, string>
	);
	const white = $derived(TailwindColors.white);

	const bgFill = $derived(!$settings.darkMode ? white : basePalette[800]);
	const dStroke = $derived(!$settings.darkMode ? basePalette[700] : basePalette[200]);
	const dFill = $derived(!$settings.darkMode ? basePalette[700] : basePalette[200]);
	const cStroke = $derived(!$settings.darkMode ? basePalette[700] : basePalette[200]);
	const cFill = $derived(!$settings.darkMode ? white : basePalette[800]);
	const handsStroke = $derived(accentPalette[700]);

	/**
	 * We want the logo to both adapt to changing dark mode and color palettes before during and after animation,
	 * and also display correctly before, during, and after animation.
	 *
	 * We have the animation fallback to 'none' before it starts and fallback to the correct value after the animation starts.
	 * We avoid `fill="freeze"` to fallback to the correct color.
	 * We use a reactive value so the user can change their palette and dark mode and the logo will update.
	 * We need 'none' to be the fallback before the animation so the logo animates correctly.
	 * We need the reactive value to be the fallback after the animation so the logo reacts to changes after the animation is complete.
	 */

	let bgFillDone = $state(false);
	let dStrokeDone = $state(false);
	let dFillDone = $state(false);
	let cStrokeDone = $state(false);
	let cFillDone = $state(false);
	let handsStrokeDone = $state(false);

	/**
	 * Extra ms so the animation doesn't flicker
	 * It is important that the fallback is used sometime between the beginning and end of animation
	 */
	const buffer = 250;

	setTimeout(() => (bgFillDone = true), 0 + buffer);
	setTimeout(() => (dStrokeDone = true), 1000 + buffer);
	setTimeout(() => (dFillDone = true), 1500 + buffer);
	setTimeout(() => (cStrokeDone = true), 2000 + buffer);
	setTimeout(() => (cFillDone = true), 2500 + buffer);
	setTimeout(() => (handsStrokeDone = true), 3000 + buffer);
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12">
	<path id="bg" d="M0 0H12V12H0Z" fill={bgFillDone ? bgFill : 'none'}>
		<animate attributeName="fill" from="#fff0" to={bgFill} begin="0s" dur="1s" />
	</path>
	<g stroke-linecap="square" stroke-width="0.5">
		<path
			id="d"
			d="M2 2H3C6 2 7 4 7 6S6 10 3 10H2Z"
			stroke={dStrokeDone ? dStroke : 'none'}
			fill={dFillDone ? dFill : 'none'}>
			<animate attributeName="stroke" from="#fff0" to={dStroke} begin="1s" dur="1s" />
			<animate
				attributeName="stroke-dasharray"
				from="0,25"
				to="25,25"
				begin="1s"
				dur="1s"
				fill="freeze" />
			<animate attributeName="fill" from="#fff0" to={dFill} begin="1.5s" dur="1s" />
		</path>
		<path
			id="c"
			d="M9 2A1 1 0 009 10"
			stroke={cStrokeDone ? cStroke : 'none'}
			fill={cFillDone ? cFill : 'none'}
			opacity="0.75">
			<animate attributeName="stroke" from="#fff0" to={cStroke} begin="2s" dur="1s" />
			<animate
				attributeName="stroke-dasharray"
				from="0,25"
				to="25,25"
				begin="2s"
				dur="1s"
				fill="freeze" />
			<animate attributeName="fill" from="#fff0" to={cFill} begin="2.5s" dur="1s" />
		</path>
		<path id="hands" d="M9 3.5V6H7.5" stroke={handsStrokeDone ? handsStroke : 'none'} fill="none">
			<animate attributeName="stroke" from="#fff0" to={handsStroke} begin="3s" dur="1s" />
			<animate
				attributeName="stroke-dasharray"
				from="0,25"
				to="25,25"
				begin="3s"
				dur="1s"
				fill="freeze" />
		</path>
	</g>
</svg>
