/**
 * Formats a number of seconds into a timer string
 * Displays sec, min, hr, and if days > 0, then days
 */
function formatTimer(seconds: number) {
	const days = Math.floor(seconds / (60 * 60 * 24));
	const hrs = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
	const mins = Math.floor((seconds % (60 * 60)) / 60);
	const secs = seconds % 60;

	const d = days > 0 ? days.toString().padStart(2, '0') + ':' : '';
	const h = hrs.toString().padStart(2, '0');
	const m = mins.toString().padStart(2, '0');
	const s = secs.toString().padStart(2, '0');

	return `${d}${h}:${m}:${s}`;
}

export default formatTimer;
