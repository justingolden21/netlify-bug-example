import downloadFile from '$lib/util/downloadFile';

const arrayToCSV = (data: any[][]) =>
	data
		.map(
			(row) =>
				row
					.map(String) // convert every value to string
					.map((v) => v.replaceAll('"', '""')) // escape double quotes
					.map((v) => `"${v}"`) // quote it
					.join(',') // join with commas
		)
		.join('\r\n'); // rows on new lines

export default function downloadCSV(data: any[][], filename: string) {
	const csv = arrayToCSV(data);
	downloadFile(csv, filename, 'text/csv;charset=utf-8;');
}
