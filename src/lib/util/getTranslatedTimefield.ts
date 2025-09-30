/**
 * Get the translated string value for 'year', 'week', 'day of week' etc. in any language.
 *
 * @param locale - Usually `$settings.locale.language`.
 * @param timeField - Unit to translate.
 * @param isPlural - When true, output the plural form using {@link Intl.PluralRules}.
 * @param capitalize - Capitalize the first letter of the returned unit.
 *
 * @link https://stackoverflow.com/q/70542229/4907950
 */

type TimeField =
	| 'era'
	| 'year'
	| 'month'
	| 'quarter'
	| 'week'
	| 'weekday'
	| 'dayPeriod'
	| 'day'
	| 'hour'
	| 'minute'
	| 'second'
	| 'millisecond';

export default function getTranslatedTimefield(
	locale: string = 'en',
	timeField: TimeField,
	isPlural: boolean = false,
	capitalize: boolean = false
) {
	const displayField = timeField === 'week' ? 'weekOfYear' : timeField;
	let base: string;

	if (timeField === 'millisecond') {
		// `dateTimeField` does not support milliseconds; use NumberFormat instead
		try {
			const parts = new Intl.NumberFormat(locale, {
				style: 'unit',
				unit: 'millisecond',
				unitDisplay: 'long'
			}).formatToParts(1);
			base = parts.find((p) => p.type === 'unit')?.value ?? '';
		} catch {
			base = 'millisecond';
		}
	} else {
		base = new Intl.DisplayNames([locale], { type: 'dateTimeField' }).of(displayField) ?? '';
	}

	let result = base;

	if (isPlural) {
		const pluralRules = new Intl.PluralRules(locale);
		if (pluralRules.select(2) !== 'one') {
			try {
				const unit = timeField === 'week' ? 'week' : timeField;
				if (
					['day', 'week', 'month', 'year', 'hour', 'minute', 'second', 'millisecond'].includes(unit)
				) {
					const parts = new Intl.NumberFormat(locale, {
						style: 'unit',
						unit: unit as
							| 'day'
							| 'week'
							| 'month'
							| 'year'
							| 'hour'
							| 'minute'
							| 'second'
							| 'millisecond',
						unitDisplay: 'long'
					}).formatToParts(2);
					const unitPart = parts.find((p) => p.type === 'unit')?.value;
					if (unitPart) result = unitPart;
				}
			} catch {
				// ignore and fallback
			}

			if (result === base) result = base + 's';
		}
	}

	if (capitalize && result) {
		return result.charAt(0).toUpperCase() + result.slice(1);
	}

	return result;
}
