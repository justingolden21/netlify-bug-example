<script lang="ts">
	import { quadOut } from 'svelte/easing';
	import { draw, fade, fly } from 'svelte/transition';

	interface Props {
		page: PageIcons;
		strokeWidth?: 'thin' | 'normal';
	}

	const { page, strokeWidth = 'normal' }: Props = $props();

	const pageIcons = {
		// `alarm` is currently unused
		alarm: {
			accent: 'M12 8v4l3 3',
			base: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0M2 4l3-3M19 1l3 3'
		},
		birthdays: {
			accent: 'M12 11v-3c1 0 2-1 2-2s-2-3-2-3-2 2-2 3 1 2 2 2',
			base: 'M4 16.5v3.5a2 2 0 002 2h12a2 2 0 002-2v-3.5m-17-2.5v-1a2 2 0 012-2h14a2 2 0 012 2v1a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3'
		},
		calendar: {
			accent: 'M16 2v4M8 2v4',
			base: 'M3 4h18v18h-18zM3 10h18'
		},
		clock: {
			accent: 'M12 8v4l3 3',
			base: 'M21 12a9 9 0 11-18 0a9 9 0 0118 0z'
		},
		changelog: {
			accent: 'M12 8v4l3 3',
			base: 'M1 11l2 2 2-2m-2 2v-1c0-5 4-9 9-9 2.8 0 5.4 1.3 7 3.3M19 13l2-2 2 2m-2-2v1c0 5-4 9-9 9-2.8 0-5.4-1.3-7-3.3'
		},
		chessclock: {
			accent: 'M7 8v-5h2-4M17 8v-3h2-4',
			base: 'M1 20h22v-12h-22zM10 14a3 3 90 11-6 0 3 3 90 016 0M20 14a3 3 90 11-6 0 3 3 90 016 0'
		},
		countdown: {
			accent: 'M16 7l-6 10h6l-6-10z',
			base: 'M2 14l2-2 2 2m-2-2a9 9 0 009 9 1 1 0 000-18'
		},
		pictureinpicture: {
			accent: 'M12 12h7v5h-7z',
			base: 'M2 4h20v16h-20z'
		},
		pomodoro: {
			accent: 'M12 9v4l3 3',
			base: 'M21 13a9 9 0 11-18 0M13.5 4v-2c-1-.75-2-.75-3.5 0v2c-3-1-5.5 1.5-5.5 1.5.5-.5 3.5.5 3.5.5-1.5 0-2.5 1.5-3 3 1.5-1 5-.5 7-2 2 1.5 5.5 1 7 2-.5-1.5-1.5-3-3-3 0 0 3-1 3.5-.5 0 0-2.5-2.5-6-1.5'
		},
		rubikscube: {
			accent: 'M12 8.75v4l2.25 2.25',
			base: 'M12 2.25l9 5.25v9l-9 5.25-9-5.25v-9l9-5.25'
		},
		stopwatch: {
			accent: 'M13 10v4',
			base: 'M21 14a8 8 0 11-16 0 8 8 0 0116 0M13 6v-4h4-8'
		},
		sunrisesunset: {
			accent: 'M12 8v4l3 3',
			base: 'M12 1v2M4.929 4.929l-1.414-1.414M19.778 4.222l-1.414 1.414M19 12a7 7 0 10-14 0'
		},
		timer: {
			accent: 'M17 22s-2-4-5-4-5 4-5 4m1-14h8',
			base: 'M4 2h16m-16 20h16m-13 0s-2-6 5-10 5-10 5-10m-10 0s-2 6 5 10 5 10 5 10'
		},
		timestamp: {
			accent: 'M12 4v2.67l2 2',
			base: 'M18 6.67a6 6 90 11-12 0 6 6 90 0112 0zM7 10a7 7 0 011 4v3h-4a2 2 0 00-2 2v1a2 2 0 002 2h16a2 2 0 002-2v-1a2 2 0 00-2-2h-4v-3a8 8 0 011-4'
		},
		weather: {
			accent: 'M22 14a1 1 0 00-12-7',
			base: 'M16 22a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z'
		},
		worldclock: {
			accent: 'M12.5 6.75v3l2.25 2.25',
			base: 'M19.25 9.75a6.75 6.75 90 11-13.5 0 6.75 6.75 90 0113.5 0M20.75 18l-1.5-1.5a.75.75 90 01-13.5-13.5l-1.5-1.5M12.5 19.5v3h2.25-5.25'
		},

		about: {
			accent: 'M13 16h-1v-4h-1m1-4h.01',
			base: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
		},
		more: {
			accent: 'M12 6v12',
			base: 'M6 12h12'
		}
	} as Record<PageIcons, { accent: string; base: string }>;
</script>

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" in:fly={{ duration: 1000, x: -20 }}>
	<g
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width={strokeWidth === 'thin' ? '1' : '2'}
		in:fade={{ duration: 1000 }}>
		<path
			in:draw={{ duration: 2000, easing: quadOut }}
			d={pageIcons[page]?.accent}
			class="stroke-accent-700 dark:stroke-accent-300"
			fill="none" />
		<path
			in:draw={{ duration: 2000, easing: quadOut }}
			d={pageIcons[page]?.base}
			class="stroke-base-700 dark:stroke-base-200"
			fill="none" />
	</g>
</svg>
