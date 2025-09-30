<script lang="ts">
	/**
	 * Static large vector used as a background inside `/weather`
	 */

	type WeatherIcon =
		| 'sun'
		| 'cloud_sun'
		| 'cloud'
		| 'cloud_smog'
		| 'cloud_rain'
		| 'snowflake'
		| 'cloud_bolt';

	interface Props {
		name?: WeatherIcon;
	}

	const { name = 'sun' }: Props = $props();
</script>

<div class="absolute top-0 left-0 w-full opacity-25">
	<svg
		class="max-h-[32rem] mx-auto"
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 {name === 'snowflake' ? '24 24' : '20 20'}">
		{#if name === 'sun'}
			<circle fill="#F97316" opacity="0.75" cx="10" cy="10" r="10" />
			<circle fill="#F59E0B" opacity="0.75" cx="10" cy="10" r="8" />
			<circle fill="#EAB308" opacity="0.75" cx="10" cy="10" r="6" />
		{:else if name === 'cloud_sun'}
			<circle fill="#EAB308" cx="12" cy="8" r="8" />
			<path
				fill="#BFDBFE"
				opacity="0.5"
				d="M13 19a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z" />
		{:else if name === 'cloud'}
			<path
				fill="#93C5FD"
				opacity="0.5"
				d="M15 14a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z" />
			<path
				fill="#BFDBFE"
				opacity="0.5"
				d="M13 19a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z" />
		{:else if name === 'cloud_smog'}
			<path
				fill="#93C5FD"
				opacity="0.5"
				d="M15 14a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z" />
			<path
				fill="#9CA3AF"
				d="m6 8h4a1 1 0 010 1h-4a1 1 0 010-1m5 0h3a1 1 0 010 1h-3a1 1 0 010-1m-5 2h3a1 1 0 010 1h-3a1 1 0 010-1m4 0h4a1 1 0 010 1h-4a1 1 0 010-1m-4 2h4a1 1 0 010 1h-4a1 1 0 010-1m5 0h3a1 1 0 010 1h-3a1 1 0 010-1" />
			<!-- m6 8h4v1h-4zm5 0h3v1h-3zm-5 2h3v1h-3zm4 0h4v1h-4zm-4 2h4v1h-4zm5 0h3v1h-3z -->
		{:else if name === 'cloud_rain'}
			<path
				fill="#93C5FD"
				opacity="0.5"
				d="M15 14a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z" />
			<path
				fill="#60A5FA"
				d="M10 6.9a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5zM7.5 11.3a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5zM11.2 8.8a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5zM8.7 13.1a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5zM13.4 8.9a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5zM10.9 13.3a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5zM14.7 10.8a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5zM12.2 15.1a1 1 0 011 .5l-2 3.5a1 1 0 01-1-.5z" />
			<!-- M7 8h1v4h-1zM7 13h1v4h-1zM9 9h1v4h-1zM9 14h1v4h-1zM11 8h1v4h-1zM11 13h1v4h-1zM13 9h1v4h-1zM13 14h1v4h-1z -->
		{:else if name === 'snowflake'}
			<path
				stroke-width="8"
				stroke="#93C5FD"
				fill="none"
				opacity="0.5"
				d="m12 20v-16m-7 4 14 8m0-8-14 8m5-11 2 2 2-2m3 2-.8 2.6 2.8.4m0 4-2.8.4.8 2.6m-3 2-2-2-2 2m-3-2 .8-2.6-2.8-.4m0-4 2.8-.4-.8-2.6" />
			<path
				stroke-width="1"
				stroke="#93C5FD"
				fill="none"
				opacity="0.5"
				d="m12 20v-16m-7 4 14 8m0-8-14 8m5-11 2 2 2-2m3 2-.8 2.6 2.8.4m0 4-2.8.4.8 2.6m-3 2-2-2-2 2m-3-2 .8-2.6-2.8-.4m0-4 2.8-.4-.8-2.6" />
		{:else if name === 'cloud_bolt'}
			<path
				fill="#93C5FD"
				opacity="0.5"
				d="M15 14a4 4 0 100-10 4 4 0 10-9 2 4 4 0 00-4 4 4 4 0 004 4z" />
			<path fill="#EAB308" opacity="0.75" d="M13 9l-6 6h3l-2 5 6-6h-3z" />
		{/if}
	</svg>
</div>
