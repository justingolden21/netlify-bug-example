<script lang="ts">
	import { onDestroy, onMount } from 'svelte';

	let canvas = $state() as HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D | null = null;
	let confettiPieces: ConfettiPiece[] = [];
	let animation: number;

	class ConfettiPiece {
		x: number;
		y: number;
		size: number;
		speedX: number;
		speedY: number;
		color: string;

		constructor() {
			this.x = Math.random() * canvas.width;
			this.y = Math.random() * canvas.height - canvas.height;
			this.size = Math.random() * 10 + 5;
			this.speedX = Math.random() * 2 - 1;
			this.speedY = Math.random() * 3 + 2;
			this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
		}

		update() {
			this.x += this.speedX;
			this.y += this.speedY;

			// Reset position when out of view
			if (this.y > canvas.height) {
				this.y = -this.size;
				this.x = Math.random() * canvas.width;
			}
		}

		draw() {
			if (ctx) {
				ctx.fillStyle = this.color;
				ctx.fillRect(this.x, this.y, this.size, this.size);
			}
		}
	}

	function initConfetti() {
		confettiPieces = [];
		for (let i = 0; i < 100; i++) {
			confettiPieces.push(new ConfettiPiece());
		}
	}

	function animateConfetti() {
		if (ctx) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			confettiPieces.forEach((piece) => {
				piece.update();
				piece.draw();
			});

			animation = requestAnimationFrame(animateConfetti);
		}
	}

	function resizeCanvas() {
		if (canvas) {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
			initConfetti();
		}
	}

	onMount(() => {
		if (canvas) {
			resizeCanvas();
			ctx = canvas.getContext('2d');
			animateConfetti();

			window.addEventListener('resize', resizeCanvas);
		}
	});

	onDestroy(() => {
		window.removeEventListener('resize', resizeCanvas);
		cancelAnimationFrame(animation);
	});
</script>

<canvas bind:this={canvas} class="w-full absolute top-0 left-0 -z-10 opacity-50"></canvas>
