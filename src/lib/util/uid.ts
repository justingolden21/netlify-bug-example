// Returns a uid nearly guaranteed to be unique

// https://stackoverflow.com/a/44078785
export default function uid(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2);
}
