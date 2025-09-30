<!--
	A 3d background of a monocolor rotating rubiks cube

	@link https://stackoverflow.com/a/17871637/4907950
 -->

<div class="cube">
	<div id="face1"></div>
	<div id="face2"></div>
	<div id="face3"></div>
	<div id="face4"></div>
	<div id="face5"></div>
	<div id="face6"></div>
</div>

<style lang="postcss">
	.cube div {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-0.1 -0.1 3.2 3.2'%3E%3Cpath d='m0 0v3h3v-3zm1 0v3m1-3v3m1-3v3m-3-2h3m-3 1h3' stroke='%2300000006' stroke-width='.1' fill='none'/%3E%3C/svg%3E");
		position: absolute;
		width: 40vmin;
		height: 40vmin;
	}
	:global(.dark) .cube div {
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='-0.1 -0.1 3.2 3.2'%3E%3Cpath d='m0 0v3h3v-3zm1 0v3m1-3v3m1-3v3m-3-2h3m-3 1h3' stroke='%23ffffff06' stroke-width='.1' fill='none'/%3E%3C/svg%3E");
	}

	.cube #face1 {
		-webkit-transform: translateZ(20vmin);
		-ms-transform: translateZ(20vmin);
		transform: translateZ(20vmin);
	}
	.cube #face2 {
		-webkit-transform: rotateY(90deg) translateZ(20vmin);
		-ms-transform: rotateY(90deg) translateZ(20vmin);
		transform: rotateY(90deg) translateZ(20vmin);
	}
	.cube #face3 {
		-webkit-transform: rotateY(90deg) rotateX(90deg) translateZ(20vmin);
		-ms-transform: rotateY(90deg) rotateX(90deg) translateZ(20vmin);
		transform: rotateY(90deg) rotateX(90deg) translateZ(20vmin);
	}
	.cube #face4 {
		-webkit-transform: rotateY(180deg) rotateZ(90deg) translateZ(20vmin);
		-ms-transform: rotateY(180deg) rotateZ(90deg) translateZ(20vmin);
		transform: rotateY(180deg) rotateZ(90deg) translateZ(20vmin);
	}
	.cube #face5 {
		-webkit-transform: rotateY(-90deg) rotateZ(90deg) translateZ(20vmin);
		-ms-transform: rotateY(-90deg) rotateZ(90deg) translateZ(20vmin);
		transform: rotateY(-90deg) rotateZ(90deg) translateZ(20vmin);
	}
	.cube #face6 {
		-webkit-transform: rotateX(-90deg) translateZ(20vmin);
		-ms-transform: rotateX(-90deg) translateZ(20vmin);
		transform: rotateX(-90deg) translateZ(20vmin);
	}

	.cube {
		width: 40vmin;
		height: 40vmin;
		-webkit-animation: spincube 4s linear infinite;
		animation: spincube 4s linear infinite;
		-webkit-transform-style: preserve-3d;
		-ms-transform-style: preserve-3d;
		transform-style: preserve-3d;
		-webkit-transform-origin: 20vmin 20vmin 0;
		-ms-transform-origin: 20vmin 20vmin 0;
		transform-origin: 20vmin 20vmin 0;
	}

	@keyframes spincube {
		0% {
			transform: rotateY(0deg) rotateX(0deg);
		}
		50% {
			transform: rotateY(90deg) rotateX(90deg);
		}
	}

	@-webkit-keyframes spincube {
		0% {
			-webkit-transform: rotateY(0deg) rotateX(0deg);
		}
		50% {
			-webkit-transform: rotateY(90deg) rotateX(90deg);
		}
	}
</style>
