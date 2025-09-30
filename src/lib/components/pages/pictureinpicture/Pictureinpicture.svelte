<script lang="ts">
	/**
	 * Picture-in-Picture clock and timer that allows the user to
	 * open the clock/timer in a pop-out window as if it's a video (chromium support only now)
	 *
	 * TODO features
	 * Features TODO
	 * support time/date formats
	 * support timer/stopwatch
	 * support worldclock
	 * show battery level option
	 * color options (font options?)
	 * support sunrise sunset
	 * controls for stopwatch etc: https://stackoverflow.com/a/74241072/4907950
	 *
	 * @link https://developer.chrome.com/blog/watch-video-using-picture-in-picture/
	 * @link https://caniuse.com/picture-in-picture
	 * @link https://caniuse.com/mdn-api_htmlcanvaselement_capturestream
	 */

	import { onMount } from 'svelte';

	import VectorArt from '$lib/components/features/misc/VectorArt.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Tabs, { type Tab } from '$lib/components/ui/Tabs.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';
	import { settings } from '$lib/stores/settings';
	import formatTimer from '$lib/util/formatTimer';
	import getFormat from '$lib/util/getFormat';
	import { now } from '$lib/util/now.svelte';
	import { getDateTime } from '$lib/util/timeText';
	import validateInt from '$lib/util/validateInt';
	import getTranslatedTimefield from '$lib/util/getTranslatedTimefield';

	const time = $derived(getDateTime(now.value, getFormat('clock', 'time') ?? 'h:mm A'));
	const date = $derived(getDateTime(now.value, getFormat('clock', 'date') ?? 'ddd, MMMM D'));
	const locale = $derived($settings.locale.language ?? 'en');

	let videoElm = $state() as HTMLVideoElement;
	let canvasElm = $state() as HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null;
	let error = $state(false);
	let inPip = $state(false);

	async function togglePip() {
		try {
			if (videoElm !== document.pictureInPictureElement) {
				await videoElm.requestPictureInPicture();
			} else {
				await document.exitPictureInPicture();
			}
		} catch {
			error = true;
		}
	}

	onMount(() => {
		if (!('pictureInPictureEnabled' in document) || !document.pictureInPictureEnabled) {
			error = true;
		} else {
			videoElm.addEventListener('enterpictureinpicture', () => (inPip = true));
			videoElm.addEventListener('leavepictureinpicture', () => (inPip = false));

			setupCanvasVideo();

			updateCanvasTime();
			const itvl = setInterval(updateCanvasTime, 1000);
			return () => {
				clearInterval(itvl);
				clearInterval(timerInterval);
			};
		}
	});

	function setupCanvasVideo() {
		ctx = canvasElm.getContext('2d');

		videoElm.srcObject = canvasElm.captureStream();
		videoElm.play();
	}

	function updateCanvasTime() {
		if (!canvasElm || !ctx) {
			error = true;
			return;
		} else {
			error = false;
		}

		ctx.strokeStyle = 'white';
		const base900 = `rgb(${getComputedStyle(document.querySelector('main')!)
			.getPropertyValue('--base-900')
			.trim()})`;
		ctx.fillStyle = base900;

		const fontSize = 200;
		ctx.font = fontSize + 'px monospace';
		ctx.fillRect(0, 0, canvasElm.width, canvasElm.height);
		ctx.textAlign = 'center';
		ctx.fillStyle = 'white';
		if ($settings.pictureinpicture.activeTab === 'datetime') {
			ctx.fillText(time, canvasElm.width / 2, canvasElm.height / 2 + fontSize / 2);
			ctx.font = fontSize / 4 + 'px monospace';
			ctx.fillText(date, canvasElm.width / 2, canvasElm.height - fontSize / 4 - 20);
		} else if ($settings.pictureinpicture.activeTab === 'timer') {
			ctx.fillText(formattedTimer, canvasElm.width / 2, canvasElm.height / 2 + fontSize / 2);
		}
	}

	// Settings and Timer
	let timerInterval: NodeJS.Timeout;
	let formattedTimer = formatTimer(0);

	function startTimer() {
		$settings.pictureinpicture.timer.startTimestamp = Date.now();

		function updateTimer() {
			const timerSecondsDur =
				$settings.pictureinpicture.timer.hours * 60 * 60 +
				$settings.pictureinpicture.timer.minutes * 60;

			const secondsRemaining =
				timerSecondsDur -
				Math.round((Date.now() - $settings.pictureinpicture.timer.startTimestamp) / 1000);

			formattedTimer = formatTimer(secondsRemaining);

			if (secondsRemaining <= 0) clearInterval(timerInterval);
		}

		updateTimer();
		timerInterval = setInterval(updateTimer, 1000);

		updateCanvasTime();
	}

	function resetTimer() {
		clearInterval(timerInterval);
		$settings.pictureinpicture.timer.startTimestamp = -1;
		formattedTimer = formatTimer(0);
		updateCanvasTime();
	}

	const tabs = ['datetime', 'timer'] as ('datetime' | 'timer')[];

	const tabData = $derived(
		tabs.map((option) => {
			return {
				name: $dictionary.clockSettings.clockFormats[option],
				onclick: () => {
					$settings.pictureinpicture.activeTab = option;
					updateCanvasTime();
				}
			};
		}) as Tab[]
	);
</script>

{#if error}
	<p class="p">{$dictionary.pictureinpictureSettings['pipError']}</p>
	<div class="select-none w-80 xl:w-96 mx-auto mt-10">
		<VectorArt name="firefox_support" />
	</div>
{:else}
	<Tabs tabs={tabData} activeTab={tabs.indexOf($settings.pictureinpicture.activeTab)} />
	<canvas class="hidden" width="960" height="540" bind:this={canvasElm}></canvas>
	<Button
		icon={inPip ? 'output' : 'input'}
		animation="move-right"
		className="flex mx-auto my-4"
		onclick={togglePip}>
		{$dictionary.pictureinpictureSettings[
			inPip ? 'Leave picture-in-picture' : 'Enter picture-in-picture'
		]}
	</Button>
	<video class="mx-auto" bind:this={videoElm} muted></video>

	{#if $settings.pictureinpicture.activeTab === 'timer'}
		{#if $settings.pictureinpicture.timer.startTimestamp === -1}
			<div class="mt-4 flex flex-wrap gap-4">
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
				<div>
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
				<Button
					animation="zoom"
					icon="play"
					onclick={startTimer}
					disabled={$settings.pictureinpicture.timer.minutes === 0 &&
						$settings.pictureinpicture.timer.hours === 0}>
					{$dictionary.stopwatchSettings['Start']}
				</Button>
			</div>
		{:else}
			<Button animation="move-left" icon="undo" className="mt-4" onclick={resetTimer}>
				{$dictionary.labels['Reset']}
			</Button>
		{/if}
	{/if}
{/if}

<hr class="my-10 mx-auto" />

<p class="p-sm mt-4">
	{$dictionary.pictureinpictureSettings['pipNotice']}
</p>
