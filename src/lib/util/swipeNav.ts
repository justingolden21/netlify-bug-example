/**
 * Enables a swipe gesture from the left edge of the screen to toggle the nav open.
 *
 * @param openNav - A function that opens the nav menu
 */
function enableSwipeToToggleNav(openNav: () => void) {
	let startX = 0; // Initial horizontal touch position
	let isSwiping = false; // Whether the user is currently performing a valid swipe

	/**
	 * Called when a touch begins.
	 * Starts tracking only if the touch began within the left 30px of the screen.
	 */
	const onTouchStart = (e: TouchEvent) => {
		startX = e.touches[0].clientX;
		isSwiping = startX < 30;
	};

	/**
	 * Called as the user moves their finger.
	 * If a swipe is in progress and has moved right more than 80px, open the nav.
	 */
	const onTouchMove = (e: TouchEvent) => {
		if (!isSwiping) return;
		const deltaX = e.touches[0].clientX - startX;
		if (deltaX > 80) {
			openNav();
			isSwiping = false; // Prevent further triggers until next swipe
		}
	};

	/**
	 * Called when the touch ends.
	 * Resets the swipe tracking state.
	 */
	const onTouchEnd = () => {
		isSwiping = false;
	};

	// Register touch event listeners on the window
	window.addEventListener('touchstart', onTouchStart);
	window.addEventListener('touchmove', onTouchMove);
	window.addEventListener('touchend', onTouchEnd);

	// Cleanup function to remove event listeners when no longer needed.
	return () => {
		window.removeEventListener('touchstart', onTouchStart);
		window.removeEventListener('touchmove', onTouchMove);
		window.removeEventListener('touchend', onTouchEnd);
	};
}

export { enableSwipeToToggleNav };
