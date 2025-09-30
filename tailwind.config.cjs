const plugin = require('tailwindcss/plugin');
const colors = require('tailwindcss/colors');

function withOpacity(cssVariable) {
	return ({ opacityVariable, opacityValue }) => {
		if (opacityValue !== undefined) {
			return `rgba(var(${cssVariable}), ${opacityValue})`;
		}
		if (opacityVariable !== undefined) {
			return `rgba(var(${cssVariable}), var(${opacityVariable}, 1))`;
		}
		return `rgb(var(${cssVariable}))`;
	};
}

const dynamicColors = [
	'50',
	'100',
	'200',
	'300',
	'400',
	'500',
	'600',
	'700',
	'800',
	'900',
].reduce(
	(obj, item) => ({
		...obj,
		[`base-${item}`]: withOpacity(`--base-${item}`),
		[`accent-${item}`]: withOpacity(`--accent-${item}`),
	}),
	{}
);

module.exports = {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	safelist: ['dark'],
	darkMode: null,
	theme: {
		borderRadius: {
			none: '0',
			DEFAULT: '0.5rem',
			full: '9999px',
		},
		boxShadow: {
			md: '0 4px 6px 0 rgba(0,0,0,.1), 0 2px 4px rgba(0,0,0,.1)',
		},
		colors: {
			white: '#FFF',
			black: '#000',
			transparent: 'transparent',
			red: {
				200: colors.red[200],
			},
			...dynamicColors,
		},
		spacing: {
			0: '0',
			1: '0.25rem',
			2: '0.5rem',
			4: '1rem',
			6: '1.5rem',
			10: '2.5rem',
			12: '3rem',
			16: '4rem',
			24: '6rem',
			32: '8rem',
			48: '12rem',
			64: '16rem',
			80: '20rem',
			96: '24rem',
		},
		transitionDuration: {
			125: '125ms',
			250: '250ms',
			DEFAULT: '250ms',
		},
		transitionTimingFunction: {
			DEFAULT: 'linear',
		},
		extend: {
			fontSize: {
				'10xl': '10rem',
				'11xl': '12rem',
			},
			screens: {
				short: { raw: '(max-height: 360px)' },
			},
		},
	},
	plugins: [
		plugin(function ({ addUtilities, addVariant }) {
			addUtilities({
				'.drag-none': {
					'-webkit-user-drag': 'none',
					'-khtml-user-drag': 'none',
					'-moz-user-drag': 'none',
					'-o-user-drag': 'none',
					'user-drag': 'none',
				},
			});
			addVariant('dark', '@media not print { .dark & }');
		}),
	],
};
