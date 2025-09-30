declare global {
	// Necessary for localStorage, can be an array or non array
	type MaybeArray<T> = T | T[];

	// Used for themes, can have partial themes and themes are nested objects
	type DeepPartial<T> = {
		[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
	};

	type ColorLightness =
		| '50'
		| '100'
		| '200'
		| '300'
		| '400'
		| '500'
		| '600'
		| '700'
		| '800'
		| '900';

	// Defines a type that can be any value in a given array
	// Used for color palette in layout
	type ArrayValues<T extends unknown[] | readonly unknown[]> = T[number];
}

// To make `types.ts` a module
export {};

// Wrap around Object.keys for Typescript
export const getKeys = <T extends Record<string, unknown>>(object: T) =>
	Object.keys(object) as (keyof T)[];

// Wrap around Object.entries for Typescript
export const getEntries = <T extends Record<string, unknown>>(object: T) =>
	Object.entries(object) as [keyof T, T[keyof T]][];
