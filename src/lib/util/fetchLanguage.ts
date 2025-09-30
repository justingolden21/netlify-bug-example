const fetchLanguage = (language: string, isAbout = false) =>
	fetch(`/lang/${isAbout ? 'about/' : ''}${language}.json`).then((res) => res.json());

export default fetchLanguage;
