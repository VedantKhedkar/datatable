import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import { UserData, Column } from '@/types';

export const exportToCSV = (data: UserData[], visibleColumns: Column[]) => {
  const filteredData = data.map(row => {
    const newRow: { [key: string]: any } = {};
    visibleColumns.forEach(col => {
      newRow[col.label] = row[col.id];
    });
    return newRow;
  });

  const csv = Papa.unparse(filteredData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, 'user_data.csv');
};