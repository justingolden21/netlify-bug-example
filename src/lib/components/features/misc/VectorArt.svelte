<script lang="ts">
	/**
	 * Vector art used throughout the project (usually for empty states)
	 *
	 * Modified from the original undraw.co versions.
	 * We store these in a svelte component rather than in `/static`
	 * because we want to use the user's accent color, which is dynamic.
	 * Being dynamic, we can also serve different colors in dark mode.
	 * Use `accent-500` for accents and `red-200` for skin tones.
	 *
	 * Used in informational / error states such as
	 * 404 page, no worldclocks, no stopwatches, no location access (sunrise).
	 */
	import VectorArtMascot from '$lib/components/features/misc/VectorArtMascot.svelte';

	type VectorArt =
		| 'not_found' // 404 page
		| 'stopwatch' // no stopwatches
		| 'sunlight' // no location access (sunrise and weather)
		| 'alarm_clock' // no worldclocks
		| 'rubiks' // rubiks cube timer
		| 'no_tasks' // pomodoro tasks
		| 'weather_window' // weather
		| 'timer' // timer
		| 'firefox_support' // picture-in-picture firefox
		| 'watch' // timestamp
		| 'calendar' // calendar
		| 'balloons'; // birthdays

	interface Props {
		name?: VectorArt;
	}

	const { name = 'not_found' }: Props = $props();

	/**
	 * Colors
	 * base 100 - light shadows
	 * base 200 - light shadows
	 * base 300 - clothing, clocks
	 * base 700 - clothing, shoes, hair, clocks
	 * base 800 - dark shadows, hair
	 * base 900 - dark shadows, dark highlight
	 *
	 * accent 500 - accent color
	 * red 200 - skin tone
	 * white - blend into the background, highlights
	 *
	 * People
	 * People have base 700,80,900 hair and weather either dark clothing or accent color shirts
	 * Paths are simple and we generally avoid extra shadows/outlines
	 *
	 * Backgrounds
	 * base-100 dark:base-900 are used for backdrops
	 *
	 * Animations
	 * animations should be simple and slow
	 * clock hands should move at the same pace
	 */
</script>

<VectorArtMascot />

{#if name === 'sunlight'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 423.9 590.2">
		<circle class="fill-[#fde047]" cx="66" cy="66" r="66">
			<animateTransform attributeName="transform" dur="3s" repeatDur="indefinite" type="translate" values="0 0;0 15;0 0"/>
		</circle>
		<!-- sunglasses -->
		<path class="fill-base-700" d="m257.3 147.8 2.7-11.9c3.3-6.8 6.5-8.5 13.8-7.8 1.9-2.6 4.7-3.9 8.1-4.4 3.5-6.3 6.8-7.7 14.8-5.9l9.5 4-.8 1.4-7.9-3.9c1.8 3.8.3 8.4-3.5 10.4-3.9 2.1-8.7.6-10.8-3.3l-.9-1.8-7.9 4.3.9 1.8c2.1 3.9.6 8.7-3.3 10.8s-8.7.6-11.2-4.1l-1.3 10.4-2.2 0z">
			<animateTransform attributeName="transform" dur="3s" repeatDur="indefinite" type="rotate" values="0 257.3 147.8; -15 257.3 147.8; 0 257.3 147.8"/>
		</path>
		<!-- skin -->
		<path class="fill-red-200" d="M272 518l17 32 9-3-13-34zm72 15 5 36 9 0-1-36zm15-236 15-6 3 44c5 1 6 11-1 13s-14-5-10-11zm-131-107-14-7 32-31c-3-4 5-10 11-7s8 13-3 15z"/>
		<circle class="fill-red-200" cx="312" cy="153" r="22"/>
		<!-- pants and shoes -->
		<path class="fill-base-700" d="M330 581c-5 4 1 8 3 8l18-1 3-6 2 6 7 0-3-23-15-1 0 7-15 10m-55-14c-3 4 3 7 5 7l17-7 1-7 4 5 6-2-10-21-15 4 3 7zm7-276 59-6c13 28 29 55 22 88l3 153 3 24-28 2 0-25-24-169-47 78 13 72 9 14-16 10-16-13-29-80 54-139z"/>
		<!-- shirt -->
		<path class="fill-accent-500" d="m373 276-4-55c-1-8-3-13-11-16l-28-13-5-16h-23l-6 18-16 2-49-5 7-8 3-8-14-7-14 14c-5 9-13 24 19 31l52 6c-1 16-5 25-3 75h67l-7-14 10-19 4 35 5 13 24-9z"/>
		<!-- hair -->
		<path class="fill-base-700" d="M353 198c-21 6-46 2-67-6 15-18 11-49 8-54s4-9 12-10 41 0 44 25 2 41 3 45z"/>
	</svg>
{:else if name === 'alarm_clock'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 675.67 631.95">
		<!-- bottom platform -->
		<ellipse class="fill-base-100 dark:fill-base-900" cx="340" cy="528" rx="340" ry="18"/>
		<!-- clock outside -->
		<g class="fill-base-300 dark:fill-base-700">
			<circle cx="279" cy="261" r="215"/>
			<path d="M190 24c0 0-51 63-98 76-20-27-16-66 11-87 27-21 66-16 87 11M368 25c21-27 59-33 87-12 28 21 32 60 12 87-45-12-73-35-99-75M357 455l32 57 10-5-32-57zM192 450l-32 57 10 5 32-57z"/>
			<circle cx="395" cy="509" r="17"/>
			<circle cx="407" cy="74" r="17"/>
			<circle cx="278" cy="34" r="17"/>
			<circle cx="155" cy="72" r="17"/>
			<circle cx="166" cy="509" r="17"/>
		</g>
		<!-- clock -->
		<circle class="fill-white dark:fill-base-900" cx="279" cy="261" r="175"/>
		<!-- clock shadow -->
		<!-- <path class="fill-black/5 dark:fill-black/20" d="M279 92c85 8 154 90 146 183-7 84-76 150-161 154 108 1 184-75 184-168s-76-169-169-169"/> -->
		<!-- clock ticks -->
		<path class="fill-base-300 dark:fill-base-700" d="M274 85v24a1 1 0 0011 0v-24zm106 26-14 20a1 1 0 009 6l14-20zm64 88-22 9a1 1 0 004 10l22-9zm-252-69-14-20-9 6 14 20a1 1 0 009-6zm-55 78-22-9-4 10 22 9a1 1 0 004-10zm137 204v24h11v-24a1 1 0 00-11 0zm115-8-14-20a1 1 0 00-9 6l14 20zm59-92-22-9a1 1 0 00-4 10l22 9zm-265 73-14 20 9 6 14-20a1 1 0 00-9-6zm-50-82-22 9 4 10 22-9a1 1 0 00-4-10z"/>
		<!-- hands -->
		<path class="fill-base-300 dark:fill-base-700" d="M277.2 271.4l-97.6 16.6a1 1 0 01-3.9-22.7l97.6-16.6a1 1 0 013.9 22.7">
			<animateTransform attributeName="transform" dur="72s" repeatDur="indefinite" type="rotate" values="0 279 261; 360 279 261"/>
		</path>
		<path class="fill-base-300 dark:fill-base-700" d="M378.7 366.3l-105.1-104.2a1 1 0 0110.6-10.7l105.1 104.2a1 1 0 01-10.6 10.7">
			<animateTransform attributeName="transform" dur="6s" repeatDur="indefinite" type="rotate" values="0 279 261; 360 279 261"/>
		</path>
		<!-- clock pin -->
		<circle class="fill-base-300 dark:fill-base-700" cx="279" cy="261" r="13"/>
		<!-- mascot -->
		<g transform="scale(0.5) translate(-60 510)">
			<use href="#mascot" />
		</g>
		<!-- legs -->
		<path class="fill-red-200" d="M385 611.4l-10.6-5.1 14.5-44.2 15.6 7.5zm70.9-7.1-10.6 5.9-16.5-43.5 16.8-4.1z"/>
		<!-- pants and shoes -->
		<path class="fill-base-700" d="M385 575s7-47 30-96c0 0 1-21 23-19l52 7 2-19 50-7s75 118-92 70c4 19 4 47-0 52l11 28h-24l-17-32-13 18zm-10 23-3 7-20 4c-3 1-8 6-1 9l20 8 6-6-2 8 7 3 8-26zm66 3 3 7-11 17c-1 2-2 9 5 8l20-9 1-8 4 6 7-3-12-24z"/>
		<!-- hands -->
		<path class="fill-red-200" d="M395 346c-18-12-20 24 0 12l26 15-1-16zm94 168c-11 18 20 18 13 0l15-26-16 1z"/>
		<!-- shirt -->
		<path class="fill-accent-500" d="M398 366l14-18 50 24 63-12v42l-68 0zm91 90 4-39c-3-6-11-20 4-39l28-32 23-1c13 17 17 38 13 141-2 3-4 5-6 5zm20 55-17-14 25-49 31 6z"/>
		<!-- hair back -->
		<path class="fill-base-700" d="M510 310c-0-17 14-31 31-31 17-0 31 14 31 31 5 11 2 17 0 23 0 2-2 4-4 4h-54c-2 0-4-2-4-4z"/>
		<!-- head -->
		<circle class="fill-red-200" cx="530" cy="312" r="24"/>
		<!-- hair front -->
		<path class="fill-base-700" d="M544 317l-1-9-4 8c-10 3-20 1-37-8 2-9 7-17 15-22 12-5 44-9 38 33z"/>
	</svg>
{:else if name === 'stopwatch'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 892.6 540.8">
		<!-- background -->
		<ellipse class="fill-base-100 dark:fill-base-900" cx="444" cy="522.8" rx="444" ry="18"/>
		<!-- mascot -->
		<g transform="scale(0.5) translate(-160 560)">
			<use href="#mascot" />
		</g>
		<!-- clock -->
		<circle class="fill-base-300 dark:fill-base-700" cx="459.1" cy="314.4" r="210.5"/>
		<circle class="fill-white dark:fill-base-900" cx="459.1" cy="314.4" r="193.1"/>
		<circle class="fill-base-300 dark:fill-base-700" cx="458.4" cy="315.1" r="25.8"/>
		<path class="fill-base-300 dark:fill-base-700" d="M453 131h11v21h-11zM453 478h11v21h-11zM274 310v11h21v-11zM622 310v11h21v-11zM432 53h54v63h-54z"/>
		<!-- clock hand -->
		<path class="fill-base-300 dark:fill-base-700" d="M450.9 326.3l9.6-21.8 119.4 66.1z">
			<animateTransform attributeName="transform" dur="6s" repeatDur="indefinite" type="rotate" values="0 458.4 315.1; 360 458.4 315.1"/>
		</path>
		<!-- stopwatch top -->
		<ellipse class="fill-base-300 dark:fill-base-700" cx="458.4" cy="53" rx="62.7" ry="17.4">
			<animateTransform attributeName="transform" dur="1.5s" repeatDur="indefinite" type="translate" values="0 0 ; 0 10 ; 0 0 ; 0 0 ; 0 0"/>
		</ellipse>
		<!-- woman -->
		<g transform="scale(1.25) translate(-80 -120)">
			<!-- hair -->
			<circle class="fill-base-700" cx="660" cy="254" r="21.2"/>
			<!-- skin -->
			<path class="fill-red-200" d="M577 352c-4 5-20 24-20 15s12-15 19-20zM676 368c3 5 13 28 5 25s-9-17-10-25zM658 428l4 24h15c0 0 1-19-2-23l-17-1zM630 428l4 24h15c-0 0 1-19-2-23l-17-1z"/>
			<!-- <path class="fill-red-200" d="M577 352c-4 5-20 24-20 15s12-15 19-20zM676 368c3 5 13 28 5 25s-9-17-10-25zM658 428l4 24h15c0 0 1-19-2-23l-17-1zM630 428l4 24h15c-0 0 1-19-2-23l-17-1zM665 263l-2 33-15-11 4-21z"/> -->
			<circle class="fill-red-200" cx="657.7" cy="260" r="16"/>
			<!-- shirt -->
			<path class="fill-accent-500" d="M640 283l27 94 15-4-20-78zM665 292c-16-11-23-14-25-11s-13 55-7 65c0 0 30 6 36 3 0 0 7-30-4-57zM644 280c0 0-5-2-10 5-5 7-64 62-64 62l10 11 63-52z"/>
			<!-- pants and boots -->
			<path class="fill-base-700" d="M662 349c0 0-27-7-30-2l-1 8c0 0-8 15-4 38s1 38 1 38 19-2 33 0 16 0 16 0zM678 449l-20 1 7 52c0 0-6 22 1 24s9 1 13 1c0 0 6 6 13 6s9-2 13-4c0 0 1-4-4-6s-18-6-21-20zM650 449l-20 1 7 52c0 0-6 22 1 24s9 1 13 1c0 0 6 6 13 6s9-2 13-4c0 0 1-4-4-6s-18-6-21-20z"/>
			<!-- hair -->
			<circle class="fill-base-700" cx="667.5" cy="231.7" r="8.8"/>
			<ellipse class="fill-base-700" cx="657.6" cy="249.5" rx="14.6" ry="8.8"/>
		</g>
	</svg>
{:else if name === 'not_found'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1037.94 772.29">
		<!-- background -->
		<path d="M104 77s-63-18-76 79 4 138 58 162 79 97 25 188 96 115 138 212 162 26 256-92 101 125 193 141 160-52 161-147 64-63 92-98 49-158 6-226-121-109-201-120c-200-45-255-150-350-172s-119 10-170 40-132 33-132 33z" class="fill-base-100 dark:fill-white/5"/>
		<!-- clock face -->
		<circle cx="522" cy="385" r="356" class="fill-accent-500"/>
		<circle cx="522" cy="385" r="283" class="fill-base-100"/>
		<!-- clock triangle -->
		<path d="M539 374h266q0 100-43 160z" class="fill-base-200"/>
		<!-- clock hands and pin -->
		<g class="fill-base-700">
			<path d="M539 374h226v20h-226z">
				<animateTransform attributeName="transform" dur="6s" repeatDur="indefinite" type="rotate" values="0 522 385 ; 360 522 385"/>
			</path>
			<circle cx="522" cy="385" r="30"/>
			<path d="m384 294 138 82-10 18-138-82z">
				<animateTransform attributeName="transform" begin="-0.5s" dur="72s" repeatDur="indefinite" type="rotate" values="0 522 385 ; 360 522 385"/>
			</path>
		</g>
		<!-- hair back -->
		<path class="fill-base-800" d="M635.55 119c-6.6 4.95-6.8 7.95-8.02 10.46s-6 6.45-9.64 9-7.27 6.14-7.29 10.6 7 10.32 9.28 16.21 0 11.61-1.21 17.4 1.06 8.46 2 9.61 9.89 11.32 12.84 18.15l71.49.57s7.8-16.75 5.41-21.81-10.63-8.68-11.29-15 2.06-7.21 3.15-10.85-2.79-17.63-7.93-25.14-11.14-10.72-13.85-11.75-29.49-14.45-44.94-7.45"/>
		<!-- skin -->
		<path class="fill-red-200" d="M666 471l-9 16c-4 7 0 31 0 31l-10 1-10-5v-29l15-19zM633 477l-5 15c-2 6 3 26 3 26l-17 2-7-7-3-20 12-27zM674 249h-27l1-73 20-6 19 36zM753 206l-10 68c-5 16-22 10-29-7l-12-39 16-9 12 30s13-38 10-45 8-8 8-8 27-21 30-18-10 19-25 28zM622 224c-9 22-20 41-36 52-25 16-20-17-20-17l8-59c-9-4-20-33-17-35s26 24 26 24 10 5 5 13-3 45-3 45l23-36z"/>
		<circle class="fill-red-200" cx="653" cy="164.5" r="24"/>
		<!-- shoes -->
		<path class="fill-base-700" d="M641.4 480.6s-11.9-1.8-7.8 17.4c0 0 .2 22.5 1.8 26s20.1 8.2 23.3 4.6-2.1-16.2-2.1-16.2-13.5 9.8-17.1-.7 1.8-31 1.8-31zM630.7 516.2c2.7 4.6 1.2 10.6-3.4 13.3-2.2 1.3-4.8 1.7-7.3 1.1s-12.3-3.8-14.3-7.5-1.8-35.2-1.8-35.2l4.8-7.1s-2.5 31.3 3.4 34 18.5 1.3 18.6 1.4z"/>
		<!-- pants -->
		<path class="fill-base-700" d="M715 386l-40 97c-20-2-22-9-26-11l38-112-53-39 48 9 28 16c25 16 5 40 5 40zM689 372l-45 113c-13-1-21.3333-9.3333-32-14l32-90-34-5c-26-12-13-38-3-61l74 12z"/>
		<!-- shirt -->
		<path class="fill-accent-500" d="M666.9 241.3l14.7-44.1c27.3 6.9 39.6 19 40.1 25.4 0 0-19.2 6.4-18.7 16-15.6 56.5-15.9 66.9-10.4 97.3 0 0-28.8-2.3-48-2.7s-43.6-7.2-43.6-7.2c0 0 19.7-42.1 19.5-51.5s-1.9-57.4-17-60.6c21-15.5 39.6-23.3 45.1-18.1z"/>
		<!-- hair front -->
		<path class="fill-base-800" d="M635 159c4 0 7-4 11-4s21 12 32 12 8-3 6-6l-20-29-35 15c-2 4 1 12 6 12z"/>
	</svg>
{:else if name === 'rubiks'}
	<!-- prettier-ignore -->
	<svg viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg">
		<!-- mascot -->
		<g transform="scale(0.5) translate(420 380)">
			<use href="#mascot" />
		</g>
		<!-- cube bg -->
		<!-- <path class="fill-base-100 dark:fill-base-900" d="m180 180c-15-5-24-51-6-65s-1-47 24-52 59-10 81-7 72 32 66 55-2 27 8 37-10 38-67 38-76 3-106-6"/> -->
		<!-- skin -->
		<path d="M184 150l-14-5-11 20 31 15 52-58a13 13 0 10-11-12zM134 337h15l7-59h-23zM96 317l13 9 40-44-19-13zM171.8 72.5a30.8 30.8 0 10-61.6 0 30.8 30.8 0 1061.6 0" class="fill-red-200"/>
		<path d="M168 230s36-2 30 22-82 44-82 44z" class="fill-red-200"/>
		<!-- hair and shoes -->
		<path d="M179 351l-48 0 0-18 29 0a19 19 0 0119 18zM123 352l-39-28 10-15 24 17a19 19 0 015 26zM38 82c0 0 16-80 53-81s30 23 30 23a9 9 0 0111 12 26 26 0 0136 35c-6 6-14 4-22 2s-31 3-9 30c-30 13-62-42-17-65a6 6 0 01-5-9c-37-11-42 33-53 57s-47 22-60 3c19 5 34 2 36-7z" class="fill-base-700"/>
		<!-- rubiks cube -->
		<g transform="translate(185 50) scale(6)" stroke-width="0.5" class="fill-accent-500 stroke-white dark:stroke-base-800">
			<path d="M21 7.5v9l-9 5.25-9-5.25v-9l9-5.25 9 5.25"/>
			<path d="M21 7.5v9l-9 5.25v-9zl-9-5.25-9 5.25v9l9 5.25v-9l-9-5.25m6-3.5 9 5.25v9m-12-12.5 9 5.25v9m0-16-9 5.25v9m12-12.5-9 5.25v9m-6-9.5 9 5.25 9-5.25m-18 3 9 5.25 9-5.25"/>
		</g>
		<!-- bottom hand -->
		<path d="m172 169-11-11-18 14 22 27 72-31a13 13 0 10-5-15z" class="fill-red-200">
			<animateTransform attributeName="transform" dur="4s" repeatDur="indefinite" type="rotate" values="0 172 169 ; -10 172 169 ; 0 172 169"/>
		</path>
		<!-- dress -->
		<path d="M167 175l-18-8 3-32 27 9a6 6 0 013 7l-7 21a6 6 0 01-8 3zM69 199l24-63a34 34 0 0166 12l-28 66 1 9 57 5c0 0-28 44-64 72-12 10-104 17-56-101M147 185l-5-4 13-33 15 13a6 6 0 010 8l-15 16a6 6 0 01-8 0z" class="fill-base-300"/>
	</svg>
{:else if name === 'no_tasks'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 782 650">
		<!-- platform -->
		<ellipse class="fill-base-100 dark:fill-base-900" cx="600" cy="635" rx="150" ry="18"/>
		<!-- feet and face -->
		<g class="fill-red-200">
			<path d="M580 629l-12 0-1-46 13-1zM649 615l-11 5-19-41 11-6z"/>
			<circle cx="602" cy="244" r="26"/>
		</g>
		<!-- shoes and pants -->
		<g class="fill-base-700">
			<path d="M583 641h-39a15 15 0 0115-16h24zM621 640a15 15 0 018-21l22-9 6 14z"/>
			<path d="M648 594l-34-82 16-77-31-2-17 86 43 85z"/>
			<path d="M611 420l-16 98-5 94-27-0-1-180z"/>
		</g>
		<!-- shirt bottom -->
		<path d="M633 425l-2 14-77 3 5-21z" class="fill-base-300"/>
		<!-- shirt -->
		<path d="m561 339c3-73 74-77 75-24l-3 113h-79z" class="fill-base-700"/>
		<g>
			<animateTransform attributeName="transform" dur="4s" repeatDur="indefinite" type="rotate" values="0 602.5 295.4 ; -10 602.5 295.4 ; 0 602.5 295.4"/>
			<!-- hand -->
			<path d="M559.2 452a9.3 9.3 0 012.8-13.5l4-11.5 13 5-4.3 10.5a9 9 0 01-2.7 10.9 9.2 9.2 0 01-12.8-1.4z" class="fill-red-200"/>
			<!-- shirt arm -->
			<path d="M582 439l-27-8 25-77 2-43a19 19 0 0121-15 19 19 0 0115 16l-9 60-3 10z" class="fill-base-300"/>
		</g>
		<!-- hair -->
		<path d="M622 265s26-48-11-54-33 9-33 18l15 4 13 14s9-6 11-1-1 17-1 17z" class="fill-base-700"/>
		<!-- task box and bottom line -->
		<path d="M412 485.8h-406v-406h406z" stroke-width="9" fill="none" class="stroke-base-300 dark:stroke-base-700"/>
		<!-- task items -->
		<g class="fill-accent-500 animate-pulse">
			<path d="M84 254v9h260v-9zM84 278v9h260v-9zM84 302v9h260v-9z"/>
			<circle cx="68" cy="260" r="6"/>
		</g>
		<g class="fill-base-300 dark:fill-base-700">
			<path d="M84 151v9h260v-9zM84 175v9h260v-9zM84 199v9h260v-9zM84 358v9h260v-9zM84 382v9h260v-9zM84 406v9h260v-9z"/>
			<circle cx="68" cy="156" r="6"/>
			<circle cx="68" cy="363" r="6"/>
		</g>
		<!-- mascot -->
		<g transform="scale(0.4) translate(640 1020)">
			<use href="#mascot" />
		</g>
	</svg>
{:else if name === 'weather_window'}
	<!-- This one has some classes to work well with `Weather.svelte` -->
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1126.2 694.2">
		<!-- window -->
		<path class="fill-base-700" d="M363 0h195v276h-195zM363 331h195v276h-195zM612 331h195v276h-195zM612 0h195v276h-195z" opacity="0.75"/>
		<!-- sky lines -->
		<path class="fill-white/10" d="M438.9 247l118.5-51.1 0 13.5zM806.9 88.4l0 42-194.5 61.6 0-19.8zM497 395l60.5-33.3v4.6l-60.5 28.7zM732.9 265l-9.8 11h-10.1zM806.9 444.4v7.1l-101 48.6z"/>
		<!-- coffee and steam -->
		<path class="fill-base-900" d="m689.9 454.2c0-4.1-2.4-7.7-6-9.4l.3-4.1h-22.3l2.6 26.5h17.7l.2-3c4.4-1.3 7.5-5.4 7.5-10m-7.4 8.4 1.2-15.8c4.1 4 4.1 10.6-1.2 15.8"/>
		<path class="fill-white/10" d="m678 396c-8-1-12 10-3 19s2 12-1 15 3 4 3 6"/>
		<!-- skin -->
		<path class="fill-red-200" d="M666 433c0 0 22 14 12 21s-21-18-21-18zM544 462c0 0 5 63 6 72s3 88 5 97 5 30 5 30h15c0 0-1-39 3-54s3-57 3-57 8-74 4-84-40-4-40-4M640 460c0 0 2 63 1 72s7 88 5 97-2 31-2 31l-15 2c0 0-3-39-8-54s-8-56-8-56-15-73-13-83 40-8 40-8M543 357c0 0 16-4 19 1s-6 13-10 13-10-4-10-4z"/>
		<!-- pants and shoes -->
		<path class="fill-base-700" d="M555 657l3 17s-10 13-5 15 28 0 28 0l-1-32zM651 657l-3 17s10 13 5 15-28 0-28 0l1-32zM561 367c0 0-10 1-14 23s-18 76-6 79 45 11 47 9 4-9 4-9-4 11 1 11 54-8 53-11-6-77-26-102z"/>
		<!-- shirt -->
		<path class="fill-accent-500" d="M672 435c-4-53-23-174-23-174l-102 1-45 37c0 0-13 10-9 21s10 39 29 38c0 0 11 15 18 13s11-13 8-14l-14-14 13-24h4c1 2 17 30 5 52 0 0 4-3 70 3l5-31c-6 53 25 92 24 97s18-5 18-5"/>
		<!-- hair -->
		<path class="fill-base-700" d="M659 246c-16-20-18-32-27-39s-24-13-35-13-27 12-37 23-36 37-38 45 0 16 4 23 9 14 15 18l19-26 3 37c13 4 28 5 42 4l4-15 4 15c17-2 34-8 44-21s12-37 2-51"/>
		<!-- plant -->
		<path class="fill-base-700" d="M103 591v93c0 0 71 23 140 0v-93z"/>
		<ellipse class="fill-base-800" cx="171.9" cy="591.5" rx="69" ry="10.5"/>
		<path class="fill-base-700" d="M252 480c-17 64-77 104-77 104s-31-65-14-129 77-104 77-104 32 65 14 129"/>
		<path class="fill-accent-500" d="M94 480c17 64 77 104 77 104s31-65 14-129-77-104-77-104-32 65-14 129"/>
		<path class="fill-base-700" d="M119 466c48 47 54 118 54 118s-72-4-119-50-54-118-54-118 72 4 119 50M227 466c-48 47-54 118-54 118s72-4 119-50 54-118 54-118-72 4-119 50"/>
	</svg>
{:else if name === 'firefox_support'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1071.1 838.4">	
		<!-- background -->
		<path class="fill-base-100 dark:fill-base-900" d="M88 648c-68 0-110-70-76-126s119-240 49-336 9-183 88-186 194 52 282 62 189-2 289-18 287 127 262 221-9 106 33 149 61 143 44 187-32 47-43 47"/>
		<!-- bottom foot -->
		<path class="fill-red-200" d="M465,745c-106.87 46.16-264.5 142-225.97 52.81.04-16.99-6.65-39.74 12-50s14.49 22.73 33.2 19.3c63.05-16.31 115.55-61.88 175.6-83.11z"/>
		<!-- top foot -->
		<path class="fill-red-200" d="m390 728c-42 20-26 99-68 101-15-4-16-22-24-33s-12-12-14-20c-5-18 15-29 31-30 13-36 2-87 23-125 63-83 114 71 52 107z"/>
		<!-- neck -->
		<path class="fill-red-200" d="M582 274c-5 27-6 35-1 42s6 6 31 21l-28 76-136-39 66-123z"/>
		<!-- head -->
		<circle class="fill-red-200" cx="558" cy="235" r="62"/>
		<!-- dress -->
		<path class="fill-accent-500" d="M225 712c71-54 117-157 306-343l48 19c13-16 9-66 37-53 0 54 3 142-110 326-28 28-7 81-47 100-2-32-24-78-58-45 1-139-71-87-79 8 0 0-46-29-97-12"/>
		<!-- arm -->
		<path class="fill-red-200" d="M645 480l-49-1 9-68c0 0 5-16-9-19l20-55c26-1 40 19 41 45z"/>
		<!-- hair -->
		<path class="fill-base-800" d="M611 238c71-40-45-116-90-117s-60 14-68 41 1 38-5 55-37 40-47 65 4 62 9 94-30 117-85 134c65 10 92 4 136-44 86-17 83-78 65-149-2-27 7-53 24-74s33 0 61-5"/>
		<path class="fill-base-900" d="M575 140c31 17 65 69 19 87-28 5-39-22-61 6-71 80 60 185-89 223-25 22-36 44-75 47s-30 2-44 9c65 10 92 5 136-44 86-17 83-78 65-149-2-27 7-53 24-74s33 0 61-6 26-25 21-42-26-48-57-57"/>
		<!-- firefox logo -->
		<circle class="fill-accent-500" cx="659" cy="546" r="91"/>
		<path class="fill-base-800" d="M817 481c-8-18-23-37-35-44 8 16 14 34 17 52-21-53-65-78-89-128-43 25-58 72-59 95 33-3 65 15 81 44-12-8-27-12-41-10 80 40 19 169-71 126-39-21-72-80 16-86 5 0 20-15 21-19 0-1-30-13-42-25-9-8-10-10-16-15-4-14-4-28-1-42-16 8-30 19-41 32-7-9-7-37-6-43-16 8-28 23-39 37-19 26-27 58-28 89 15 271 419 193 331-64"/>
	</svg>
{:else if name === 'timer'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 561.8 595.2">
		<!-- ground -->
		<path class="fill-base-100 dark:fill-base-900" d="M555 577c14 17-569 17-555 0-14-17 569-17 555 0"/>
		<!-- legs -->
		<path class="fill-red-200" d="M501 550l-14 0-7-24 21 0m-117 23-14 0-7-30 21 0"/>
		<!-- shoes, pants, hair back -->
		<path class="fill-base-700" d="M509 575h-10l-2-10-5 10c-39 2-45-5-9-26v-10l23 1zM392 574h-10l-2-10-5 10c-39 2-45-5-9-26v-10l23 1zM526 519c-3 13-52 11-61 12-9 2-22-207-22-207-14 0-40 98-40 98s9 103-2 105c-7 1-56-3-63-6 4-47 43-244 74-277 16-2 48-4 64-3l0 0c5-6 28 25 22 83-10 85 31 188 29 195M535 94c-16 0-9-22-16-30s-42-55-63-27l-5-3c-5 3-12 7-15 13-99-8 7 125 16 21 6-2 12-7 12-14 30 19 11 67 47 50"/>
		<!-- arms and head -->
		<path class="fill-red-200" d="M503 205l-16 9 34 74c-5 21 35 8 12-6zM336 121l9-16-68-45c-11-20-33 9-13 12zM442 82a24 24 0 10-48 0 24 24 0 1048 0"/>
		<!-- shirt -->
		<path class="fill-accent-500" d="M519 242c0 0-63-192-128-114l-76-45-14 15 78 53c-7 43 43 48 14 109 27 14 75 20 95-12-2-10-10-18-23-25l-14-61 48 86z"/>
		<!-- hair front -->
		<path class="fill-base-700" d="m432 86 0-9-5 8c-14 5-27-1-38-8-2-13 4-21 17-23s48-2 38 34z"/>
		<!-- mascot -->
		<g transform="scale(0.5) translate(470 650)">
			<use href="#mascot" />
		</g>
		<!-- timer -->
		<path class="fill-base-700" d="M64 96v-36h208v36M64 580v-36h208v36"/>
		<path class="fill-base-200" d="M84 96c-24 96 60 160 60 224s-84 128-60 224h168c24-96-60-160-60-224s84-128 60-224z"/>
		<path class="fill-accent-500" d="M96 112c0 96 60 112 60 208s-60 112-60 208h144c0-96-60-112-60-208s60-112 60-208z"/>
	</svg>
{:else if name === 'watch'}
	<!-- prettier-ignore -->
	<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 100 906 650">
		<!-- watch -->
		<path d="M325 608v-500h-93v498zM418 376c15 0 23-9 23-27s-8-27-23-27z" class="fill-base-700"/>
		<path d="M424 355a144 144 0 10-288 0 144 144 0 10288 0" class="fill-base-100"/>
		<path d="M380 355a100 100 0 10-200 0 100 100 0 10200 0" class="fill-base-300"/>
		<circle cx="279" cy="362" r="14" class="fill-base-900"/>
		<path d="M279 311l7 55h-14zM362 363l-91 3v-8z" class="fill-base-900"/>
		<!-- ground -->
		<ellipse cx="680" cy="745" rx="140" ry="10" class="fill-base-100 dark:fill-base-900"/>
		<!-- mascot -->
		<g transform="scale(0.5) translate(500 920)">
			<use href="#mascot" />
		</g>
		<!-- person -->
		<g transform="translate(-182 -64)">
			<!-- hair back -->
			<circle class="fill-base-700" cx="800" cy="300" r="31"/>
			<!-- head -->
			<circle class="fill-red-200" cx="800" cy="308" r="28"/>
			<!-- hands -->
			<path class="fill-red-200" d="M748 495l28 63 7-24-16-45zM893 450l-8 74 19 23 13-90z"/>
			<!-- pants and shoes -->
			<path class="fill-base-900" d="M788 510s-18 33-12 50l61 222h42s2-33-1-37-25-126-25-126l-3-40 59 195 35 1s11-17 3-43l-18-55-33-173-108 6zM846 771s-22 28-28 27-13 14 0 15h65l-4-31zM920 769l-7 12 3 18s6 7 6 13 34 1 34-1-14-41-22-42z"/>
			<!-- shirt -->
			<path class="fill-base-700" d="M761 372c8-5 15-11 23-16 9 1 21 10 31-5s37-7 55-10 55 98 47 121c-8-7-19-10-27-4h-32v56c-24 11-55 13-73-2v-52h-16c-6 9 3 22 4 33-15-6-19 5-28 8-6-41-8-92 15-130"/>
			<!-- jacket -->
			<path class="fill-accent-500"d="M791 341s-39 9-39 29 14 163 32 163 0 0 18 0-6-161-11-192M815 338s30-10 57 0l0 38 44 141s-21-12-35-1-36 15-39 9l-31-159s0-25 4-28"/>
			<!-- hair -->
			<path class="fill-base-700" d="M779 287s-6-17 3-22l3 7s23-14 29-11l-6 8s27 0 29 11l-10 0s10 7 11 18l-20 1 10 6s-37 5-46-10z"/>
		</g>
	</svg>
{:else if name === 'balloons'}
	<!-- prettier-ignore -->
	<svg viewBox="0 -5 572 710" xmlns="http://www.w3.org/2000/svg">
		<!-- ground -->
		<ellipse cx="190" cy="705" rx="190" ry="10" class="fill-base-100 dark:fill-base-900"/>
		<!-- mascot -->
		<g transform="scale(0.4) translate(680 1180)">
			<use href="#mascot" />
		</g>
		<!-- legs -->
		<path class="fill-red-200" d="M237 687h12l6-47h-18zM79 664l11 6 29-38-16-9z"/>
		<!-- shoes and pants -->
		<path class="fill-base-800" d="M234 683h24a15 15 0 0116 16h-40zM70 673l8-14 21 12a15 15 0 015 21zM234 677l-27-165c-21 47-55 97-96 142l-28-13 98-164c30-6 58 1 79 20l0 179-26 2z"/>
		<!-- hair -->
		<path class="fill-base-800" d="M170 297c-25-101 83-71 62 0z"/>
		<!-- face -->
		<circle class="fill-red-200" cx="206" cy="272" r="25"/>
		<!-- hair -->
		<path class="fill-base-800" d="M176 268a31 31 0 1162 0z"/>
		<!-- shirt -->
		<path class="fill-base-700" d="M244 394c3-33-10-68-36-91a9 9 0 00-12 1c-14 16-23 31-27 46l19 57c-24 29-38 68-37 107a233 233 0 01121-7z"/>
		<!-- shirt shadow -->
		<path d="M187 382l36 79 21-21z" opacity="0.1"/>
		<g>
			<animateTransform attributeName="transform" dur="3s" repeatDur="indefinite" type="rotate" values="0 268 456; -5 268 456; 0 268 456"/>
			<!-- balloon - purple 500 -->
			<path fill="#6366f1" d="M510 105c3-44-23-82-58-85s-68 31-71 75 18 75 49 83l-3 13 24 2-1-13c32-3 58-35 60-75"/>
			<!-- balloons -->
			<path class="fill-accent-500" d="M385 81c0-44-28-80-64-81s-65 35-66 79 23 73 55 80l-2 13 24 0-2-13c31-6 55-39 55-78M561 148c20-39 11-84-20-101s-74 1-95 40-14 76 11 96l-8 10 21 11 5-12c30 10 67-8 86-44"/>
			<!-- balloon whites -->
			<path class="fill-white" d="M276 101h-9a146 146 0 011-51h9q-6 26-1 51M400 117h-9a146 146 0 014-51h9q-7 26-4 51M455 116l-8-4a146 146 0 0124-45l8 4q-17 20-24 45"/>
			<!-- balloon bottoms and strings -->
			<path class="fill-base-700" d="M306 159l27 1 0 6-27-1zM425 178h27v6h-27zM454 181l24 13-3 5-24-13zM241 500l197-320 3 1-196 321zm0-6 222-304 2 2-221 304zm14 38 66-370 3 0-66 371z"/>
		</g>
		<!-- hand -->
		<path class="fill-red-200" d="M268 466a10 10 0 01-9-12l-30-20 17-7 26 20a10 10 0 01-4 19"/>
		<!-- shirt sleeve -->
		<path class="fill-base-700" d="M239 452l-53-63 27-12 49 58z"/>
	</svg>
{:else if name === 'calendar'}
	<!-- prettier-ignore -->
	<svg viewBox="0 0 867 615" xmlns="http://www.w3.org/2000/svg">
		<!-- background -->
		<ellipse class="fill-base-700" cx="580" cy="608" rx="280" ry="5"/>
		<!-- mascot -->
		<g transform="scale(0.4) translate(680 970)">
			<use href="#mascot" />
		</g>
		<!-- right hand -->
		<path class="fill-red-200" d="M726 375l16 6 4 29c3 26-29 9-12-3z"/>
		<!-- legs -->
		<path class="fill-red-200" d="M721 594h11l6-43h-17zm-110-8 11 3 17-40-16-5z"/>
		<!-- right sleeve -->
		<path class="fill-base-700" d="M730 396l-14-27 2-68c2 4 27 56 25 73l3 16z"/>
		<!-- shoes and pants -->
		<path class="fill-base-800" d="M718 591h22c8 0 14 6 14 14h-36zm-109-10 22 6c7 2 11 10 9 18l-35-10zM710 577l-22-161-49 161-38-14 55-214 57-4 42 219z"/>
		<!-- shirt -->
		<path class="fill-accent-500" d="M704 273c0 0-21-11-49-6l4 87c0 0 38 22 51-4z"/>
		<!-- jacket -->
		<path class="fill-base-700" d="M707 438l4-76-11-91c14-2 19 22 19 22l24 135zm-46 1-42-5c0-7 3-153 14-163 10-10 30-6 30-6zM651 344l-10-2c-15 4-76-14-47-41l39-30 9-2 3 16-24 27 36 19z"/>
		<!-- left hand -->
		<path class="fill-red-200" d="M625 338l11-12 29 7c25 8-4 31-8 11z"/>
		<!-- hair -->
		<path class="fill-base-800" d="M647 232c0-18 15-34 34-34s33 16 33 34v21c0 2-2 4-4 4h-58c-3 0-5-2-5-4z"/>
		<!-- face -->
		<circle class="fill-red-200" cx="680" cy="232" r="24"/>
		<!-- hair -->
		<path class="fill-base-800" d="M654 231l3-21c16-9 31-9 47 0l2 21c0 1-1 2-2 2l-5 0c-1 0-2 0-3-1l-2-5s-2-1-3 1l0 3c0 2-1 2-2 2h-33c-1 0-2 0-2-2z"/>
		<!-- calendar -->
		<!-- bg rect -->
		<rect class="fill-base-300 dark:fill-base-900" x="0" y="40" width="551" height="343"/>
		<!-- rect grid -->
		<path class="fill-white dark:fill-base-700" d="M37 106h101v66h-101zm125 0h101v66h-101zm126 0h101v66h-101zm125 0h101v66h-101zm-376 93h101v66h-101zm125 0h101v66h-101zm126 0h101v66h-101zm125 0h101v66h-101zm-376 93h101v66h-101zm125 0h101v66h-101zm126 0h101v66h-101zm125 0h101v66h-101z"/>
		<!-- accent rect -->
		<path class="fill-accent-500">
			<animate attributeName="d" dur="12s" repeatCount="indefinite" calcMode="discrete" values="M37 106h101v66h-101z;M162 106h101v66h-101z;M288 106h101v66h-101z;M413 106h101v66h-101z;M37 199h101v66h-101z;M162 199h101v66h-101z;M288 199h101v66h-101z;M413 199h101v66h-101z;M37 292h101v66h-101z;M162 292h101v66h-101z;M288 292h101v66h-101z;M413 292h101v66h-101z"/>
		</path>
		<!-- circles -->
		<circle class="fill-white dark:fill-base-700" cx="144" cy="65" r="15"/>
		<circle class="fill-white dark:fill-base-700" cx="394" cy="65" r="15"/>
		<!-- vertical rects -->
		<path class="fill-base-300 dark:fill-base-900" d="M138 0h12v70h-12zm250 0h12v70h-12z"/>
	</svg>
{/if}
