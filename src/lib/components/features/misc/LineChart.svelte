<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		/**
		 * @param data - 2d array of numbers; each sub-array represents one line to be drawn
		 * @param width - optional chart width (else uses space available)
		 * @param height - chart height
		 */
		data: number[][];
		width: number | undefined;
		height: number;
		strokeWidth?: number;
	}

	const { data, width, height, strokeWidth = 2 }: Props = $props();

	let divWidth = $state(0);
	function handleResize() {
		/**
		 * Reset width so the parent can size itself, then measure after the layout settles.
		 *
		 * Draw chart at 0 width so parent width isn't determined by chart width.
		 * Then we calculate the chart width based on the parent width.
		 *
		 * If we just do `divWidth = chartEl.offsetWidth`, then it's a chicken and egg problem
		 * where if the screen is resized we want the chart to be the width of the parent
		 * but the parent's width is determined by the child's (chart's) width.
		 */
		divWidth = 0;
		setTimeout(() => (divWidth = chartEl?.offsetWidth ?? 0), 10);
	}
	onMount(() => {
		handleResize();

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	});

	const colors = ['stroke-accent-700', 'stroke-accent-300'];

	let chartEl = $state() as HTMLDivElement;
	let svg: SVGSVGElement;

	function createLineChart(data: number[][], width: number, height: number) {
		if (svg) {
			chartEl.removeChild(svg);
		}

		// For initial load if automatic width
		if (divWidth === 0) handleResize();

		svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.setAttribute('width', width.toString());
		svg.setAttribute('height', height.toString());

		const yScale = (height - strokeWidth * 2) / Math.max(...data.flat());
		for (let i = 0; i < data.length; i++) {
			const lineData = data[i];
			const xScale = (width - strokeWidth * 2) / (lineData.length - 1);

			const line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
			const points = lineData.map((value, index) => `${index * xScale},${height - value * yScale}`);

			line.setAttribute('d', `M${points.join('L')}`);

			line.setAttribute('stroke-width', strokeWidth.toString());
			line.setAttribute('fill', 'none');
			line.setAttribute('class', colors[i]);

			svg.appendChild(line);
		}

		chartEl.appendChild(svg);
	}
	$effect(() => {
		if (chartEl) createLineChart(data, width ?? divWidth, height);
	});
</script>

<div bind:this={chartEl}></div>
