// Function to detect if the app is running in Tauri
function isTauri() {
	return typeof window !== 'undefined' && (window as any).__TAURI_INTERNALS__;
}

export default isTauri;
