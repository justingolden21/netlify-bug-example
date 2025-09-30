import type { Theme } from '$lib/stores/themes';
import classicTheme from './classic';

export default {
	...classicTheme,
	id: '2',
	name: 'Classic Night Theme',
	pin: { ...classicTheme.pin, fill: { ...classicTheme.pin.fill, lightness: '900' } },
	face: { ...classicTheme.face, fill: { ...classicTheme.face.fill, lightness: '900' } }
} satisfies DeepPartial<Theme>;
