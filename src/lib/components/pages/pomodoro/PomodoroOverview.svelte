<script lang="ts">
	import { scale } from 'svelte/transition';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	interface OverviewItem {
		type: 'pomodoro' | 'shortBreak' | 'longBreak';
		name?: string;
		progress?: number;
		poms?: number;
	}

	function getOverviewItems() {
		const items: OverviewItem[] = [];

		let totalPomMins = 0,
			totalBreakMins = 0;

		let pomsWithoutLongBreak = 0;
		for (let i = 0; i < $settings.pomodoro.timer.tasks.length; i++) {
			for (let j = 0; j < $settings.pomodoro.timer.tasks[i].poms; j++) {
				items.push({
					type: 'pomodoro',
					name: $settings.pomodoro.timer.tasks[i].name,
					progress: j + 1,
					poms: $settings.pomodoro.timer.tasks[i].poms
				});

				totalPomMins += $settings.pomodoro.minutes.pomodoro;

				pomsWithoutLongBreak++;

				if (pomsWithoutLongBreak === $settings.pomodoro.minutes.longBreakInterval) {
					pomsWithoutLongBreak = 0;
					items.push({
						type: 'longBreak'
					});

					totalBreakMins += $settings.pomodoro.minutes.longBreak;
				} else {
					items.push({
						type: 'shortBreak'
					});

					totalBreakMins += $settings.pomodoro.minutes.shortBreak;
				}
			}
		}
		return { items, totalPomMins, totalBreakMins };
	}

	const overview = $derived($settings.pomodoro.timer.tasks && getOverviewItems());
	const locale = $derived($settings.locale.language ?? 'en');
</script>

<div class="flex flex-col gap-6">
	{#each overview.items as item}
		{@const mins = $settings.pomodoro.minutes[item.type]}
		{@const maxMins = Math.max(
			$settings.pomodoro.minutes.pomodoro,
			$settings.pomodoro.minutes.shortBreak,
			$settings.pomodoro.minutes.longBreak
		)}
		<div transition:scale|local={{ duration: 250 }}>
			<div
				class="{item.type === 'pomodoro'
					? 'bg-base-300 dark:bg-base-700'
					: 'bg-base-200 dark:bg-base-800'} h-16"
				style:width={(mins / maxMins) * 100 + '%'}>
				<div class="p-2">
					<p class="font-normal p-sm">
						{#if item.type === 'pomodoro'}
							{item.name}
							{item.progress} / {item.poms}
						{:else}
							{$dictionary.pomodoroSettings.sections[item.type]}
						{/if}
					</p>
					<br />
				</div>
			</div>
			<p class="p-sm">
				{mins}
				{getTranslatedTimefield(locale, 'minute', true)}
			</p>
		</div>
	{/each}
</div>

<hr class="my-4" />
<p class="p-sm">
	{overview.totalPomMins}
	{getTranslatedTimefield(locale, 'minute', true)} |
	{overview.totalBreakMins}
	{getTranslatedTimefield(locale, 'minute', true)}
</p>
