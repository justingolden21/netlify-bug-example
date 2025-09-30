<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fade, fly, scale } from 'svelte/transition';

	import AnalogClock from '$lib/components/features/analog/AnalogClock.svelte';
	import NoTimezones from '$lib/components/pages/worldclock/NoTimezones.svelte';
	import WorldclockDropdown from '$lib/components/pages/worldclock/WorldclockDropdown.svelte';
	import { settings } from '$lib/stores/settings';
	import { allThemes } from '$lib/stores/themes';
	import { defaultTheme } from '$lib/themes';
	import getFormat from '$lib/util/getFormat';
	import { now } from '$lib/util/now.svelte';
	import { getDateTime, getHourDiff, getUtcOffset } from '$lib/util/timeText';

	// @see displayOptions in util/toggleDisplay
	const primaryDisplay = $derived($settings.worldclock.displays.primary);
	const secondaryDisplay = $derived($settings.worldclock.displays.secondary);

	// TODO setting for toggling border
	const hasBorder = true;

	const getTimezoneName = (timezone: { name: string; zone: string }) =>
		timezone.name !== '' ? timezone.name : timezone.zone.split('_').join(' ');

	const currentTheme = $derived(
		$allThemes.find((theme) => theme.id == $settings['worldclock'].themeID) ??
			JSON.parse(JSON.stringify(defaultTheme))
	);

	function worldclockDateTime(now: Date, timezone: string, type: 'date' | 'time') {
		return getDateTime(now, getFormat('worldclock', type), undefined, timezone);
	}
</script>

<!-- primary / home timezone -->
{#if primaryDisplay !== 'none'}
	<div
		transition:fly|local={{ y: -160, duration: 250 }}
		class="grid gap-4 mb-4"
		class:grid-cols-2={primaryDisplay === 'analog_digital'}>
		<div class:col-span-2={primaryDisplay !== 'analog_digital'}>
			<p class="p">
				{worldclockDateTime(now.value, $settings.locale.timezone || 'Etc/GMT', 'date')}
			</p>
			<p class="h1 my-4">
				{worldclockDateTime(now.value, $settings.locale.timezone || 'Etc/GMT', 'time')}
			</p>

			<p class="p">
				{($settings.locale.timezone || 'Etc/GMT').split('_').join(' ')} &mdash;
				<span>UTC {getUtcOffset($settings.locale.timezone || 'Etc/GMT')}</span>
			</p>
		</div>
		{#if primaryDisplay === 'analog_digital'}
			<div class="w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 relative ml-auto">
				<AnalogClock theme={currentTheme} />
			</div>
		{/if}
	</div>
{/if}

<!-- secondary / other timezones -->
{#if secondaryDisplay === 'rows' || secondaryDisplay === 'compact_rows'}
	{#each $settings.worldclock.timezones as timezone, idx (`${idx}-${timezone.zone}-${timezone.name}`)}
		<div
			animate:flip={{ duration: 250 }}
			in:scale|local={{ duration: 250 }}
			out:fade|local={{ duration: 125 }}
			class="relative group">
			<div
				class="grid grid-cols-2 gap-4 border-0 {hasBorder
					? 'border-t-2'
					: 'my-4 sm:my-6'} p-4 surface">
				<div class="break-words">
					<p class="p">{getTimezoneName(timezone)}</p>
					{#if secondaryDisplay === 'rows'}
						<p class="h1 sm:h3">
							{worldclockDateTime(now.value, timezone.zone, 'time')}
						</p>
						<p class="p">
							{worldclockDateTime(now.value, timezone.zone, 'date')}
						</p>
						<hr class="shorter my-2" />
					{/if}
					<p class="p">
						UTC {getUtcOffset(timezone.zone)}
						(<span class="font-bold">{getHourDiff(timezone.zone, now.value)}</span>)
					</p>
				</div>
				<div>
					{#if secondaryDisplay === 'rows'}
						<div class="w-24 h-24 sm:w-32 sm:h-32 relative ml-auto mr-6">
							<AnalogClock theme={currentTheme} timezone={timezone.zone} />
						</div>
					{:else}
						<p class="h1 sm:h3">
							{worldclockDateTime(now.value, timezone.zone, 'time')}
						</p>
						<p class="p">
							{worldclockDateTime(now.value, timezone.zone, 'date')}
						</p>
					{/if}
				</div>
			</div>
			<WorldclockDropdown {idx} classes="absolute top-2 right-2" />
		</div>
	{/each}
{:else}
	<div class="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6 mt-4 lg:mt-6">
		{#each $settings.worldclock.timezones as timezone, idx (`${idx}-${timezone.zone}-${timezone.name}`)}
			<div
				animate:flip={{ duration: 250 }}
				in:scale|local={{ duration: 250 }}
				out:fade|local={{ duration: 125 }}
				class="relative group {secondaryDisplay === 'analog_grid'
					? 'text-center'
					: 'text-left'} break-words {!hasBorder && 'border-0'} rounded surface p-4">
				<p class="p">{getTimezoneName(timezone)}</p>
				<p class="h1 sm:h3">
					{worldclockDateTime(now.value, timezone.zone, 'time')}
				</p>
				{#if secondaryDisplay === 'analog_grid'}
					<div class="w-24 h-24 sm:w-32 sm:h-32 relative mx-auto">
						<AnalogClock theme={currentTheme} timezone={timezone.zone} />
					</div>
				{/if}
				<p class="p">{worldclockDateTime(now.value, timezone.zone, 'date')}</p>
				<hr class="shorter my-2 {secondaryDisplay === 'analog_grid' ? 'mx-auto' : ''}" />
				<p class="p">
					UTC {getUtcOffset(timezone.zone)}
					(<span class="font-bold">{getHourDiff(timezone.zone, now.value)}</span>)
				</p>
				<WorldclockDropdown {idx} classes="absolute top-2 right-2" />
			</div>
		{/each}
	</div>
{/if}

{#if $settings.worldclock.timezones.length === 0}
	<NoTimezones />
{/if}
