'use client';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { toggleColumnVisibility, addColumn } from '@/store/tableSlice';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const ManageColumnsModal = ({ isOpen, onClose }: Props) => {
  const dispatch: AppDispatch = useDispatch();
  const columns = useSelector((state: RootState) => state.table.columns);
  const [newColumnName, setNewColumnName] = useState('');

  if (!isOpen) return null;

  const handleAddColumn = () => {
    if (newColumnName.trim()) {
      dispatch(addColumn(newColumnName.trim()));
      setNewColumnName('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold text-white mb-4">Manage Columns</h2>
        
        <div className="space-y-2">
          {columns.map(col => (
            <label key={col.id} className="flex items-center space-x-3">
              <input
                type="checkbox"
                className="form-checkbox h-5 w-5 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                checked={col.visible}
                onChange={() => dispatch(toggleColumnVisibility(col.id))}
              />
              <span className="text-gray-300">{col.label}</span>
            </label>
          ))}
        </div>

        <div className="mt-6 border-t border-gray-700 pt-4">
          <h3 className="text-lg font-medium text-white mb-2">Add New Column</h3>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newColumnName}
              onChange={(e) => setNewColumnName(e.target.value)}
              placeholder="e.g., Department"
              className="flex-grow rounded-md border-gray-500 bg-gray-700 text-white shadow-sm p-2"
            />
            <button
              onClick={handleAddColumn}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Add
            </button>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-500"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageColumnsModal;