<script lang="ts">
	/**
	 * A reusable button component that adheres to the design system
	 *
	 * Features:
	 * - Supports various styles and sizes
	 * - Accepts an optional icon with hover animations
	 * - Forwards all standard HTML button attributes (eg. `type`, `disabled`, `on:click`, etc.)
	 * - Accepts slotted content via the `children` snippet
	 *
	 * Props:
	 * @prop {string} [variant="default"] - Visual style of the button ('default' | 'outline' | 'ghost')
	 * @prop {string} [size="default"] - Size variant ('default' | 'lg' | 'icon' | 'adaptive' | 'adaptiveSm')
	 * @prop {string} [className=""] - Additional Tailwind classes to merge with variant styles
	 * @prop {TIcon} [icon] - Optional name of icon to show before the text
	 * @prop {string} [iconSize] - Size of the icon (default is 'md')
	 * @prop {string} [animation=""] - Hover animation for the icon
	 * @prop {() => void} [onClickOutside] - Callback function to run when the user clicks away from the button
	 * @prop {HTMLButtonElement} [ref] - Reference to the button element
	 * @prop {Snippet} [children] - Rendered slot content inside the button
	 *
	 * Usage Guidelines:
	 * - Use the default `size` and `variant` for most buttons.
	 * - When using both an icon and text, apply an `animation`.
	 *   Icon-only buttons should not use animations.
	 * - Use `outline` variant for secondary actions and `ghost` for tertiary ones.
	 * - `adaptive` sizes are responsive buttons that are icon-sized on small screens
	 *   and expand with text on larger screens.
	 * - This component enforces consistent styling across the app.
	 *   Avoid passing custom classes that override styles unless absolutely necessary.
	 * - The `icon` size variant is intended only for compact, ghost icon buttons
	 *   and should be used sparingly.
	 * - Bind with `bind:ref` instead of `bind:this`
	 */

	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';
	import { twMerge } from 'tailwind-merge';
	import { tv, type VariantProps } from 'tailwind-variants';

	import Icon, { type TIcon } from '$lib/components/ui/Icon.svelte';
	import clickOutside from '$lib/util/clickOutside';

	const svgVariants = tv({
		base: 'transition-transform shrink-0',
		variants: {
			animation: {
				'': '',
				'move-left': 'group-hover:-translate-x-1',
				'move-right': 'group-hover:translate-x-1',
				'move-up': 'group-hover:-translate-y-1',
				'move-down': 'group-hover:translate-y-1',
				'rotate-clock': 'group-hover:rotate-45',
				'rotate-clock-sm': 'group-hover:rotate-[30deg]',
				'rotate-counter': 'group-hover:-rotate-45',
				'flip-horizontal': 'group-hover:-scale-x-100',
				'zoom': 'group-hover:scale-125',
				'flip-rotate': 'group-hover:-scale-y-100 group-hover:rotate-[30deg]',
				'flip': 'group-hover:-scale-y-100 group-hover:-scale-x-100'
			}
		},
		defaultVariants: {
			animation: ''
		}
	});

	const buttonVariants = tv({
		base: 'group inline-flex gap-2 items-center justify-center whitespace-nowrap rounded-none font-light transition-colors duration-125 disabled:pointer-events-none disabled:opacity-50',
		variants: {
			variant: {
				default: 'bg-base-600 text-base-50 hover:bg-base-700',
				outline:
					'border-base-300 dark:border-base-600 border-2 bg-transparent hover:bg-base-300 dark:hover:bg-base-600',
				ghost: 'bg-transparent hover:bg-base-300 dark:hover:bg-base-600'
			},
			size: {
				default: 'h-10 px-4',
				lg: 'h-12 px-6',
				icon: 'h-10 w-10 rounded-full',
				adaptive: 'h-10 w-10 lg:w-auto lg:px-4',
				adaptiveSm: 'h-10 w-10 sm:w-auto sm:px-4 lg:h-12 lg:px-6'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	});

	interface ButtonProps extends HTMLButtonAttributes {
		element?: 'button';
		variant?: VariantProps<typeof buttonVariants>['variant'];
		size?: VariantProps<typeof buttonVariants>['size'];
		className?: string;
		icon?: TIcon;
		iconSize?: 'sm' | 'md' | 'adaptive';
		animation?: VariantProps<typeof svgVariants>['animation'];
		onClickOutside?: () => void;
		ref?: HTMLButtonElement;
		children?: import('svelte').Snippet;
	}

	interface AnchorProps extends HTMLAnchorAttributes {
		element: 'a';
		variant?: VariantProps<typeof buttonVariants>['variant'];
		size?: VariantProps<typeof buttonVariants>['size'];
		className?: string;
		icon?: TIcon;
		iconSize?: 'sm' | 'md' | 'adaptive';
		animation?: VariantProps<typeof svgVariants>['animation'];
		href: string;
		onClickOutside?: () => void;
		ref?: HTMLAnchorElement;
		children?: import('svelte').Snippet;
	}

	type Props = ButtonProps | AnchorProps;

	let {
		element = 'button',
		variant = 'default',
		size = 'default',
		className = '',
		icon,
		iconSize = 'md',
		animation = '',
		onClickOutside = () => {},
		ref = $bindable(),
		children,
		...restProps
	}: Props = $props();

	let Component = $derived(element === 'a' ? 'a' : 'button');
</script>

<svelte:element
	this={Component}
	class={twMerge(buttonVariants({ variant, size, className }))}
	{...restProps}
	use:clickOutside={onClickOutside}
	bind:this={ref}>
	{#if icon}
		<Icon name={icon} className={twMerge(svgVariants({ animation }))} size={iconSize} />
	{/if}
	{@render children?.()}
</svelte:element>
