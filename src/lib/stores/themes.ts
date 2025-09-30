import { derived, type Writable } from 'svelte/store';

import { fontFamilies, type numeralStyles } from '$lib/data/consts';
import * as builtinThemes from '$lib/themes';
import localStore from '$lib/util/localStore';

export interface Color {
	lightness: ColorLightness | '-1';
	palette: 'base' | 'accent';
}

export interface Hand {
	stroke: Color;
	strokeWidth: number;
	length: number;
	back: number;
	linecap: 'square' | 'inherit' | 'butt' | 'round';
}
export interface Tick {
	stroke: Color;
	height: number;
	width: number;
}
export interface Face {
	stroke: Color;
	strokeWidth: number;
	shape: string;
	fill: Color;
	width: number;
}
export interface Pin {
	stroke: Color;
	strokeWidth: number;
	size: number;
	fill: Color;
	width: number;
}
export interface Numerals {
	style: keyof typeof numeralStyles;
	fontFamily: keyof typeof fontFamilies;
	fill: Color;
}
export interface Shadow {
	fill: Color;
}
export interface Theme {
	id: string;
	uid: string;
	name: string;
	face: Face;
	shadow: Shadow;
	numerals: Numerals;
	ticks: {
		sm: Tick;
		md: Tick;
		lg: Tick;
	};
	hands: {
		hour: Hand;
		minute: Hand;
		second: Hand;
		secondHandMovement: 'sweeping' | 'grandfather' | 'modern';
	};
	pin: Pin;
}

export const userThemes = localStore('themes', []) as Writable<
	Array<Partial<Theme> & { id: string; name: string }>
>;

export const allThemes = derived(userThemes, ($userThemes) => [
	...Object.values(builtinThemes),
	...$userThemes
]);
