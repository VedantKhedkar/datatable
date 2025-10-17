'use client';

import { useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { 
  setSearchQuery, 
  setSort, 
  setCurrentPage, 
  importData, 
  deleteRow,
  updateRow,
  toggleTheme
} from '@/store/tableSlice';
import ManageColumnsModal from './ManageColumnsModal';
import ConfirmationDialog from './ConfirmationDialog';
import { exportToCSV } from '@/lib/csvUtils';
import Papa from 'papaparse';

const DataTable = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dialogState, setDialogState] = useState({ isOpen: false, rowId: null as number | null });
  const [editingCell, setEditingCell] = useState<{ rowId: number; columnId: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch: AppDispatch = useDispatch();

  const {
    data,
    columns,
    searchQuery,
    sortKey,
    sortOrder,
    currentPage,
    rowsPerPage,
    theme
  } = useSelector((state: RootState) => state.table); // Fixed: Root_State -> RootState

  const visibleColumns = columns.filter((column) => column.visible);

  const filteredData = data.filter((row) =>
    visibleColumns.some((column) =>
      String(row[column.id] ?? '').toLowerCase().includes(searchQuery.toLowerCase())
    )
  );
  
  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortKey];
    const bValue = b[sortKey];
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = sortedData.slice(startIndex, endIndex);
  const totalPages = Math.ceil(sortedData.length / rowsPerPage); // Fixed: sortedData..length -> sortedData.length

  const handlePreviousPage = () => {
    if (currentPage > 1) dispatch(setCurrentPage(currentPage - 1));
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) dispatch(setCurrentPage(currentPage + 1));
  };

  const handleExport = () => {
    exportToCSV(sortedData, visibleColumns);
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const importedUsers = results.data.map((user, index) => ({
            ...user, // Fixed: {user, -> {...user,
            id: Date.now() + index,
            age: Number((user as any).age) || 0,
          })) as any;
          dispatch(importData(importedUsers));
        },
        error: (error) => console.error("Error parsing CSV:", error),
      });
    }
    // Reset file input to allow re-uploading the same file
    if (event.target) {
        event.target.value = '';
    }
  };
  
  const handleDeleteClick = (rowId: number) => {
    setDialogState({ isOpen: true, rowId });
  };

  const handleConfirmDelete = () => {
    if (dialogState.rowId !== null) {
      dispatch(deleteRow(dialogState.rowId));
    }
    setDialogState({ isOpen: false, rowId: null });
  };

  const handleCellChange = (e: React.ChangeEvent<HTMLInputElement>, rowId: number, columnId: string) => {
    const { value } = e.target;
    const updatedValue = columnId === 'age' ? Number(value) : value;
    dispatch(updateRow({ id: rowId, updatedData: { [columnId]: updatedValue } }));
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
       <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Dynamic Data Table</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-400">A fully-featured data table manager.</p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex items-center space-x-2">
           <button 
              onClick={() => dispatch(toggleTheme())}
              className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
           <button type="button" onClick={() => fileInputRef.current?.click()} className="inline-flex items-center justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700">Import</button>
           <button type="button" onClick={handleExport} className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700">Export</button>
           <button type="button" onClick={() => setIsModalOpen(true)} className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700">Manage Columns</button> {/* Fixed: hover:bg-indigo-7V00 -> hover:bg-indigo-700 */}
        </div>
      </div>

      <input type="file" ref={fileInputRef} onChange={handleFileImport} accept=".csv" className="hidden" />
      
      <div className="mt-4">
        <input type="text" placeholder="Search all fields..." value={searchQuery} onChange={(e) => dispatch(setSearchQuery(e.target.value))}
          className="block w-full max-w-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 shadow-sm p-2" />
      </div>

      <div className="mt-8 flex flex-col">
        <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    {visibleColumns.map((column) => (
                      <th key={column.id} scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6 cursor-pointer" onClick={() => dispatch(setSort(column.id))} >
                        {column.label}
                        {sortKey === column.id ? (sortOrder === 'asc' ? ' ▲' : ' ▼') : ''}
                      </th>
                    ))}
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right font-semibold text-gray-900 dark:text-white">
                      <span>Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-900">
                  {paginatedData.map((row) => (
                    <tr key={row.id}>
                      {visibleColumns.map((column) => (
                        <td key={column.id} className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6" onDoubleClick={() => setEditingCell({ rowId: row.id, columnId: column.id })}> {/* Fixed: whitespace-nowCrap -> whitespace-nowrap */}
                          {editingCell?.rowId === row.id && editingCell?.columnId === column.id ? (
                            <input
                              type={column.id === 'age' ? 'number' : 'text'}
                              value={String(row[column.id] ?? '')}
                              onChange={(e) => handleCellChange(e, row.id, column.id)}
                              onKeyDown={handleKeyDown}
                              onBlur={() => setEditingCell(null)}
                              autoFocus
                              className="bg-gray-100 dark:bg-gray-700 border border-indigo-500 rounded px-2 py-1 w-full"
                            />
                          ) : (
                            row[column.id] ?? ''
                          )}
                        </td>
                      ))}
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6 space-x-4">
                        <button onClick={() => setEditingCell({ rowId: row.id, columnId: 'name' })} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300">Edit</button>
                        <button onClick={() => handleDeleteClick(row.id)} className="text-red-600 dark:text-red-500 hover:text-red-900 dark:hover:text-red-700">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
            <button onClick={handlePreviousPage} disabled={currentPage === 1} className="relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Previous</button>
            <button onClick={handleNextPage} disabled={currentPage === totalPages} className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50">Next</button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
            <p className="text-sm text-gray-700 dark:text-gray-400">
                Showing <span className="font-medium">{startIndex + 1}</span> to <span className="font-medium">{Math.min(endIndex, sortedData.length)}</span> of{' '}
                <span className="font-medium">{sortedData.length}</span> results
            </p>
            </div>
            <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button onClick={handlePreviousPage} disabled={currentPage === 1} className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50">Previous</button>
                <button onClick={handleNextPage} disabled={currentPage === totalPages} className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 dark:ring-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 focus:z-20 focus:outline-offset-0 disabled:opacity-50">Next</button>
            </nav>
            </div>
        </div>
      </div>
      
      <ManageColumnsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <ConfirmationDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ isOpen: false, rowId: null })}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
};

export default DataTable;