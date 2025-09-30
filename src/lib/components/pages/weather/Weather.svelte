<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

	import NoLocation from '$lib/components/features/misc/NoLocation.svelte';
	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import WeatherVectorBackground from '$lib/components/pages/weather/WeatherVectorBackground.svelte';
	import WeatherMovingBackground, {
		type WeatherBackground
	} from '$lib/components/pages/weather/WeatherMovingBackground.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import LoaderSimple from '$lib/components/ui/LoaderSimple.svelte';
	import Time from '$lib/components/features/misc/Time.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import getFormat from '$lib/util/getFormat';
	import { open } from '$lib/util/modal.svelte';
	import nearestCity from '$lib/util/nearestCity';
	import { getDateTime } from '$lib/util/timeText';

	/**
	 * Future todo ideas:
	 *
	 * read forecast out loud
	 * click day cards to scroll in hours view
	 * customize what items are shown (ie. wind in current view, low in daily view, UV in hourly, etc)
	 * use air quality API https://open-meteo.com/en/docs/air-quality-api
	 *
	 * consider using geocoding api for getting nearest city and searching cities, would take internet of course:
	 * https://open-meteo.com/en/docs/geocoding-api
	 */

	type APIResponse = {
		current: {
			time: number;

			temperature_2m: number;
			relative_humidity_2m: number;
			wind_speed_10m: number;
			weather_code: WeatherCode;
		};
		hourly: {
			time: number[];

			weathercode: WeatherCode[];
			temperature_2m: number[];
			apparent_temperature: number[];
			windspeed_10m: number[];
			precipitation: number[];
			uv_index: number[];
			relative_humidity_2m: number[];
		};
		daily: {
			time: number[];

			weathercode: WeatherCode[];
			temperature_2m_max: number[];
			temperature_2m_min: number[];
			apparent_temperature_max: number[];
			apparent_temperature_min: number[];
			precipitation_sum: number[];
		};
	};

	type Daily = {
		timestamp: number;
		weatherCode: WeatherCode;
		minTemp: number;
		maxTemp: number;
	};

	type Hourly = {
		timestamp: number;
		weatherCode: WeatherCode;
		temp: number;
		feelsLike: number;
		windSpeed: number;
		precip: number;
		uvIndex: number;
		humidity: number;
	};

	type Current = {
		weatherCode: WeatherCode;
		humidity: number;
		temp: number;
		high: number;
		highFeelsLike: number;
		wind: number;
		low: number;
		lowFeelsLike: number;
		precip: number;
		uvIndex: number;
	};

	type WeatherData = { current: Current; hourly: Hourly[]; daily: Daily[] };

	const currentDefault = {
		weatherCode: 0 as WeatherCode, // change to simulate other default weather
		humidity: 0,
		temp: 0,
		high: 0,
		highFeelsLike: 0,
		wind: 0,
		low: 0,
		lowFeelsLike: 0,
		precip: 0,
		uvIndex: 0
	} as Current;

	// Variables used to render weather data

	let current = $state({ ...currentDefault });
	let daily = $state([] as Daily[]);
	let hourly = $state([] as Hourly[]);

	type LoadState = 'default' | 'loading' | 'loaded' | 'error' | 'location error';
	let loadState: LoadState = $state('default');
	let lastUpdated = $state(0);

	const locationChosen = $derived(
		$settings.weather.location.lat !== 0 || $settings.weather.location.long !== 0
	);

	// Cache nearest city lookup so template doesn't recompute every render
	const locationName = $derived(
		nearestCity($settings.weather.location.lat, $settings.weather.location.long)
	);

	// Icons

	const ICON_MAP = new Map<WeatherCode, WeatherIcon>();

	addMapping([0, 1], 'sun');
	addMapping([2], 'cloud_sun');
	addMapping([3], 'cloud');
	addMapping([45, 48], 'cloud_smog');
	addMapping([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82], 'cloud_rain');
	addMapping([71, 73, 75, 77, 85, 86], 'snowflake');
	addMapping([95, 96, 99], 'cloud_bolt');

	const movingBackgroundMap: { [key in WeatherIcon]: WeatherBackground } = {
		sun: 'sun',
		cloud_sun: 'cloud',
		cloud: 'cloud',
		cloud_smog: 'cloud',
		cloud_rain: 'rain',
		cloud_bolt: 'rain',
		snowflake: 'snow'
	};

	// prettier-ignore
	type WeatherIcon = 'sun' | 'cloud_sun' | 'cloud' | 'cloud_smog' | 'cloud_rain' | 'snowflake' | 'cloud_bolt';
	// prettier-ignore
	type WeatherCode = 0 | 1 | 2 | 3 | 45 | 48 | 51 | 53 | 55 | 56 | 57 | 61 | 63 | 65 | 66 | 67 | 71 | 73 | 75 | 77 | 80 | 81 | 82 | 85 | 86 | 95 | 96 | 99;

	function addMapping(values: WeatherCode[], icon: WeatherIcon) {
		values.forEach((value) => ICON_MAP.set(value, icon));
	}

	// Get weather description translated string given weather code number
	// Pass in dictionary so it reacts to user changing their language
	// Weather codes documentation: https://open-meteo.com/en/docs#:~:text=Weather%20variable%20documentation
	function getWeatherDescription(weatherCode: WeatherCode, dictionary: Record<string, any>) {
		return dictionary.weatherSettings.conditions[
			{
				0: 'Clear',
				1: 'Mainly clear',
				2: 'Partly cloudy',
				3: 'Overcast',
				45: 'Fog',
				48: 'Rime Fog',
				51: 'Light drizzle',
				53: 'Moderate drizzle',
				55: 'Dense drizzle',
				56: 'Light freezing drizzle',
				57: 'Dense freezing drizzle',
				61: 'Slight rain',
				63: 'Moderate rain',
				65: 'Heavy rain',
				66: 'Light freezing rain',
				67: 'Heavy freezing rain',
				71: 'Light snow',
				73: 'Moderate snow',
				75: 'Heavy snow',
				77: 'Snow grains',
				80: 'Slight rain showers',
				81: 'Moderate rain showers',
				82: 'Violent rain showers',
				85: 'Slight snow showers',
				86: 'Heavy snow showers',
				95: 'Thunderstorm',
				96: 'Thunderstorm with slight hail',
				99: 'Thunderstorm with heavy hail'
			}[weatherCode]
		];
	}

	// Change to true to avoid extra API calls when developing (do not commit changes)
	const DEV_MODE_AVOID_FETCH_API = import.meta.env.DEV && false;

	/**
	 * Limit to 100 API calls in last 24 hours
	 *
	 * Add current timestamp to `APITimestamps` and remove old timestamps
	 * @return true if less than 100 API calls within the last 24 hours, else false
	 *
	 * Max 10k API calls per day, 5k per hour, 600 per min - https://open-meteo.com/en/terms
	 */
	function canCallAPI() {
		const currentTime = Date.now();
		// Remove timestamps older than 24 hours
		$settings.weather.APITimestamps = $settings.weather.APITimestamps.filter(
			(timestamp) => currentTime - timestamp < 24 * 60 * 60 * 1000
		);
		// Add current timestamp
		$settings.weather.APITimestamps.push(currentTime);

		// True if less than 100 calls within the last 24 hours
		return $settings.weather.APITimestamps.length < 100;
	}

	// Get fetch weather data from API and send it to be parsed
	function fetchWeather(): Promise<WeatherData | null> {
		loadState = 'loading';
		lastUpdated = Date.now();

		// Fetch every `minsBetweenFetch` mins. We do it this way so if the user fetches then it resets the interval
		fetchWeatherTimeout = setTimeout(getWeather, minsBetweenFetch * 60 * 1000);

		const long = $settings.weather.location.long;
		const lat = $settings.weather.location.lat;
		const isMetric = $settings.locale.metric;
		const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

		// Dev mode for testing to avoid unnecessary API calls
		if (DEV_MODE_AVOID_FETCH_API) {
			return new Promise((resolve) => resolve(null));
		}

		// Avoid calling API if user calls it too frequently
		if (!canCallAPI()) {
			console.error('Called API too many times');
			return new Promise((resolve) => resolve(null));
		}

		// Docs: https://open-meteo.com/en/docs
		return fetch(
			`https://api.open-meteo.com/v1/forecast?current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,rain,weather_code,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,uv_index,apparent_temperature,precipitation,weathercode,windspeed_10m&daily=weathercode,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum&temperature_unit=${
				isMetric ? 'celsius' : 'fahrenheit'
			}&windspeed_unit=${isMetric ? 'kmh' : 'mph'}&precipitation_unit=${
				isMetric ? 'mm' : 'inch'
			}&timeformat=unixtime&latitude=${lat}&longitude=${long}&timezone=${timezone}`
		)
			.then((response) => {
				if (!response.ok) {
					console.error('Network response was not ok');
				}
				return response.json();
			})
			.then((data) => {
				return {
					current: parseCurrentWeather(data),
					daily: parseDailyWeather(data),
					hourly: parseHourlyWeather(data)
				};
			})
			.catch((error) => {
				console.error('Error:', error);
				return null;
			});
	}

	// Normalize API data for us to consume

	function parseCurrentWeather({ current, daily, hourly }: APIResponse): Current {
		const {
			temperature_2m: temp,
			relative_humidity_2m: humidity,
			wind_speed_10m: windSpeed,
			weather_code: weatherCode
		} = current;
		const {
			temperature_2m_max: [maxTemp],
			temperature_2m_min: [minTemp],
			apparent_temperature_max: [maxFeelsLike],
			apparent_temperature_min: [minFeelsLike],
			precipitation_sum: [precip]
		} = daily;
		const {
			uv_index: [uvIndex]
		} = hourly;

		return {
			temp: Math.round(temp),
			high: Math.round(maxTemp),
			low: Math.round(minTemp),
			highFeelsLike: Math.round(maxFeelsLike),
			lowFeelsLike: Math.round(minFeelsLike),
			wind: Math.round(windSpeed),
			precip: Math.round(precip * 100) / 100,
			humidity,
			uvIndex: Math.round(uvIndex * 10) / 10,
			weatherCode
		};
	}

	function parseDailyWeather({ daily }: APIResponse): Daily[] {
		return daily.time.map((time, index) => {
			return {
				timestamp: time * 1000,
				weatherCode: daily.weathercode[index],
				minTemp: Math.round(daily.temperature_2m_min[index]),
				maxTemp: Math.round(daily.temperature_2m_max[index])
			};
		});
	}

	function parseHourlyWeather({ hourly, current }: APIResponse): Hourly[] {
		return hourly.time
			.map((time, index) => {
				return {
					timestamp: time * 1000,
					weatherCode: hourly.weathercode[index],
					temp: Math.round(hourly.temperature_2m[index]),
					feelsLike: Math.round(hourly.apparent_temperature[index]),
					windSpeed: Math.round(hourly.windspeed_10m[index]),
					precip: Math.round(hourly.precipitation[index] * 100) / 100,
					uvIndex: Math.round(hourly.uv_index[index] * 10) / 10,
					humidity: hourly.relative_humidity_2m[index]
				};
			})
			.filter(({ timestamp }: Hourly) => timestamp >= current.time * 1000);
	}

	// Get position, send it to `fetchWeather`, then set local variables which render weather data

	function getWeather() {
		// Similar logic to `Sunrise.svelte`
		if (!locationChosen) {
			if (!navigator.geolocation) {
				$settings.weather.location = {
					lat: 0,
					long: 0,
					name: ''
				};
				loadState = 'location error';
			} else {
				navigator.geolocation.getCurrentPosition(
					({ coords }) => {
						$settings.weather.location = {
							lat: coords.latitude,
							long: coords.longitude,
							name: ''
						};
						fetchRenderWeather();
					},
					() => {
						$settings.weather.location = {
							lat: 0,
							long: 0,
							name: ''
						};
						loadState = 'location error';
					}
				);
			}
		} else {
			fetchRenderWeather();
		}
	}

	// Call fetchWeather then render to front end
	function fetchRenderWeather() {
		fetchWeather()
			.then((data) => {
				if (data !== null) {
					current = data.current;
					hourly = data.hourly;
					daily = data.daily;

					loadState = 'loaded';
				} else {
					loadState = 'error';
				}
			})
			.catch((e) => {
				loadState = 'error';
				console.error(e);
			});
	}

	// Using timeout each time instead of interval so we avoid fetching if we fetched recently for another reason (such as unit change)
	let fetchWeatherTimeout: NodeJS.Timeout;
	const minsBetweenFetch = 60;

	onMount(() => {
		getWeather();
		return () => clearTimeout(fetchWeatherTimeout);
	});

	// Formatters that use locale.datetime setting
	const DAY_FORMATTER = $derived(
		new Intl.DateTimeFormat($settings.locale.datetime ?? undefined, {
			weekday: 'short'
		})
	);
	const HOUR_FORMATTER = $derived(
		new Intl.DateTimeFormat($settings.locale.datetime ?? undefined, {
			hour: 'numeric'
		})
	);

	const round = (num: number) => Math.round(num * 100) / 100;

	// Fetch weather when units or location change

	// Store previous setting
	let prevLocaleMetric = $state($settings.locale.metric);

	// Refetch weather data when user changes unit
	// Avoid fetching data when user resets settings, hence check for null
	// Check against `prevLocaleMetric` to avoid running every time any `$settings` change
	// Check for `browser` to only run after page load
	$effect(() => {
		if (
			$settings.locale.metric !== null &&
			prevLocaleMetric !== $settings.locale.metric &&
			browser
		) {
			// Get weather again with new units
			getWeather();
			prevLocaleMetric = $settings.locale.metric;
		}
	});

	// Similar to above, get weather again when location changes, if a location is selected
	let prevLatLong = $state(`${$settings.weather.location.lat}+${$settings.weather.location.long}`);
	$effect(() => {
		if (
			locationChosen &&
			prevLatLong !== `${$settings.weather.location.lat}+${$settings.weather.location.long}` &&
			browser
		) {
			getWeather();
			prevLatLong = `${$settings.weather.location.lat}+${$settings.weather.location.long}`;
		}
	});

	// Retry getting weather now that location is chosen if it failed last time
	$effect(() => {
		if (loadState === 'location error' && locationChosen && browser) {
			getWeather();
		}
	});

	function toggleUnit() {
		$settings.locale.metric = !$settings.locale.metric;
	}

	// Uncomment with each loop below to test different weathers
	// let weatherIconOverride: WeatherIcon | null = $state(null);
	let currentWeatherIcon = $derived(
		// weatherIconOverride ??
		ICON_MAP.get(current.weatherCode) ?? 'sun'
	);
</script>

<!-- Uncomment with weatherIconOverride above to test different weathers -->
<!-- {#each ['sun', 'cloud_sun', 'cloud', 'cloud_smog', 'cloud_rain', 'snowflake', 'cloud_bolt'] as const as name}
	<button onclick={() => (weatherIconOverride = name)} class="icon-btn">
		<Icon size="lg" {name} />
		{name}
	</button>
{/each} -->

<section class="select-none">
	{#if loadState === 'loading' && !DEV_MODE_AVOID_FETCH_API}
		<div class="flex items-center justify-center my-10">
			<LoaderSimple />
		</div>
	{:else if loadState === 'location error' && !DEV_MODE_AVOID_FETCH_API}
		<Button
			icon="pencil"
			className="w-full mb-4"
			title={$dictionary.sunriseSunsetSettings['Edit location']}
			onclick={() => open('sunrise-edit-location', { page: 'weather' })}>
			{$dictionary.sunriseSunsetSettings['Edit location']}
		</Button>
		<div class="relative">
			<NoLocation />
		</div>
	{:else if loadState === 'error' && !DEV_MODE_AVOID_FETCH_API}
		<div class="select-none w-96 mx-auto mb-10">
			<VectorArt name="weather_window" />
		</div>
		<p class="p-lg text-center">{$dictionary.weatherSettings['Error getting weather']}</p>
	{:else}
		<div class="relative">
			<WeatherMovingBackground backgroundType={movingBackgroundMap[currentWeatherIcon]} />

			<WeatherVectorBackground name={currentWeatherIcon} />

			<!-- Mobile empty tall div for weather background -->
			<div class="h-32 sm:hidden"></div>

			<p class="weather-label mb-1">{$dictionary.weatherSettings['Current']}</p>
			<section
				class="surface pad mb-10 lg:mb-16
				
				{$settings.weather.displays.primary === 'full'
					? 'grid sm:grid-cols-2 divide-y-2 sm:divide-y-0 sm:divide-x-2 divide-base-300 dark:divide-base-600'
					: ''}
				">
				{#if loadState !== 'default'}
					<div class="pb-6 sm:pb-0 sm:pr-6 lg:pr-10">
						<div class="flex flex-wrap items-end justify-center gap-4 lg:gap-10 relative">
							<div class="text-base-600 dark:text-base-300">
								<Icon size="lg" name={currentWeatherIcon} />
							</div>
							<p class="h1 text-6xl sm:text-4xl lg:text-6xl flex gap-2">
								{current.temp}<Button
									size="icon"
									variant="ghost"
									className="font-normal h3"
									onclick={toggleUnit}>
									&deg;{$settings.locale.metric ? 'C' : 'F'}
								</Button>
							</p>
							<p class="h3 mt-2">
								{getWeatherDescription(current.weatherCode, $dictionary)}
							</p>
						</div>
						<Time classes="block mt-4 h3 lg:h2 text-center text-base-600 dark:text-base-300" />
						<p class="weather-label flex flex-wrap justify-between gap-4 mt-4">
							<span>
								{$dictionary.weatherSettings['Last updated:']}
								{getDateTime(new Date(lastUpdated), getFormat('clock', 'time'))}
							</span>
							<span>
								{round($settings.weather.location.lat)}&deg;, {round(
									$settings.weather.location.long
								)}&deg;
								<br />
								{locationName}
								<Button
									size="icon"
									icon="pencil"
									iconSize="sm"
									variant="ghost"
									title={$dictionary.sunriseSunsetSettings['Edit location']}
									onclick={() => open('sunrise-edit-location', { page: 'weather' })}>
								</Button>
							</span>
						</p>
					</div>
				{/if}
				{#if $settings.weather.displays.primary === 'full'}
					<div
						in:fly={{ y: -160, duration: 250 }}
						out:fly={{ y: 160, duration: 250 }}
						class="pt-6 sm:pt-0 sm:pl-6 lg:pl-10 text-center sm:text-left grid gap-2 grid-cols-2 2xl:grid-cols-4">
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['High']}</p>
							<p class="p text-2xl">{current.high}&deg;</p>
						</div>
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['Feels Like High']}</p>
							<p class="p text-2xl">{current.highFeelsLike}&deg;</p>
						</div>
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['Wind']}</p>
							<p class="p text-2xl">
								{current.wind}
								<span class="text-xs">{$settings.locale.metric ? 'km/h' : 'mph'}</span>
							</p>
						</div>
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['Low']}</p>
							<p class="p text-2xl">{current.low}&deg;</p>
						</div>
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['Feels Like Low']}</p>
							<p class="p text-2xl">{current.lowFeelsLike}&deg;</p>
						</div>
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['Rain']}</p>
							<p class="p text-2xl">
								{current.precip}
								<span class="text-xs">{$settings.locale.metric ? 'mm' : 'in'}</span>
							</p>
						</div>
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['Humidity']}</p>
							<p class="p text-2xl">
								{current.humidity} <span class="text-xs">%</span>
							</p>
						</div>
						<div>
							<p class="weather-label">{$dictionary.weatherSettings['UV']}</p>
							<p class="p text-2xl">
								{current.uvIndex} <span class="text-xs"></span>
							</p>
						</div>
					</div>
				{/if}
			</section>

			{#if $settings.weather.displays.secondary === 'daily_hourly' || $settings.weather.displays.secondary === 'daily'}
				<div
					in:fly={{ y: -160, duration: 250, delay: 250 }}
					out:fly={{ duration: 250 }}
					class="mb-10 lg:mb-16">
					<p class="weather-label mb-1">{$dictionary.clockSettings.clockFormats['daily']}</p>
					<section class="flex overflow-x-auto md:flex-wrap md:justify-center pb-2 gap-4 relative">
						{#each daily as day}
							<div class="surface p-2 w-[8rem] xl:p-4 flex flex-col gap-2">
								<div class="flex gap-4 justify-between items-end">
									<p class="weather-label mt-2">{DAY_FORMATTER.format(day.timestamp)}</p>
									<div class="text-base-600 dark:text-base-300">
										<Icon size="lg" name={ICON_MAP.get(day.weatherCode) ?? 'sun'} />
									</div>
								</div>
								<p class="p text-2xl">{day.maxTemp}&deg; / {day.minTemp}&deg;</p>
								<p
									class="h3 text-xs text-center border-t border-base-300 dark:border-base-600 pt-2">
									{getWeatherDescription(day.weatherCode, $dictionary)}
								</p>
							</div>
						{/each}
					</section>
				</div>
			{/if}

			{#if $settings.weather.displays.secondary === 'daily_hourly' || $settings.weather.displays.secondary === 'hourly'}
				<div
					in:fly={{ y: -160, duration: 250, delay: 250 }}
					out:fly={{ duration: 250 }}
					class="overflow-x-auto">
					<p class="weather-label mb-1">{$dictionary.clockSettings.clockFormats['hourly']}</p>
					<table class="surface p">
						<tbody>
							<tr class="sticky top-0 bg-base-200 dark:bg-base-900">
								{#each ['', '', 'Feels Like', 'Wind', 'Rain', 'UV', 'Humidity'] as label}
									<td class="weather-label py-2">
										{#if label !== ''}
											{$dictionary.weatherSettings[label]}
										{/if}
									</td>
								{/each}
							</tr>
							{#each hourly as hour, i}
								{#if i < 24 * $settings.weather.hourlyDaysShown}
									<tr>
										<td>
											<div class="flex flex-col xl:flex-row xl:gap-2 xl:items-center min-w-16">
												<p class="p text-sm leading-tight">
													{DAY_FORMATTER.format(hour.timestamp)}
												</p>
												<p class="p text-lg leading-tight">
													{HOUR_FORMATTER.format(hour.timestamp)}
												</p>
											</div>
										</td>
										<td class="flex gap-4 pt-4">
											<div class="text-base-600 dark:text-base-300">
												<Icon name={ICON_MAP.get(hour.weatherCode) ?? 'sun'} />
											</div>
											<p class="p text-2xl leading-none">{hour.temp}&deg;</p>
										</td>
										<td>
											<div class="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
												<p class="p text-2xl">{hour.feelsLike}&deg;</p>
											</div>
										</td>
										<td>
											<div class="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
												<p class="p text-2xl">
													{hour.windSpeed}
													<span class="text-xs">
														{$settings.locale.metric ? 'km/h' : 'mph'}
													</span>
												</p>
											</div>
										</td>
										<td>
											<div class="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
												<p class="p text-2xl">
													{hour.precip}
													<span class="text-xs">
														{$settings.locale.metric ? 'mm' : 'in'}
													</span>
												</p>
											</div>
										</td>
										<td>
											<div class="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
												<p class="p text-2xl">
													{hour.uvIndex}
												</p>
											</div>
										</td>
										<td>
											<div class="flex flex-col xl:flex-row xl:gap-2 xl:items-center">
												<p class="p text-2xl">
													{hour.humidity}
												</p>
											</div>
										</td>
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	{/if}
</section>

<style lang="postcss">
	.weather-label {
		@apply text-xs font-bold text-base-700;
	}
	:global(.dark) .weather-label {
		@apply text-base-300;
	}
	table td {
		@apply px-4 lg:px-6;
	}
</style>
