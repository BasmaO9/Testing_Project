import axios from 'axios';

// Create a global axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/analytics',
  withCredentials: true, // To send cookies with requests
});

// Service for Visualization data
export const visService = {
  // Fetch total income and expenses for the pie chart
  async getTotalIncomeAndExpenses() {
    const incomeResponse = await api.get('/total-income');
    const expensesResponse = await api.get('/total-expenses');
    return {
      income: incomeResponse.data.income,
      expenses: expensesResponse.data.expenses,
    };
  },

  // Fetch spending data for the last 30 days for the line chart
  async getSpentLast30Days() {
    const response = await api.get('/spent-in-last-30-days');
    return response; // Assuming this is an array of daily spending
  },

  // Fetch spending data for the last 12 months for the line chart
  async getSpentLast12Months() {
    const response = await api.get('/spent-in-last-12-months');
    return response.data.totalSpent12Months; // Assuming this is an array of monthly spending
  },
};
