import type { Theme } from '$lib/stores/themes';

const emptyTheme = {
	id: '0',
	name: 'Empty Theme',
	face: {
		stroke: {
			lightness: '-1',
			palette: 'base'
		},
		fill: {
			lightness: '-1',
			palette: 'base'
		},
		strokeWidth: 0,
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
			palette: 'accent'
		},
		fill: {
			lightness: '-1',
			palette: 'base'
		},
		strokeWidth: 0,
		size: 0
	},
	numerals: {
		style: 'none',
		fontFamily: 'Arsenal',
		fill: {
			lightness: '-1',
			palette: 'base'
		}
	},
	ticks: {
		sm: {
			stroke: {
				lightness: '-1',
				palette: 'base'
			},
			height: 0,
			width: 0
		},
		md: {
			stroke: {
				lightness: '-1',
				palette: 'base'
			},
			height: 0,
			width: 0
		},
		lg: {
			stroke: {
				lightness: '-1',
				palette: 'base'
			},
			height: 0,
			width: 0
		}
	},
	hands: {
		secondHandMovement: 'sweeping',
		hour: {
			stroke: {
				lightness: '-1',
				palette: 'base'
			},
			strokeWidth: 0,
			length: 0,
			back: 0,
			linecap: 'square'
		},
		minute: {
			stroke: {
				lightness: '-1',
				palette: 'base'
			},
			strokeWidth: 0,
			length: 0,
			back: 0,
			linecap: 'square'
		},
		second: {
			stroke: {
				lightness: '-1',
				palette: 'accent'
			},
			strokeWidth: 0,
			length: 0,
			back: 0,
			linecap: 'square'
		}
	}
} satisfies DeepPartial<Theme>;

export default emptyTheme;
