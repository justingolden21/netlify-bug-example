<script lang="ts">
	/**
	 * Background for chessclock that appears as if a chessclock switch is being pushed down
	 */

	import { settings } from '$lib/stores/settings';
</script>

<div class="switch-container">
	<div class="switch-container-inner">
		<div
			class="left-switch"
			class:pressed={$settings.chessclock.timer.currentTurn !== 0 &&
				!$settings.chessclock.timer.paused}>
		</div>
		<div
			class="right-switch"
			class:pressed={$settings.chessclock.timer.currentTurn !== 1 &&
				!$settings.chessclock.timer.paused}>
		</div>
	</div>
</div>

<style lang="postcss">
	.switch-container {
		@apply relative mx-auto hidden -translate-x-48 -translate-y-1 lg:block;
	}
	.switch-container-inner {
		position: absolute;
		clip: rect(-4rem, 24rem, 0.75rem, 0px);
	}
	.left-switch,
	.right-switch {
		@apply absolute hidden h-16 w-96 bg-base-600 transition-transform duration-125 lg:block;
	}
	.left-switch {
		transform: rotate(12deg) translate(1.5rem, -1.5rem);
	}
	.right-switch {
		transform: rotate(-12deg) translate(-1.5rem, -1.5rem);
	}
	.left-switch.pressed {
		transform: rotate(8deg) translate(1.5rem, -1rem);
	}
	.right-switch.pressed {
		transform: rotate(-8deg) translate(-1.5rem, -1rem);
	}
</style>
