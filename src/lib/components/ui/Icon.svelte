<script lang="ts" module>
	export type TIcon = keyof typeof icons;
	export type TSize = keyof typeof sizes | 'unset';
	export type TStrokeWidth = keyof typeof strokeWidths;

	/**
	 * Most icons originally from heroicons.dev
	 * `application` and `cast` from iconoir.com
	 * `save` from basicons.xyz
	 * page icons, `battery`, `copy`, `pin`, `print`, `sunrise`, `sunset` by Justin
	 * icons optimized by Justin
	 */
	export const icons = {
		// `alarm` is currently unused
		alarm: 'm12 8v4l3 3m6-3a9 9 0 11-18 0a9 9 0 0118 0m-19-8 3-3m14 0 3 3',
		birthdays:
			'm4 16.5v3.5a2 2 0 002 2h12a2 2 0 002-2v-3.5m-17-2.5v-1a2 2 0 012-2h14a2 2 0 012 2v1a3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3 3 3 0 01-3 3 3 3 0 01-3-3m9-3v-3c1 0 2-1 2-2s-2-3-2-3-2 2-2 3 1 2 2 2',
		calendar: 'M3 4h18v18h-18zM16 2v4M8 2v4M3 10h18',
		changelog:
			'M12 8v4l3 3M1 11l2 2 2-2m-2 2v-1c0-5 4-9 9-9 2.8 0 5.4 1.3 7 3.3M19 13l2-2 2 2m-2-2v1c0 5-4 9-9 9-2.8 0-5.4-1.3-7-3.3',
		chessclock:
			'm1 20h22v-12h-22zm9-6a3 3 90 11-6 0 3 3 90 016 0m-3-6v-5h2-4m15 11a3 3 90 11-6 0 3 3 90 016 0m-3-6v-3h2-4',
		clock: 'm12 8v4l3 3m6-3a9 9 0 11-18 0a9 9 0 0118 0z',
		countdown: 'M16 7l-6 10h6l-6-10zM13 3a1 1 0 010 18 9 9 0 01-9-9m-2 2 2-2 2 2',
		pictureinpicture: 'M2 4h20v16h-20zM12 12h7v5h-7z',
		pomodoro:
			'm21 13a9 9 0 11-18 0m10.5-9v-2c-1-.75-2-.75-3.5 0v2c-3-1-5.5 1.5-5.5 1.5.5-.5 3.5.5 3.5.5-1.5 0-2.5 1.5-3 3 1.5-1 5-.5 7-2 2 1.5 5.5 1 7 2-.5-1.5-1.5-3-3-3 0 0 3-1 3.5-.5 0 0-2.5-2.5-6-1.5m-1.5 5v4l3 3',
		rubikscube: 'm12 8.75v4l2.25 2.25M12 2.25l9 5.25v9l-9 5.25-9-5.25v-9l9-5.25',
		stopwatch: 'M13 10v4M21 14a8 8 0 11-16 0 8 8 0 0116 0M13 6v-4h4-8',
		sunrisesunset:
			'm12 8v4l3 3m-3-14v2M4.929 4.929l-1.414-1.414M19.778 4.222l-1.414 1.414M19 12a7 7 0 10-14 0',
		timer:
			'M4 2h16m-16 20h16m-13 0s-2-6 5-10 5-10 5-10m-10 0s-2 6 5 10 5 10 5 10s-2-4-5-4-5 4-5 4m1-14h8',
		timestamp:
			'M12 4v2.67l2 2M18 6.67a6 6 90 11-12 0 6 6 90 0112 0zM7 10a7 7 0 011 4v3h-4a2 2 0 00-2 2v1a2 2 0 002 2h16a2 2 0 002-2v-1a2 2 0 00-2-2h-4v-3a8 8 0 011-4',
		weather: 'M16 22a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4zM22 14a1 1 0 00-12-7', // same as cloud_sun
		worldclock:
			'M12.5 6.75v3l2.25 2.25m4.5-2.25a6.75 6.75 90 11-13.5 0 6.75 6.75 90 0113.5 0m1.5 8.25-1.5-1.5a.75.75 90 01-13.5-13.5l-1.5-1.5m8.25 18v3h2.25-5.25',

		// Weather icons
		cloud: 'M16 19a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z',
		cloud_bolt: 'M16 16a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4M13 11l-4 5 5 0-4 5',
		cloud_rain:
			'M16 16a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4M9 13l-1 6m4-6-1 6m4-6-1 6',
		cloud_sun: 'M16 22a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4zM22 14a1 1 0 00-12-7',
		cloud_smog: 'M16 17a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4m4-3h5m-7 3h5m-7 3h5',
		snowflake:
			'm12 20v-16m-7 4 14 8m0-8-14 8m5-11 2 2 2-2m3 2-.8 2.6 2.8.4m0 4-2.8.4.8 2.6m-3 2-2-2-2 2m-3-2 .8-2.6-2.8-.4m0-4 2.8-.4-.8-2.6',

		application: 'm3 7c0-1 1-2 2-2h14c1 0 2 1 2 2v10c0 1-1 2-2 2h-14c-1 0-2-1-2-2zm7 1h2m4 0h2',
		arrow_left: 'M10 19l-7-7 7-7m-7 7h18',
		arrow_up: 'M5 10l7-7 7 7m-7-7v18',
		backspace: 'M10 20l-7-8 7-8h10a2 2 0 012 2v12a2 2 0 01-2 2zm2-10 4 4m0-4-4 4',
		cast: 'm2 20 0 0m13 0h5c1.1 0 2-.9 2-2v-12c0-1.1-.9-2-2-2h-16c-1.1 0-2 .9-2 2v1m0 9c2 .5 3.5 2 4 4m-4-8c4 .5 7.5 4 8 8',
		check: 'M5 13l4 4L19 7',
		chevron_down: 'M19 9l-7 7-7-7',
		chevron_left: 'M16 5l-7 7 7 7',
		chevron_right: 'M9 5l7 7-7 7',
		chevron_up: 'M5 15l7-7 7 7',
		close: 'M6 18L18 6M6 6l12 12',
		copy: 'M16 17v3a1 1 0 01-1 1h-10a1 1 0 01-1-1v-12a1 1 0 011-1h3m9 10h2a1 1 0 001-1v-12a1 1 0 00-1-1h-10a1 1 0 00-1 1v12a1 1 0 001 1h7',
		cube: 'm21 7.5v9l-9 5.25v-9zl-9-5.25-9 5.25v9l9 5.25v-9l-9-5.25',
		cube_rubiks:
			'M21 7.5v9l-9 5.25v-9zl-9-5.25-9 5.25v9l9 5.25v-9l-9-5.25M9 4l9 5.25v9M6 5.75l9 5.25v9M15 4l-9 5.25v9M18 5.75l-9 5.25v9M3 10.5l9 5.25 9-5.25M3 13.5l9 5.25 9-5.25',
		// cube_three:
		// 'M15 11v3l-3 1.75v-3zl-3-1.75-3 1.75v3l3 1.75v-3l-3-1.75M18 9.25v6l-6 3.5v-6zl-6-3.5-6 3.5v6l6 3.5v-6l-6-3.5M21 7.5v9l-9 5.25v-9zl-9-5.25-9 5.25v9l9 5.25v-9l-9-5.25',
		dots_vertical:
			'M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z',
		download: 'M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4-4 4-4-4m4 4V4',
		envelope:
			'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
		envelope_open:
			'M3 19v-9a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10v9M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M21 10l-7.89 5.26a2 2 0 01-2.22 0l-7.89-5.26',
		error: 'm12 8v4m0 4h.01m8.99-4a9 9 0 11-18 0 9 9 0 0118 0z',
		external_link: 'm10 6h-4a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4m-4-10h6v6m0-6-10 10',
		eye: 'm15 12a1 1 0 11-6 0 1 1 0 016 0m-12.5 0a10 10 0 019.5-7 10 10 0 019.5 7 10 10 0 01-9.5 7 10 10 0 01-9.5-7',
		eye_off:
			'm13.9 18.8a10 10 0 01-11.4-6.8 10 10 0 011.6-3m5.9.9a3 3 0 114.2 4.2m-7.6-7.5a10 10 0 0114.9 5.4 10 10 0 01-4.1 5.4m-14.4-14.4 18 18',
		fastforward: 'm5 6v12l8-6zm8 0v12l8-6z',
		fullscreen: 'm4 8v-4h4m12 4v-4h-4m-12 12v4h4m12-4v4h-4',
		info: 'm13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0',
		input:
			'M7 9v-4a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2v-4m3-6 3 3-3 3m3-3h-10',
		link: 'M14 10a4 4 0 00-6 0l-4 4a4 4 0 106 6l1-1m-1-5a4 4 0 006 0l4-4a4 4 0 00-6-6l-1 1',
		list: 'm8 8h12m-12 4h12m-12 4h12zm-4-8h.01m-.01 4h.01m-.01 4h.01',
		menu: 'M4 6h16M4 12h16M4 18h16',
		minus: 'm4 12h16',
		moon: 'M20.4 15.4A9 9 0 018.6 3.6 9 9 0 0012 21 9 9 0 0020.4 15.4Z',
		output:
			'M7 19v-14a2 2 0 012-2h6a2 2 0 012 2v4m0 6v4a2 2 0 01-2 2h-6a2 2 0 01-2-2m13-10 3 3-3 3m3-3h-10',
		pause: 'm8 6v12m8-12v12',
		pencil: 'm14 5 4 4m-2-6a2.5 2.5 0 114 4l-14 14h-4v-4z',
		pin: 'm10 14-7 7m2-12 10 10 2-2-1-4 5-5-5-5-5 5-4-1-2 2',
		play: 'm8 6v12l8-6z',
		plus: 'm12 6v12m-6-6h12',
		primary: 'm9 9l3-3v12h3h-6',
		print:
			'M18 18h1c0 0 2 0 2-2v-7c0 0 0-2-2-2h-14c0 0-2 0-2 2v7c0 0 0 2 2 2h1m11-11v-4c0 0 0-1-1-1h-8c-1 0-1 1-1 1v4m-1 7v7c0 0 0 1 1 1h10c0 0 1 0 1-1v-7c0 0 0-1-1-1h-10c0 0-1 0-1 1',
		save: 'm5 21h14c1 0 2-1 2-2v-10c0-1 0-1-1-2l-3-3c-1-1-1-1-2-1h-10c-1 0-2 1-2 2v14c0 1 1 2 2 2zm2-18v5h8v-5m-8 18v-6h10v6',
		secondary: 'm16 18h-8s8-6 8-10-8-4-8 0',
		settings:
			'm10.5 4.5a1 1 0 013 0 2 2 0 003 1 1 1 0 012 2 2 2 0 001 3 1 1 0 010 3 2 2 0 00-1 3 1 1 0 01-2 2 2 2 0 00-3 1 1 1 0 01-3 0 2 2 0 00-3-1 1 1 0 01-2-2 2 2 0 00-1-3 1 1 0 010-3 2 2 0 001-3 1 1 0 012-2 2 2 0 003-1m4.5 7.5a3 3 0 11-6 0 3 3 0 016 0',
		share:
			'm9 12a1 1 0 11-6 0 1 1 0 016 0m12-6a1 1 0 11-6 0 1 1 0 016 0m0 12a1 1 0 11-6 0 1 1 0 016 0m-12.3-4.7 6.6 3.4m-6.6-6 6.6-3.4',
		success: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
		sun: 'M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364-.707-.707M6.343 6.343l-.707-.707m12.728 0-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z',
		sunrise:
			'm12 20v1m9-9h-1m-16 0h-1m15.364 6.364-.707-.707m-11.314 0-.707.707m10.364-6.364a4 4 0 11-8 0 4 4 0 018 0zm-4 0v-10l-4 4m4-4 4 4',
		sunset:
			'm12 3v-1m9 9h-1m-16 0h-1m15.364-6.364-.707.707m-11.314 0-.707-.707m10.364 6.364a4 4 90 10-8 0 4 4 90 008 0zm-4 0v10l-4-4m4 4 4-4',
		switch_horizontal: 'm8 7h12l-4-4m4 4-4 4m0 6h-12l4 4m-4-4 4-4',
		table:
			'm3 10h18m-18 4h18m-9-4v8m7 0a2 2 0 002-2v-8a2 2 0 00-2-2h-14a2 2 0 00-2 2v8a2 2 0 002 2z',
		target: 'm20 12a8 8 0 11-16 0 8 8 0 0116 0zm-8-4v-8m4 12h8m-12 4v8m-6-12h-6',
		trash:
			'm19 7-1 12a2 2 0 01-2 2h-8a2 2 0 01-2-2l-1-12m5 4v6m4-6v6m1-10v-3a1 1 0 00-1-1h-4a1 1 0 00-1 1v3m-5 0h16',
		undo: 'm3 10h10a8 8 0 018 8v2m-12-4-6-6 6-6',
		upload: 'm4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8-4-4-4 4m4-4v12'
	};

	// 'unset' allows us to pass in a custom size class without worrying about specificity
	const sizes = {
		sm: 'w-4 h-4',
		md: 'w-6 h-6',
		lg: 'w-10 h-10',
		adaptive: 'w-4 h-4 sm:w-6 sm:h-6'
	};

	const strokeWidths = {
		thin: 1,
		normal: 2
	};
</script>

<script lang="ts">
	type Props = {
		name: TIcon;
		size?: TSize;
		strokeWidth?: TStrokeWidth;
		className?: string;
	};

	const { name, size = 'md', strokeWidth = 'normal', className = '' }: Props = $props();
</script>

<svg
	class={className + ` ${size !== 'unset' ? sizes[size] : ''} inline icon-${name}`}
	stroke="currentColor"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	viewBox="0 0 24 24">
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width={strokeWidths[strokeWidth]}
		d={icons[name]} />
</svg>
