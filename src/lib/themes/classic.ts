import type { Theme } from '$lib/stores/themes';

const classicTheme = {
	id: '1',
	name: 'Classic Theme',
	face: {
		stroke: {
			lightness: '500',
			palette: 'base'
		},
		fill: {
			lightness: '50',
			palette: 'base'
		},
		strokeWidth: 2,
		shape: 'circle'
	},
	shadow: {
		fill: {
			lightness: '-1',
			palette: 'base'
		}
	},
	pin: {
		stroke: {
			lightness: '-1',
			palette: 'base'
		},

		fill: {
			lightness: '800',
			palette: 'accent'
		},
		strokeWidth: 0,
		size: 1
	},
	numerals: {
		style: 'none',
		fontFamily: 'Arsenal',
		fill: {
			lightness: '700',
			palette: 'base'
		}
	},
	ticks: {
		sm: {
			stroke: {
				lightness: '500',
				palette: 'base'
			},
			height: 1,
			width: 1
		},
		md: {
			stroke: {
				lightness: '600',
				palette: 'base'
			},
			height: 1.5,
			width: 3
		},
		lg: {
			stroke: {
				lightness: '800',
				palette: 'base'
			},
			height: 2,
			width: 5
		}
	},
	hands: {
		secondHandMovement: 'sweeping',
		hour: {
			stroke: {
				lightness: '800',
				palette: 'base'
			},
			strokeWidth: 1.5,
			length: 15,
			back: 3,
			linecap: 'round'
		},
		minute: {
			stroke: {
				lightness: '600',
				palette: 'base'
			},
			strokeWidth: 1,
			length: 21,
			back: 3,
			linecap: 'round'
		},
		second: {
			stroke: {
				lightness: '800',
				palette: 'accent'
			},
			strokeWidth: 0.5,
			length: 27,
			back: 9,
			linecap: 'round'
		}
	}
} satisfies DeepPartial<Theme>;

export default classicTheme;
