// Color utility functions
// Used for conversion and to get the hex color string of a color object in theme settings

import TailwindColors from 'tailwindcss/colors.js';

import type { Settings } from '$lib/stores/settings';

// Used in `__layout` to generate color palette variables inside HTML
const hexToRgb = (hex: string) => {
	// https://stackoverflow.com/a/5624139/4907950
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result) throw new Error('Invalid hex');
	return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
};

interface ColorObject {
	lightness: ColorLightness | '-1';
	palette: 'base' | 'accent';
}
/**
 * Given a color object, return hex color
 * @param {object} obj: color information object from a theme
 * @param {string} lightness: a string (100, 200, 300) that represents the lightness of the color in the tailwind theme
 * if -1, return 'none' (transparent)
 * @param {string} palette: 'base' unless otherwise specified, 'accent' is the other valid color palette
 * @param {Settings} settings: user `$settings` store to access color settings and read palette
 * Must depend on `$settings` so it updates when palette changes
 * @returns hex color string or 'none'
 */
const getColor = (obj: ColorObject, settings: Settings) =>
	obj === undefined || obj.lightness === '-1'
		? 'none'
		: TailwindColors[settings[`${obj.palette ?? 'base'}ColorPalette`]][obj.lightness];

export { getColor, hexToRgb };
