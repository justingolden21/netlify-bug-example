/**
 * Converts a heading title to a hash / ID for use in `TextBlocks` with `StickySidebar`
 * @param title - string containing title of a heading
 * @returns - url safe hash composed of only alphanumeric characters and dashes
 */
export default function titleToHash(title: string) {
	// Replace spaces with dashes and remove non-alphanumeric characters
	return title
		.toLowerCase() // Convert to lowercase
		.replace(/\s+/g, '-') // Replace spaces with dashes
		.replace(/[^a-z0-9-]/g, '') // Remove non-alphanumeric characters except dashes
		.replace(/-+/g, '-'); // Replace consecutive dashes with a single dash
}
