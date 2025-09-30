// @see https://kit.svelte.dev/docs/types#app

/// <reference types="@sveltejs/kit" />

declare namespace App {
	interface Locals {
		languageDictionary: any;
		languageDictionaryAbout: any;
		lang: string;
	}
}

declare const __version__: string;
