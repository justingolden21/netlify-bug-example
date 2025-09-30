<script lang="ts">
	/**
	 * Modal with an interactable 3d rubiks cube
	 *
	 * The cube can be rotated with buttons or keyboard shortcuts and reset
	 */

	import RubiksCube3DModel, {
		type Move
	} from '$lib/components/pages/rubiks/RubiksCube3DModel.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { dictionary } from '$lib/stores/languageDictionary';

	const cubeMoves = ['R', 'L', 'U', 'D', 'F', 'B'] as Move[];
	const inverseCubeMoves = ["R'", "L'", "U'", "D'", "F'", "B'"] as Move[];

	let component = $state() as RubiksCube3DModel;

	/**
	 * Returns true if the currently focused element is focusable.
	 * Handles native inputs, custom tabIndex, and contentEditable elements.
	 *
	 * TODO: use this in chessclock?
	 */
	function isActiveElementFocusable(): boolean {
		const el = document.activeElement as HTMLElement | null;
		if (!el) return false;

		// Check if it's disabled
		if ((el as HTMLInputElement | HTMLButtonElement).disabled) return false;

		// Native focusable elements
		const focusableTags = ['A', 'BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'];
		if (focusableTags.includes(el.tagName)) {
			// For anchor tags, make sure it has href
			if (el.tagName === 'A') {
				return (el as HTMLAnchorElement).href !== '';
			}
			return true;
		}

		// Custom focusable elements via tabIndex
		if (el.tabIndex >= 0) return true;

		// Content-editable support
		if (el.isContentEditable) return true;

		return false;
	}

	// Keyboard shortcuts
	// Similar to `Chessclock.svelte`
	// TODO: move all keyboard shortcuts on per page basis to its own system
	// TODO: keyboard shortcuts such as N for night mode don't work (but esc closes modal)
	function onWindowKeyDown(e: KeyboardEvent) {
		// If something is focused, then return
		if (isActiveElementFocusable()) return;

		// Don't do anything if user is using a browser shortcut
		if (e.ctrlKey || e.metaKey) return;

		if (e.key === 'r' || e.key === 'R') {
			if (e.shiftKey) component.input_move("R'");
			else component.input_move('R');
		} else if (e.key === 'l' || e.key === 'L') {
			if (e.shiftKey) component.input_move("L'");
			else component.input_move('L');
		} else if (e.key === 'u' || e.key === 'U') {
			if (e.shiftKey) component.input_move("U'");
			else component.input_move('U');
		} else if (e.key === 'd' || e.key === 'D') {
			if (e.shiftKey) component.input_move("D'");
			else component.input_move('D');
		} else if (e.key === 'f' || e.key === 'F') {
			if (e.shiftKey) component.input_move("F'");
			else component.input_move('F');
		} else if (e.key === 'b' || e.key === 'B') {
			if (e.shiftKey) component.input_move("B'");
			else component.input_move('B');
		}
	}
</script>

<svelte:window onkeydown={onWindowKeyDown} />

<div class="pad text-center max-w-xl mx-auto">
	<RubiksCube3DModel bind:this={component} />

	<p class="p-lg mt-10">
		{$dictionary.rubiksSettings.keyboardShortcutInfo}
	</p>

	<div class="mt-10 mb-6 inline-grid grid-cols-6 gap-1">
		{#each [...cubeMoves, ...inverseCubeMoves] as cubeMove}
			<Button className="w-10 sm:w-16" onclick={() => component.input_move(cubeMove)}>
				{cubeMove}
			</Button>
		{/each}
	</div>

	<Button
		icon="undo"
		animation="move-left"
		className="block mx-auto"
		size="lg"
		onclick={() => component.reset_cube()}>
		{$dictionary.labels['Reset']}
	</Button>
</div>
