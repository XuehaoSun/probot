import axios from 'axios';
import cheerio from 'cheerio';

const tableMark: string = " --- "

interface TableFetcher {
  fetch(url: string): Promise<string[]>;
}

class HTMLTableFetcher implements TableFetcher {
  async fetch(url: string): Promise<string[]> {
    try {
      const response = await axios.get(url);
      const html = response.data;

      const $ = cheerio.load(html);

      const tables: string[] = [];
      $('table').each((index, element) => {
          tables.push('<table>$(element).html()</table>' || '');
      });

      return tables;
    } catch (error) {
      console.error('Error fetching table data:', error);
      return [];
    }
  }
}

class LogSummaryFetcher implements TableFetcher {
  async fetch(url: string): Promise<string[]> {
    try {
      const response = await axios.get(url);
      const text: string = response.data;

      const lines = text.split('\n');
      const headers = lines[0].split(';');
      const table: string[] = Array(headers.length).fill(tableMark)
      const rows = lines.slice(1);

      const tableData: string[] = [`|${headers.join('|')}|`, `|${table.join('|')}|`];
      for (const row of rows) {
        const rowData = row.split(';').join('|');
        tableData.push(rowData);
      }
      return tableData;
    } catch (error) {
      console.error('Error fetching summary log:', error);
      return [];
    }
  }
}

export function createFetcher(type: 'html' | 'log'): TableFetcher {
  if (type === 'html') {
    return new HTMLTableFetcher();
  } else if (type === 'log') {
    return new LogSummaryFetcher();
  } else {
    throw new Error('Invalid fetcher type');
  }
}
