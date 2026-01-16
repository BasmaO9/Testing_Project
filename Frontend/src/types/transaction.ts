import { Category } from "./category";

export interface Transaction {
  _id: string;
  type: 'income' | 'expense';
  category: Category; // full object when returned
  amount: number;
  date: string;
  description?: string;
  userId: string;
}

// Filters for list view
export interface TransactionFilters {
  date?: string;
  category?: string;
  month?: string;
  year?: string;
}

// DTO for adding a transaction
export type CreateTransactionDTO = {
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: string;
  description?: string;
};