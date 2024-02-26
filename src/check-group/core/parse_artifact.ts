import axios from 'axios';
import cheerio from 'cheerio';

export async function fetchTableData(url: string): Promise<string[][]> {
  try {
    const response = await axios.get(url);
    const html = response.data;

    const $ = cheerio.load(html);

    const tableData: string[][] = [];
    $('table').each((index, element) => {
      const rows: string[] = [];
      $(element).find('tr').each((i, row) => {
        const rowData: string[] = [];
        $(row).find('td').each((j, cell) => {
          rowData.push($(cell).text().trim());
        });
        rows.push(rowData.join(' | '));
      });
      tableData.push(rows);
    });

    return tableData;
  } catch (error) {
    console.error('Error fetching table data:', error);
    return [];
  }
}
