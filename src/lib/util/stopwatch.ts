// Utility functions for core stopwatch logic
// The stopwatch uses timestamps (milliseconds since epoch) generated from `Date.now()`
// to record start, stop, and laps

// ==== Basics ====

interface ITimeObject {
	hours: number;
	minutes: number;
	seconds: number;
	milliseconds: number;
}

interface IDisplaySettings {
	digitsAfterSeconds?: number;
	alwaysShowHours?: boolean;
	alwaysShowMinutes?: boolean;
}

// Given an array of timestamps (of play/pause clicks)
// return the net milliseconds elapsed while running
const getNetMs = (times: number[]) => {
	let ms = 0;
	for (let i = 0; i < times.length; i += 2) {
		if (i === times.length - 1) {
			ms += Date.now() - times[i];
		} else {
			ms += times[i + 1] - times[i];
		}
	}
	return ms;
};

// Convert milliseconds to a time object
// Used for displaying times to the page
const msToTimeObj = (ms: number): ITimeObject => ({
	hours: Math.floor(ms / 1000 / 60 / 60),
	minutes: Math.floor(ms / 1000 / 60) % 60,
	seconds: Math.floor(ms / 1000) % 60,
	milliseconds: ms % 1000
});

// Returns the correct number of digits after the second
const sliceMilliseconds = (ms: number, digits: number) => {
	const str = `.${ms.toString().padStart(3, '0')}`;
	const digitsToCut = 3 - digits;
	return str.substring(0, str.length - digitsToCut);
};

// Given a time object and settings
// Return that time converted to a string with the given display settings
const timeObjToStr = (
	{ hours, minutes, seconds, milliseconds }: ITimeObject,
	{ digitsAfterSeconds, alwaysShowHours, alwaysShowMinutes }: IDisplaySettings
) =>
	(hours === 0 && !alwaysShowHours ? '' : hours.toString().padStart(2, '0') + ':') +
	(minutes === 0 && !alwaysShowMinutes ? '' : minutes.toString().padStart(2, '0') + ':') +
	seconds.toString().padStart(2, '0') +
	(!digitsAfterSeconds ? '' : sliceMilliseconds(milliseconds, digitsAfterSeconds));

const msToStr = (ms: number, displaySettings: IDisplaySettings) =>
	timeObjToStr(msToTimeObj(ms), displaySettings);

// TODO: test and implement `squashTimes` in stopwatch and pomodoro

// Get timestamp from param milliseconds ago, or get how many milliseconds since param timestamp
// const msAgo = (ms: number) => Date.now() - ms;

// Given a list of times, condense them to just one or two times
// const squashTimes = (times: number[]) => {
// 	const netMs = getNetMs(times);
// 	if (times.length % 2 == 0) {
// 		// paused
// 		return [msAgo(netMs), Date.now()];
// 	} else {
// 		// running
// 		return [msAgo(netMs)];
// 	}
// };

// ==== Laps ====

// Given a list of timestamps when the user clicked play/pause and clicked lap
// Returns an array of objects containing lap data
// Each object contains current and total time
const getLapTimes = (times: number[], laps: number[]) => {
	const allTimes = [];
	for (const time of times) {
		allTimes.push({
			time,
			isLap: false
		});
	}
	for (const lap of laps) {
		allTimes.push({
			time: lap,
			isLap: true
		});
	}

	// sort by timestamp
	allTimes.sort((a, b) => a.time - b.time);

	// ================

	const lapTimes = [] as { current: number; total: number }[];

	// when starting/resuming, note the time
	// when pausing, add the difference between the previously noted time and current time to the lap and total times
	// when hitting lap, add the lap and total times, then reset the lap time
	let timeIntoCurrentLap = 0; // ms
	let previousTime = 0; // timestamp ms
	let totalTime = 0; // ms
	let isRunning = false;

	// all laps other than current lap
	for (const currentTime of allTimes) {
		if (!currentTime.isLap) {
			isRunning = !isRunning;
			if (isRunning) {
				// START / RESUME
				previousTime = currentTime.time;
			} else {
				// PAUSE
				timeIntoCurrentLap += currentTime.time - previousTime;
				totalTime += currentTime.time - previousTime;
			}
		} else {
			// LAP
			timeIntoCurrentLap += currentTime.time - previousTime;
			totalTime += currentTime.time - previousTime;
			lapTimes.push({
				current: timeIntoCurrentLap,
				total: totalTime
			});
			previousTime = currentTime.time;
			timeIntoCurrentLap = 0;
		}
	}

	// current lap
	if (isRunning) {
		timeIntoCurrentLap += Date.now() - allTimes[allTimes.length - 1].time;
		totalTime += Date.now() - allTimes[allTimes.length - 1].time;
		lapTimes.push({
			current: timeIntoCurrentLap,
			total: totalTime
		});
	} else {
		lapTimes.push({
			current: timeIntoCurrentLap,
			total: totalTime
		});
	}

	return lapTimes;
};

export { getLapTimes, getNetMs, msToStr };
