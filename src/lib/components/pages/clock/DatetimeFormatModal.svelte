<script lang="ts">
	import { dictionary } from '$lib/stores/languageDictionary';
</script>

<div class="pad">
	<table class="p striped">
		<thead>
			<tr>
				{#each $dictionary.clockSettings.datetimeFormatTableHeadings as item}
					<th>{item}</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each $dictionary.clockSettings.datetimeFormatTable as row}
				<tr>
					{#each row as item}
						<td>{item}</td>
					{/each}
				</tr>
			{/each}
		</tbody>
	</table>
</div>
