let audio: HTMLAudioElement;

// TODO: typescript `soundName`
const playSound = (soundName: string, loops: number = 1, volume: number = 0.5) => {
	if (audio) audio.pause();

	audio = new Audio(`audio/${soundName}.mp3`);
	audio.volume = volume;
	audio.play();

	let playCount = 1;
	audio.onended = () => {
		if (playCount < loops) {
			playCount++;
			audio.play();
		}
	};
};

export default playSound;
