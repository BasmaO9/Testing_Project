// services/transactions.service.ts

import axios from 'axios';
import { Transaction, TransactionFilters, CreateTransactionDTO } from '../types/transaction';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true,
});

export const transactionsService = {
  async getAllTransactions(filters?: TransactionFilters & { month?: string; year?: string }): Promise<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.month) params.append('month', filters.month);
    if (filters?.year) params.append('year', filters.year);

    const response = await api.get<Transaction[]>('/transactions', { params });
    return response.data;
  },

  async getTransactionById(id: string): Promise<Transaction> {
    const response = await api.get<Transaction>(`/transactions/${id}`);
    return response.data;
  },

  async addTransaction(transaction: CreateTransactionDTO): Promise<Transaction> {
    const response = await api.post<Transaction>('/transactions', transaction);
    return response.data;
  },

  async deleteTransaction(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async scanReceipt(file: File): Promise<{ amount: number; date: string }> {
    const formData = new FormData();
    formData.append('receipt', file);

    const response = await api.post('/transactions/scan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });

    return response.data;
  },
};




































// import axios from 'axios';

// const API_URL = 'http://localhost:3000/transactions'; 

// interface Transaction {
//   _id?: string;
//   type: 'income' | 'expense';
//   amount: number;
//   userId: string;
//   category: string;
//   date: string; 
// }

// class TransactionService {

//     async getAllTransactions(userId: string, queryParams: any) {
//       try {
//         const response = await axios.get(`${API_URL}/${userId}`, { params: queryParams });
//         return response.data; 
//       } catch (error) {
//         console.error('Error fetching transactions:', error);
//         throw error;
//       }
//     }
  
//     async getTransactionById(transactionId: string, userId: string) {
//       try {
//         const response = await axios.get(`${API_URL}/single/${transactionId}`, { params: { userId } });
//         return response.data; 
//       } catch (error) {
//         console.error('Error fetching transaction:', error);
//         throw error;
//       }
//     }
  
//     async addTransaction(transactionData: Transaction) {
//       try {
//         const response = await axios.post(API_URL, transactionData);
//         return response.data; 
//       } catch (error) {
//         console.error('Error adding transaction:', error);
//         throw error;
//       }
//     }
  
//     async deleteTransaction(transactionId: string, userId: string) {
//       try {
//         const response = await axios.delete(`${API_URL}/${transactionId}`, { params: { userId } });
//         return response.data; 
//       } catch (error) {
//         console.error('Error deleting transaction:', error);
//         throw error;
//       }
//     }
//   }
  
//   export default new TransactionService();
