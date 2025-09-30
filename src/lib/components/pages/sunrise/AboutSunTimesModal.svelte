<script lang="ts">
	import { dictionary } from '$lib/stores/languageDictionary';

	const modalData = $derived($dictionary.sunriseSunsetSettings.sunTimesModal);

	/**
	 * Property	Description
	 * `sunrise` -	sunrise (top edge of the sun appears on the horizon)
	 * `sunriseEnd` -	sunrise ends (bottom edge of the sun touches the horizon)
	 * `goldenHourEnd` -	morning golden hour (soft light, best time for photography) ends
	 * `solarNoon` -	solar noon (sun is in the highest position)
	 * `goldenHour` -	evening golden hour starts
	 * `sunsetStart` -	sunset starts (bottom edge of the sun touches the horizon)
	 * `sunset` -	sunset (sun disappears below the horizon, evening civil twilight starts)
	 * `dusk` -	dusk (evening nautical twilight starts)
	 * `nauticalDusk` -	nautical dusk (evening astronomical twilight starts)
	 * `night` -	night starts (dark enough for astronomical observations)
	 * `nadir` -	nadir (darkest moment of the night, sun is in the lowest position)
	 * `nightEnd` -	night ends (morning astronomical twilight starts)
	 * `nauticalDawn` -	nautical dawn (morning nautical twilight starts)
	 * `dawn` -	dawn (morning nautical twilight ends, morning civil twilight starts)
	 *
	 * angle, rise, set
	 * [-0.833, 'sunrise',       'sunset'      ],
	 * [  -0.3, 'sunriseEnd',    'sunsetStart' ],
	 * [    -6, 'dawn',          'dusk'        ],
	 * [   -12, 'nauticalDawn',  'nauticalDusk'],
	 * [   -18, 'nightEnd',      'night'       ],
	 * [     6, 'goldenHourEnd', 'goldenHour'  ]
	 */
</script>

<div class="pad">
	<h3 class="h3 mb-2">
		{modalData['Definitions of Sun Times']}
	</h3>
	<table class="p striped text-left">
		<thead>
			<tr>
				<th>{modalData.sunTimesDefinitionsTable[0][0]}</th>
				<th>{modalData.sunTimesDefinitionsTable[0][1]}</th>
			</tr>
		</thead>
		<tbody>
			{#each modalData.sunTimesDefinitionsTable as item, idx}
				{#if idx !== 0}
					<tr>
						<td>{item[0]}</td>
						<td>{item[1]}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>

	<h3 class="h3 mt-6 mb-2">
		{modalData['Angles for Sun Times']}
	</h3>

	<table class="p striped text-left">
		<thead>
			<tr>
				<th>{modalData.sunTimesAnglesTable[0][0]}</th>
				<th>{modalData.sunTimesAnglesTable[0][1]}</th>
				<th>{modalData.sunTimesAnglesTable[0][2]}</th>
			</tr>
		</thead>
		<tbody>
			{#each modalData.sunTimesAnglesTable as item, idx}
				{#if idx !== 0}
					<tr>
						<td>{item[0]}</td>
						<td>{item[1]}</td>
						<td>{item[2]}</td>
					</tr>
				{/if}
			{/each}
		</tbody>
	</table>
</div>

<style lang="postcss">
	th,
	td:first-child {
		@apply font-bold;
	}
</style>
