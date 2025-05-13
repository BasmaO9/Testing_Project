import { Category } from "./category";

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: Category;
  amount: number;
  date: string;
  description?: string;
  userId: string;
}

//Updated to include month and year filtering
export interface TransactionFilters {
  date?: string;
  category?: string;
  month?: string;
  year?: string;
}
