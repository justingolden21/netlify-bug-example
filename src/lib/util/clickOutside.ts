// Dispatch a custom event when the user clicks outside of the element
// https://svelte.dev/repl/0ace7a508bd843b798ae599940a91783?version=3.16.7

type Callback = (event: MouseEvent) => void;
const clickOutside = (node: Node, callback: Callback) => {
	const handleClick = (event: MouseEvent) => {
		if (node && !node.contains(event.target as Node) && !event.defaultPrevented) {
			/* dispatch event on click outside of node */
			callback(event);
		}
	};

	document.addEventListener('click', handleClick, true);

	return {
		destroy() {
			document.removeEventListener('click', handleClick, true);
		}
	};
};

export default clickOutside;
