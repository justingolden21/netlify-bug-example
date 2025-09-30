import lz from 'lz-string';

import type { Theme } from '$lib/stores/themes';

const encodeTheme = (theme: Partial<Theme>) => lz.compressToBase64(JSON.stringify(theme));
const decodeTheme = (theme: string) => JSON.parse(lz.decompressFromBase64(theme));

export { decodeTheme, encodeTheme };
