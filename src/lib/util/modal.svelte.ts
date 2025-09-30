/**
 * Provides utility functions for managing modals
 * Handles the `modal` store, which maintains the state of all open modals
 *
 * Functions include:
 * - `close()`: Closes the most recently opened modal.
 * - `closeByName(name: string)`: Closes the modal with the specified name.
 * - `open(name: string, data = {})`: Opens a modal with the specified name and optional data, only if it's not already open.
 * - `toggle(name: string, data = {})`: Toggles the visibility of a modal by name.
 * - `anyModalOpen()`: Checks if there are any open modals.
 * - `isModalOpen(name: string)`: Checks if a modal with a given name is currently open.
 */

interface Modal {
	name: string;
	data: Record<string, unknown>;
}

const modals = $state({ value: [] as Modal[] });

const close = () => modals.value.pop();

const closeByName = (name: string) => {
	modals.value = modals.value.filter((modal) => modal.name !== name);
};
const open = (name: string, data = {}) => {
	if (isModalOpen(name)) return;
	modals.value.push({ name, data });
};
const toggle = (name: string, data = {}) => {
	isModalOpen(name) ? closeByName(name) : open(name, data);
};
const anyModalOpen = () => modals.value.length > 0;
const isModalOpen = (name: string) => modals.value.some((modal) => modal.name === name);

export { anyModalOpen, close, closeByName, isModalOpen, modals, open, toggle };
