<script lang="ts">
	import { onMount } from 'svelte';

	const batteryPath =
		'm10 5h-3c-1 0-1 1-1 1v14c0 1 1 1 1 1h10c1 0 1-1 1-1v-14c0-1-1-1-1-1h-3v-1c0-1-1-1-1-1h-2c-1 0-1 1-1 1v1';
	const lightningPath = 'M12.5 7.5v5h3l-4 6v-5h-3z';

	let batteryLevel: number = $state(100),
		batteryIsCharging: boolean = $state(false);

	let batterySupported = $state(false);
	let listeningToBattery = false;

	onMount(async () => {
		// https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery
		if (!(navigator && 'getBattery' in navigator && navigator.getBattery)) return;
		if (listeningToBattery) return;
		batterySupported = true;
		const battery = await (navigator.getBattery as any)();
		batteryLevel = battery.level;

		battery.addEventListener('levelchange', function () {
			batteryLevel = battery.level;
		});
		battery.addEventListener('chargingchange', function () {
			batteryIsCharging = battery.charging;
		});
		listeningToBattery = true;
	});
</script>

{#if batterySupported}
	<svg
		class="inline w-6 h-6 lg:w-10 lg:h-10"
		stroke="currentColor"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		xmlns:xlink="http://www.w3.org/1999/xlink"
		viewBox="0 0 24 24">
		{@html batteryPath}

		<defs>
			<linearGradient id="fillLevelGradient" y2="0%" x2="0%" y1="100%" x1="0%"
				><stop stop-color="currentColor" offset={(batteryLevel ? batteryLevel * 100 : 100) + '%'} />
				<stop stop-color="transparent" offset="0%" />
			</linearGradient>
		</defs>

		<path
			fill-rule="evenodd"
			fill="url('#fillLevelGradient')"
			stroke-width="1"
			stroke-linejoin="round"
			d={batteryIsCharging ? batteryPath + lightningPath : batteryPath} />
	</svg>

	{Math.round(batteryLevel * 100)}%
{/if}
