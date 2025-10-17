import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UserData, Column } from '@/types';

// ... initialData and initialColumns ...
const initialData: UserData[] = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', age: 28, role: 'Developer' },
    { id: 2, name: 'Bob Williams', email: 'bob@example.com', age: 34, role: 'Designer' },
    { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', age: 45, role: 'Manager' },
    { id: 4, name: 'Diana Prince', email: 'diana@example.com', age: 31, role: 'QA Tester' },
    { id: 5, name: 'Ethan Hunt', email: 'ethan@example.com', age: 38, role: 'Developer' },
    { id: 6, name: 'Fiona Glenanne', email: 'fiona@example.com', age: 32, role: 'Designer' },
    { id: 7, name: 'George Costanza', email: 'george@example.com', age: 55, role: 'Manager' },
    { id: 8, name: 'Hannah Montana', email: 'hannah@example.com', age: 25, role: 'QA Tester' },
    { id: 9, name: 'Indiana Jones', email: 'indy@example.com', age: 60, role: 'Developer' },
    { id: 10, name: 'Jack Sparrow', email: 'jack@example.com', age: 42, role: 'Designer' },
    { id: 11, name: 'Kara Danvers', email: 'kara@example.com', age: 29, role: 'Manager' },
    { id: 12, name: 'Luke Skywalker', email: 'luke@example.com', age: 22, role: 'QA Tester' },
];

const initialColumns: Column[] = [
  { id: 'name', label: 'Name', visible: true },
  { id: 'email', label: 'Email', visible: true },
  { id: 'age', label: 'Age', visible: true },
  { id: 'role', label: 'Role', visible: true },
];

type SortOrder = 'asc' | 'desc';
type Theme = 'light' | 'dark';

interface TableState {
  data: UserData[];
  columns: Column[];
  searchQuery: string;
  sortKey: keyof UserData | string;
  sortOrder: SortOrder;
  currentPage: number;
  rowsPerPage: number;
  theme: Theme;
}

const initialState: TableState = {
  data: initialData,
  columns: initialColumns,
  searchQuery: '',
  sortKey: 'name',
  sortOrder: 'asc',
  currentPage: 1,
  rowsPerPage: 10,
  theme: 'light', // <-- CHANGE THIS TO 'light'
};

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setSort(state, action: PayloadAction<keyof UserData | string>) {
      if (state.sortKey === action.payload) {
        state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        state.sortKey = action.payload;
        state.sortOrder = 'asc';
      }
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    toggleColumnVisibility(state, action: PayloadAction<string>) {
      const column = state.columns.find(col => col.id === action.payload);
      if (column) {
        column.visible = !column.visible;
      }
    },
    addColumn(state, action: PayloadAction<string>) {
      const newColumnLabel = action.payload;
      const newColumnId = newColumnLabel.toLowerCase().replace(/\s+/g, '_');
      if (!state.columns.some(col => col.id === newColumnId)) {
        state.columns.push({ id: newColumnId, label: newColumnLabel, visible: true });
      }
    },
    importData(state, action: PayloadAction<UserData[]>) {
        state.data = action.payload;
        state.currentPage = 1;
    },
    deleteRow(state, action: PayloadAction<number>) {
      state.data = state.data.filter(row => row.id !== action.payload);
    },
    updateRow(state, action: PayloadAction<{ id: number; updatedData: Partial<UserData> }>) {
      const { id, updatedData } = action.payload;
      const rowIndex = state.data.findIndex(row => row.id === id);
      if (rowIndex !== -1) {
        state.data[rowIndex] = { ...state.data[rowIndex], ...updatedData };
      }
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const {
  setSearchQuery,
  setSort,
  setCurrentPage,
  toggleColumnVisibility,
  addColumn,
  importData,
  deleteRow,
  updateRow,
  toggleTheme,
} = tableSlice.actions;

export default tableSlice.reducer;