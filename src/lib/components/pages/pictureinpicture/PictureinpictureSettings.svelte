<script lang="ts">
	/**
	 * Settings component for `/pictureinpicture` settings
	 */

	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	const locale = $derived($settings.locale.language ?? 'en');
</script>

<div class="pad">
	<h3 class="h4 mb-2">{$dictionary.pictureinpictureSettings['Default Timer']}</h3>

	<div>
		<label for="timer-hours-input" class="label mr-2">
			{getTranslatedTimefield(locale, 'hour', true, true)}:
		</label>
		<input
			id="timer-hours-input"
			oninput={(event) => {
				event.preventDefault();
				const value = validateInt(event.currentTarget);
				$settings.pictureinpicture.timer.hours = value;
				event.currentTarget.value = String(value);
			}}
			value={$settings.pictureinpicture.timer.hours}
			type="number"
			min="0"
			max="23"
			required />
	</div>
	<div class="mt-4">
		<label for="timer-mins-input" class="label mr-2">
			{getTranslatedTimefield(locale, 'minute', true, true)}:
		</label>
		<input
			id="timer-mins-input"
			oninput={(event) => {
				event.preventDefault();
				const value = validateInt(event.currentTarget);
				$settings.pictureinpicture.timer.minutes = value;
				event.currentTarget.value = String(value);
			}}
			value={$settings.pictureinpicture.timer.minutes}
			type="number"
			min="0"
			max="59"
			required />
	</div>
</div>
