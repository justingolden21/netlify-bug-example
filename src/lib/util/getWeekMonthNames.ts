/**
 * Use Intl to generate week day and month string names for any locale
 *
 * Used by /calendar page
 *
 * Names can be long (ie. "January" / "Monday"), short (ie. "Jan" / "Mon") or narrow (ie. "M")
 * Example usage:
 * getMonthNames('en', 'short')
 * getWeekNames('fr', 'long')
 * getWeekNames($settings.locale.datetime, 'narrow')
 */

export function getWeekNames(locale: string, type: 'long' | 'short' | 'narrow') {
	// Fallback
	if (typeof Intl !== 'object' || typeof Intl.DateTimeFormat !== 'function') {
		if (type === 'narrow') return ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
		if (type === 'short') return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
		return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
	}

	// Create DateTimeFormat object with the specified locale and type
	const dateFormatter = new Intl.DateTimeFormat(locale, { weekday: type });

	// Get the weekday names
	const weekdays = Array.from({ length: 7 }, (_, index) => {
		// Start on Sunday and loop 7 times
		const date = new Date(2022, 0, index + 2);
		return dateFormatter.format(date);
	});

	return weekdays;
}

export function getMonthNames(locale: string, type: 'long' | 'short') {
	// Fallback
	if (typeof Intl !== 'object' || typeof Intl.DateTimeFormat !== 'function') {
		if (type === 'short')
			return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		// prettier-ignore
		return ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
	}

	// Create DateTimeFormat object with the specified locale and type
	const dateFormatter = new Intl.DateTimeFormat(locale, { month: type });

	// Get the month names
	const months = Array.from({ length: 12 }, (_, index) => {
		// Start on jan and loop 12 times
		const date = new Date(2022, index, 1);
		return dateFormatter.format(date);
	});

	return months;
}
