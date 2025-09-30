<script module lang="ts">
	/**
	 * Customizable SVG background pattern for the whole app
	 *
	 * Works with dark/light mode, user's base palette
	 * Supports different vector designs, opacity levels, and zoom levels
	 * Controlled by `SettingsPanelAppearance.svelte`
	 */

	export type Pattern = keyof typeof PATTERNS;

	/**
	 * Pattens from @link https://heropatterns.com/
	 * View and edit svg @link https://yqnn.github.io/svg-path-editor/
	 * URL decode and encode svg: @link https://yoksel.github.io/url-encoder/
	 * Convert svg circle to path: @link https://justingolden.me/svg-circle-to-path/
	 * To add a pattern, first decode url, then get in the following format and url encode:
	 * `width='1234' viewBox='0 0 1234 1234''%3E%3Cpath d='M1 2 3 4 5 6z`
	 */
	export const PATTERNS = {
		none: 'none',
		architect:
			"width='100' viewBox='0 0 100 199'%3E%3Cpath d='M0 199V0H1V2L100 199H98.9L1 4.2V199ZM100 2 99 0H100Z",
		triangles: "width='36' viewBox='0 0 36 72'%3E%3Cpath d='M2 6h12L8 18 2 6zm18 36h12l-6 12-6-12z",
		temple:
			"width='152' viewBox='0 0 76 76'%3E%3Cpath fill-rule='evenodd' d='M76 75v1H0v-1h14v-4H4v-10H0v-1h4V40h21v10h10v21H15v4h45v-4H40v-21h10V40h21v20h4V15h-4v20h-21V25H40V4h20V0h1v4h10v10h4V0h1v75zm-1 0v-14h-4v10h-10v4h14zM41 15v9h9V15H41zm10 9h10v10h9V15h-10V5H41v9h10v10zm0 1v9h9V25h-9zm10-11h9V5h-9v9zm-27 46v-9H25v9h9zm-10-9H14V41H5v19h10v10h19v-9H24v-10zm0-1V41H15v9h9zm-10 11H5v9h9v-9zm27 0v9h19v-10h10V41h-9v10h-10v10H41zm9-10H41v9h9v-9zm1-1h9V41h-9v9zm10 20v-9h9v9h-9zM15 0h-1v4H4v10H0v1h4v20h21V25h10V4H15V0zm10 24h9V15H25v9zm9-10H24v10H14v10H5V15h10V5h19v9zM15 25h9v9H15V25zm-1-20H5v9h9V5z",
		checkers: "width='16' viewBox='0 0 2 2'%3E%3Cpath d='M0 0H1V1H0V0ZM1 1H2V2H1V1Z",
		bubbles:
			"width='100' viewBox='0 0 100 100'%3E%3Cpath d='m11 18c4 0 7-3 7-7s-3-7-7-7-7 3-7 7 3 7 7 7zm48 25c4 0 7-3 7-7s-3-7-7-7-7 3-7 7 3 7 7 7zm-47 43c2 0 4-2 4-4s-2-4-4-4-4 2-4 4 2 4 4 4zm28-65c2 0 4-2 4-4s-2-4-4-4-4 2-4 4 2 4 4 4zm23-11c3 0 5-2 5-5s-2-5-5-5-5 2-5 5 2 5 5 5zm-6 60c2 0 4-2 4-4s-2-4-4-4-4 2-4 4 2 4 4 4zm29 22c3 0 5-2 5-5s-2-5-5-5-5 2-5 5 2 5 5 5zm-54-29c3 0 5-2 5-5s-2-5-5-5-5 2-5 5 2 5 5 5zm57-13c3 0 5-2 5-5s-2-5-5-5-5 2-5 5 2 5 5 5z",
		diagonal_stripes: "width='40' viewBox='0 0 2 2'%3E%3Cpath d='M0 2 2 0H1L0 1M2 2V1L1 2",
		flipped_diamonds: "width='32' viewBox='0 0 8 10'%3E%3Cpath d='M4 0V10L0 5M8 0V5L4 0M8 5v5H4",
		squares_in_squares:
			"width='40' viewBox='0 0 14 14'%3E%3Cpath fill-rule='evenodd' d='M0 0h7v7H0zm1 1h5v5H1zm1 1h3v3H2zm1 1h1v1h-1zM8 1h5v5H8zm1 1h3v3H9zm1 1h1v1h-1zM14 7H7v7h7zm-1 1H8v5h5zm-1 1H9v3h3zm-1 1h-1v1h1zM6 8H1v5h5zm-1 1H2v3h3zm-1 1h-1v1h1z",
		zig_zag:
			"width='40' viewBox='0 0 20 6'%3E%3Cpath d='m0 3 3-3h3l-6 6zm20 3-6-6h3l3 3zM3 6l6-6h2l6 6h-3l-4-4-4 4zm6 0 1-1 1 1z",
		aztec:
			"width='32' viewBox='0 0 8 16'%3E%3Cpath d='M0 7h5V4h-1v2H1V1h7v7h-1V2H2v3h1v-2h3v5H0zm3 2h5v1H4v6H0v-1h3zm4 3h-1v3h2v1H5V11h3v3h-1zM0 9h2v5H0v-1h1V10H0z' fill-rule='evenodd",
		// boxes: "width='20' viewBox='0 0 1 1'%3E%3Cpath d='m0 0h1L0 1z",
		circles_and_squares:
			"width='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h20v20H0V0zm10 17a7 7 0 100-14 7 7 0 000 14zm20 0a7 7 0 100-14 7 7 0 000 14zM10 37a7 7 0 100-14 7 7 0 000 14zm10-17h20v20H20V20zm10 17a7 7 0 100-14 7 7 0 000 14z' fill-rule='evenodd",
		// circuit_board:
		// "width='304' viewBox='0 0 304 304'%3E%3Cpath d='M44.1 224a5 5 0 110 2H0v-2h44.1zm160 48a5 5 0 110 2H82v-2h122.1zm57.8-46a5 5 0 110-2H304v2h-42.1zm0 16a5 5 0 110-2H304v2h-42.1zm6.2-114a5 5 0 110 2h-86.2a5 5 0 110-2h86.2zm-256-48a5 5 0 110 2H0v-2h12.1zm185.8 34a5 5 0 110-2h86.2a5 5 0 110 2h-86.2zM258 12.1a5 5 0 11-2 0V0h2v12.1zm-64 208a5 5 0 11-2 0v-54.2a5 5 0 112 0v54.2zm48-198.2V80h62v2h-64V21.9a5 5 0 112 0zm16 16V64h46v2h-48V37.9a5 5 0 112 0zm-128 96V208h16v12.1a5 5 0 11-2 0V210h-16v-76.1a5 5 0 112 0zm-5.9-21.9a5 5 0 110 2H114v48H85.9a5 5 0 110-2H112v-48h12.1zm-6.2 130a5 5 0 110-2H176v-74.1a5 5 0 112 0V242h-60.1zm-16-64a5 5 0 110-2H114v48h10.1a5 5 0 110 2H112v-48h-10.1zM66 284.1a5 5 0 11-2 0V274H50v30h-2v-32h18v12.1zM236.1 176a5 5 0 110 2H226v94h48v32h-2v-30h-48v-98h12.1zm25.8-30a5 5 0 110-2H274v44.1a5 5 0 11-2 0V146h-10.1zm-64 96a5 5 0 110-2H208v-80h16v-14h-42.1a5 5 0 110-2H226v18h-16v80h-12.1zm86.2-210a5 5 0 110 2H272V0h2v32h10.1zM98 101.9V146H53.9a5 5 0 110-2H96v-42.1a5 5 0 112 0zM53.9 34a5 5 0 110-2H80V0h2v34H53.9zm60.1 3.9V66H82v64H69.9a5 5 0 110-2H80V64h32V37.9a5 5 0 112 0zM101.9 82a5 5 0 110-2H128V37.9a5 5 0 112 0V82h-28.1zm16-64a5 5 0 110-2H146v44.1a5 5 0 11-2 0V18h-26.1zm102.2 270a5 5 0 110 2H98v14h-2v-16h124.1zM242 149.9V160h16v34h-16v62h48v48h-2v-46h-48v-66h16v-30h-16v-12.1a5 5 0 112 0zM53.9 18a5 5 0 110-2H64V2H48V0h18v18H53.9zm112 32a5 5 0 110-2H192V0h50v2h-48v48h-28.1zm-48-48a5 5 0 01-9.8-2h2.1a3 3 0 105.7 0H178v34h-18V21.9a5 5 0 112 0V32h14V2h-58.1zm0 96a5 5 0 110-2H137l32-32h39V21.9a5 5 0 112 0V66h-40.2l-32 32H117.9zm28.1 90.1a5 5 0 11-2 0v-76.5L175.6 80H224V21.9a5 5 0 112 0V82h-49.6L146 112.4v75.7zm16 32a5 5 0 11-2 0v-99.5L184.6 96H300.1a5 5 0 013.9-3.9v2.1a3 3 0 000 5.7v2.1a5 5 0 01-3.9-3.9H185.4L162 121.4v98.7zm-144-64a5 5 0 11-2 0v-3.5l48-48V48h32V0h2v50H66v55.4l-48 48v2.7zM50 53.9v43.5l-48 48V208h26.1a5 5 0 110 2H0v-65.4l48-48V53.9a5 5 0 112 0zm-16 16V89.4l-34 34v-2.8l32-32V69.9a5 5 0 112 0zM12.1 32a5 5 0 110 2H9.4L0 43.4V40.6L8.6 32h3.5zm265.8 18a5 5 0 110-2h18.7l7.4-7.4v2.8L297.4 50H277.9zm-16 160a5 5 0 110-2H288v-71.4l16-16v2.8l-14 14V210h-28.1zm-208 32a5 5 0 110-2H64v-22.6L40.6 194H21.9a5 5 0 110-2H41.4L66 216.6V242H53.9zm150.2 14a5 5 0 110 2H96v-56.6L56.6 162H37.9a5 5 0 110-2h19.5L98 200.6V256h106.1zm-150.2 2a5 5 0 110-2H80v-46.6L48.6 178H21.9a5 5 0 110-2H49.4L82 208.6V258H53.9zM34 39.8v1.6L9.4 66H0v-2h8.6L32 40.6V0h2v39.8zM2 300.1a5 5 0 013.9 3.9H3.8A3 3 0 000 302.2V256h18v48h-2v-46H2v42.1zM34 241v63h-2v-62H0v-2h34v1zM17 18H0v-2h16V0h2v18h-1zm273-2h14v2h-16V0h2v16zm-32 273v15h-2v-14h-14v14h-2v-16h18v1zM0 92.1A5 5 0 016 97a5 5 0 01-6 4.9v-2.1a3 3 0 100-5.7V92.1zM80 272h2v32h-2v-32zm37.9 32h-2.1a3 3 0 00-5.7 0h-2.1a5 5 0 019.8 0zM5.9 0A5 5 0 010 5.9V3.8A3 3 0 003.8 0H5.9zm294.2 0h2.1A3 3 0 00304 3.8V5.9a5 5 0 01-3.9-5.9zm3.9 300.1v2.1a3 3 0 00-1.8 1.8h-2.1a5 5 0 013.9-3.9zM97 100a3 3 0 100-6 3 3 0 000 6zm0-16a3 3 0 100-6 3 3 0 000 6zm16 16a3 3 0 100-6 3 3 0 000 6zm16 16a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6zm-48 32a3 3 0 100-6 3 3 0 000 6zm16 16a3 3 0 100-6 3 3 0 000 6zm32 48a3 3 0 100-6 3 3 0 000 6zm-16 16a3 3 0 100-6 3 3 0 000 6zm32-16a3 3 0 100-6 3 3 0 000 6zm0-32a3 3 0 100-6 3 3 0 000 6zm16 32a3 3 0 100-6 3 3 0 000 6zm32 16a3 3 0 100-6 3 3 0 000 6zm0-16a3 3 0 100-6 3 3 0 000 6zm-16-64a3 3 0 100-6 3 3 0 000 6zm16 0a3 3 0 100-6 3 3 0 000 6zm16 96a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6zm16 16a3 3 0 100-6 3 3 0 000 6zm16-144a3 3 0 100-6 3 3 0 000 6zm0 32a3 3 0 100-6 3 3 0 000 6zm16-32a3 3 0 100-6 3 3 0 000 6zm16-16a3 3 0 100-6 3 3 0 000 6zm-96 0a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6zm16-32a3 3 0 100-6 3 3 0 000 6zm96 0a3 3 0 100-6 3 3 0 000 6zm-16-64a3 3 0 100-6 3 3 0 000 6zm16-16a3 3 0 100-6 3 3 0 000 6zm-32 0a3 3 0 100-6 3 3 0 000 6zm0-16a3 3 0 100-6 3 3 0 000 6zm-16 0a3 3 0 100-6 3 3 0 000 6zm-16 0a3 3 0 100-6 3 3 0 000 6zm-16 0a3 3 0 100-6 3 3 0 000 6zM49 36a3 3 0 100-6 3 3 0 000 6zm-32 0a3 3 0 100-6 3 3 0 000 6zm32 16a3 3 0 100-6 3 3 0 000 6zM33 68a3 3 0 100-6 3 3 0 000 6zm16-48a3 3 0 100-6 3 3 0 000 6zm0 240a3 3 0 100-6 3 3 0 000 6zm16 32a3 3 0 100-6 3 3 0 000 6zm-16-64a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6zm-16-32a3 3 0 100-6 3 3 0 000 6zm80-176a3 3 0 100-6 3 3 0 000 6zm16 0a3 3 0 100-6 3 3 0 000 6zm-16-16a3 3 0 100-6 3 3 0 000 6zm32 48a3 3 0 100-6 3 3 0 000 6zm16-16a3 3 0 100-6 3 3 0 000 6zm0-32a3 3 0 100-6 3 3 0 000 6zm112 176a3 3 0 100-6 3 3 0 000 6zm-16 16a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6zM17 180a3 3 0 100-6 3 3 0 000 6zm0 16a3 3 0 100-6 3 3 0 000 6zm0-32a3 3 0 100-6 3 3 0 000 6zm16 0a3 3 0 100-6 3 3 0 000 6zM17 84a3 3 0 100-6 3 3 0 000 6zm32 64a3 3 0 100-6 3 3 0 000 6zm16-16a3 3 0 100-6 3 3 0 000 6z",
		diagonal_lines: "width='16' viewBox='0 0 6 6'%3E%3Cpath d='M5 0H6L0 6V5ZM6 5V6H5Z",
		intersecting_circles:
			"width='20' viewBox='0 0 30 30'%3E%3Cpath d='M15 0C7 0 0 7 0 15 8 15 15 8 15 0M0 15c0 8 7 15 15 15 0-8-7-15-15-15m30 0c0-8-7-15-15-15 0 8 7 15 15 15m0 0c0 8-7 15-15 15 0-8 7-15 15-15",
		overlapping_diamonds:
			"width='48' viewBox='0 0 24 32'%3E%3Cpath d='M24 14v-2L18 6 12 12 6 6 0 12v2l2 2-2 2v2l6 6 6-6 6 6 6-6v-2l-2-2 2-2zM4 16l-3-3 5-5 5 5-3 3 3 3-5 5L1 19l3-3zm6 0 2-2 2 2-2 2-2-2zm6 0-3-3 5-5 5 5-3 3 3 3-5 5-5-5 3-3zM0 8 5 3 2 0h2l2 2 2-2h2l-3 3 5 5L17 3l-3-3h2l2 2 2-2h2l-3 3 5 5v2L18 4 12 10 6 4 0 10v-2zm0 16 5 5-3 3h2l2-2 2 2h2l-3-3 5-5 5 5-3 3h2l2-2 2 2h2l-3-3 5-5v-2L18 28 12 22 6 28 0 22v2z",
		parkay_floor:
			"width='40' viewBox='0 0 20 20'%3E%3Cpath d='M10 11V9H0v-1h10v-1H0v-1h10v-1H0V4h10V3H0V2h10V1H0V0h11v10h1V0h1v10h1V0h1v10h1V0h1v10h1V0h1v10h1v1zM0 10h1v10H0zm2 0h1v10H2zm2 0h1v10H4zm2 0h1v10h-1zm2 0h1v10h-1zm2 2h10v1H10zm0 2h10v1H10zm0 2h10v1H10zm0 2h10v1H10z",
		polka_dots:
			"width='20' viewBox='0 0 20 20'%3E%3Cpath d='m6 3a3 3 0 10-6 0 3 3 0 106 0m10 10a3 3 0 10-6 0 3 3 0 106 0",
		signal:
			"width='84' viewBox='0 0 42 24'%3E%3Cpath d='M0 0h6v3H0zm14 4h6v3H14zm7-4h6v3H21zm7 0h6v3H28zm0 4h6v3H28zM21 4h6v3H21zm0 8h6v3H21zm7-4h6v3H28zm7 0h6v3H35zm0-8h6v3H35zM14 16h6v3H14zM7 8h6v3H7zM0 12h6v3H0zm0 4h6v3H0zm7 0h6v3H7zm7 4h6v3H14zm-7 0h6v3H7zm14 0h6v3H21zm7-4h6v3H28zm0-4h6v3H28zm7 4h6v3H35zm0 4h6v3H35zM7 12h6v3H7zm7-4h6v3H14zM7 4h6v3H7zM0 4h6v3H0z",
		graph_paper: "width='20' viewBox='0 0 10 10'%3E%3Cpath d='m0 0h10v1h-9v9h-1z",
		hideout:
			"width='40' viewBox='0 0 40 40'%3E%3Cpath d='m0 39 3-3 1 1-3 3h-1zm0-38 3 3 1-1-3-3h-1zm39 39-3-3 1-1 3 3v1zm1-39-3 3-1-1 3-3h1zm-20 18 3-3 1 1-3 3 3 3-1 1-3-3-3 3-1-1 3-3-3-3 1-1z",
		piano:
			"width='70' viewBox='0 0 35 22'%3E%3Cpath d='M35 22H0V21H4V14H3V0H6V14H5V21H9V14H8V0H11V14H10V21H14V14H13V0H16V14H15V21H19V0H20V21H24V14H23V0H26V14H25V21H29V14H28V0H31V14H30V21H34V0H35Z",
		hexagons:
			"width='28' viewBox='0 0 28 49'%3E%3Cpath d='M14 9.25l13 7.5v15l-13 7.5L1 31.75v-15zM3 17.9v12.7l11 6.35 11-6.35V17.9l-11-6.35zM0 15l13-7.5V0h-2v6.35L0 12.69zm0 18.5L13 41v8h-2v-6.85L0 35.81zM15 0v7.5L28 15H28v-2.31L17 6.35V0zm0 49v-8l13-7.5H28v2.31L17 42.15V49z",
		four_point_stars:
			"width='20' viewBox='0 0 12 12'%3E%3Cpath d='m4 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z",
		bamboo:
			"width='32' viewBox='0 0 8 16'%3E%3Cpath d='M0 12h2v1H0zm0 2h3v1H0zm0-4h1v1H0zM0 0h2v1H0zm0 2h1v1H0zm8 10h-3v1h3zm0 2H4v1h4zm0-4h-2v1h2zm0-10h-3v1h3zm0 2h-2v1h2zm-1 6h1v1h-1zm0-4h1v1h-1zM1 4h5v1H1zm0 4h5v1H1zm-1-2h7v1H0zm2-4h3v1H2zm0 8h3v1H2zM3 0h1v1H3zm0 12h1v1H3z",
		bricks:
			"width='42' viewBox='0 0 42 44'%3E%3Cpath fill-rule='evenodd' d='M0 0H42V44H0ZM1 1H41V21H1ZM0 23H20V43H0Zm22 0H42V43H22Z",
		overlapping_circles:
			"width='80' viewBox='0 0 160 160'%3E%3Cpath d='m100 100c0-11 9-20 20-20s20 9 20 20-9 20-20 20c0 11-9 20-20 20s-20-9-20-20 9-20 20-20M20 20c0-11 9-20 20-20s20 9 20 20-9 20-20 20c0 11-9 20-20 20S0 51 0 40s9-20 20-20m20 16c8.8 0 16-7.2 16-16s-7.2-16-16-16-16 7.2-16 16 7.2 16 16 16m80 80c8.8 0 16-7.2 16-16s-7.2-16-16-16-16 7.2-16 16 7.2 16 16 16",
		plus: "width='50' viewBox='0 0 25 25'%3E%3Cpath d='M11 10v-2h-1v2h-2v1h2v2h1v-2h2v-1h-2z",
		rounded_plus:
			"width='80' viewBox='0 0 84 84'%3E%3Cpath fill-rule='evenodd' d='m84 23c-4 0-8-4-8-8v-7h-7c-4 0-8-4-8-8h-38c0 4-4 8-8 8h-7v7c0 4-4 8-8 8v38c4 0 8 4 8 8v7h7c4 0 8 4 8 8h38c0-4 4-8 8-8h7v-7c0-4 4-8 8-8zm-25 60h-16v-16c5 0 9-5 9-10v-5h5c5 0 10-4 10-9h16v16c-5 0-9 5-9 10v5h-5c-5 0-10 4-10 9m-34 0h16v-16c-5 0-9-5-9-10v-5h-5c-5 0-10-4-10-9h-16v16c5 0 9 5 9 10v5h5c5 0 10 4 10 9m0-82h16v16c-5 0-9 5-9 10v5h-5c-5 0-10 4-10 9h-16v-16c5 0 9-5 9-10v-5h5c5 0 10-4 10-9m34 0h-16v16c5 0 9 5 9 10v5h5c5 0 10 4 10 9h16v-16c-5 0-9-5-9-10v-5h-5c-5 0-10-4-10-9m-9 49v7c0 4-4 8-8 8-4 0-8-4-8-8v-7h-7c-4 0-8-4-8-8 0-4 4-8 8-8h7v-7c0-4 4-8 8-8 4 0 8 4 8 8v7h7c4 0 8 4 8 8 0 4-4 8-8 8z",
		endless_clouds:
			"width='56' viewBox='0 0 56 28'%3E%3Cpath d='m56 26v2h-7.7c2.2-1.3 4.9-2 7.7-2m-26 2a2 2 0 10-4 0h-4.1a26 26 0 00-21.9-12v-2c.7 0 1.3 0 2 .1a2 2 0 00-2-2.1v-2a4 4 0 014 3.6 28.1 28.1 0 012.8-3.9 8 8 0 00-6.8-3.7v-2a10 10 0 018.2 4.2c.9-.9 1.9-1.8 3-2.6a14 14 0 00-11.2-5.6h7.8c2 1.1 3.7 2.6 5 4.5 1.2-.8 2.3-1.4 3.6-2a20.1 20.1 0 00-2.1-2.5h2.7c.4.6.9 1.1 1.3 1.7 1.3-.4 2.6-.8 4-1.1-.1-.2-.3-.4-.4-.6h12.2l-.4.6c1.4.3 2.7.7 4 1.1.4-.6.9-1.1 1.3-1.7h2.7a20.1 20.1 0 00-2.1 2.5c1.2.6 2.4 1.2 3.6 2a16.1 16.1 0 015.1-4.5h7.7c-4.6 0-8.6 2.2-11.2 5.6 1.1.8 2.1 1.7 3 2.6a10 10 0 018.2-4.2v2a8 8 0 00-6.8 3.7c1.1 1.2 2 2.5 2.8 3.9a4 4 0 014-3.6v2a2 2 0 00-2 2.1 28.4 28.4 0 012-.1v2c-9.2 0-17.3 4.8-21.9 12zm-22.2 0h-7.8v-2c2.8 0 5.5.7 7.8 2m48.2-8v2c-5.6 0-10.6 2.3-14.3 6h-2.7c4.1-4.9 10.2-8 17-8m-39 8h-2.7c-3.6-3.7-8.7-6-14.3-6v-2c6.8 0 12.9 3.1 17 8m15-.4a28.1 28.1 0 012.8-3.9 8 8 0 00-13.6 0c1.1 1.2 2 2.5 2.8 3.9a4 4 0 017.98 0m14.32-11.9c1.3-.4 2.6-.8 4-1.1a26 26 0 00-44.6 0c1.4.3 2.7.7 4 1.1a22 22 0 0136.6 0m-5.5 2.8c1.2-.8 2.3-1.4 3.6-2a20 20 0 00-32.8 0c1.2.6 2.4 1.2 3.6 2a16 16 0 0125.6 0m-4.6 3.7c.9-.9 1.9-1.8 3-2.6a14 14 0 00-22.4 0c1.1.8 2.1 1.7 3 2.6a10 10 0 0116.4 0",
		curtain:
			"width='44' viewBox='0 0 22 6'%3E%3Cpath d='M10 6v-1L0 0v5l2 1zm9 0 2-1V0L11 5v1zM10 0v4L2 0zm9 0-8 4V0z"
		// fancy_rectangles:
		// 	"width='120' viewBox='0 0 60 48'%3E%3Cpath d='M6 12h6v12H6V12zm12 0h6v12h-6V12zm6-12h6v12h-6V0zM12 0h6v12h-6V0zm0 24h6v12h-6V24zM0 0h6v12H0V0zm6 36h6v12H6V36zm12 0h6v12h-6V36zm12-12h6v12h-6V24zM42 0h6v12h-6V0zm-6 12h6v12h-6V12zm12 0h6v12h-6V12zM36 36h6v12h-6V36zm12 0h6v12h-6V36zm-6-12h6v12h-6V24zm12 0h6v12h-6V24z",
		// jupiter:
		// 	"width='52' viewBox='0 0 52 52'%3E%3Cpath d='M0 17.8V0h17.8a3 3 0 01-5.7 2H5.9A5 5 0 012 5.9v6.3a3 3 0 01-2 5.7zm0 18.3a3 3 0 012 5.7v6.3A5 5 0 015.9 52h6.3a3 3 0 015.7 0H0V36.2zM36.2 52a3 3 0 015.7 0h6.3a5 5 0 013.9-3.9v-6.3a3 3 0 010-5.7V52H36.2zM0 31.9v-9.8a5 5 0 013.8.7l4.4-4.4a3 3 0 111.4 1.4L5.2 24.3a5 5 0 010 5.5l4.4 4.4a3 3 0 11-1.4 1.4L3.8 31.2a5 5 0 01-3.8.7zm52-14.1a3 3 0 010-5.7V5.9A5 5 0 0148.1 2h-6.3a3 3 0 01-5.7-2H52v17.8zm0 14.1a5 5 0 01-1.7-.7l-4.4 4.4a3 3 0 11-1.4-1.4l4.4-4.4a5 5 0 010-5.5l-4.4-4.4a3 3 0 111.4-1.4l4.4 4.4c.5-.3 1.1-.6 1.7-.7v9.8zM22.1 0h9.8a5 5 0 01-.7 3.8l4.4 4.4a3 3 0 11-1.4 1.4L29.8 5.2a5 5 0 01-5.5 0l-4.4 4.4a3 3 0 11-1.4-1.4l4.4-4.4a5 5 0 01-.7-3.8zm0 52c.1-.6.4-1.2.7-1.7l-4.4-4.4a3 3 0 111.4-1.4l4.4 4.4a5 5 0 015.5 0l4.4-4.4a3 3 0 111.4 1.4l-4.4 4.4c.4.5.6 1.1.7 1.7h-9.8zm9.8-24a5 5 0 01-3.9 3.9v6.3a3 3 0 11-2 0V31.9a5 5 0 01-3.9-3.9h-6.3a3 3 0 110-2h6.3a5 5 0 013.9-3.9v-6.3a3 3 0 112 0v6.3a5 5 0 013.9 3.9h6.3a3 3 0 110 2H31.9z"
	};
</script>

<script lang="ts">
	import { browser } from '$app/environment';
	import TailwindColors from 'tailwindcss/colors.js';
	import { settings } from '$lib/stores/settings';

	/**
	 * Set a repeating background pattern to a url encoded SVG
	 *
	 * Color is based off of user's base palette and dark mode
	 * Opacity and zoom are based off of user's settings
	 * The background color behind the pattern is set to match the base palette
	 */
	function setPattern(
		name: Pattern,
		opacity: 0.05 | 0.1 | 0.15 | 0.2,
		zoom: 1 | 1.5 | 2 | 2.5,
		darkMode: boolean | null
	) {
		if (!browser) return;

		const el = document.querySelector('main');
		if (!el) return;

		const str =
			"fill='" +
			TailwindColors[$settings.baseColorPalette][darkMode ? 200 : 800].replace('#', '%23') +
			"' fill-opacity='" +
			opacity +
			"' " +
			PATTERNS[name].replace(
				/width='(\d+)'/g,
				(_, old_width) => `width='${parseInt(old_width) * zoom}'`
			);

		el.style.backgroundColor = TailwindColors[$settings.baseColorPalette][darkMode ? 900 : 50];
		el.style.backgroundImage =
			name == 'none'
				? ''
				: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' ${str}'/%3E%3C/svg%3E")`;
	}

	$effect(() => {
		setPattern(
			$settings.pattern.name,
			$settings.pattern.opacity,
			$settings.pattern.zoom,
			$settings.darkMode
		);
	});
</script>
