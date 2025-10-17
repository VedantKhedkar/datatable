export interface UserData {
  id: number;
  name: string;
  email: string;
  age: number;
  role: string;
  [key: string]: any; // Allows for dynamic columns
}

export interface Column {
  id: string; // This was simplified to fix the type error
  label: string;
  visible: boolean;
}