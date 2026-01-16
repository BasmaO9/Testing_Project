import axios from 'axios';

// Create a global axios instance
const api = axios.create({
  baseURL: 'http://localhost:3000/analytics',
  withCredentials: true, // To send cookies with requests
});

// Service for Visualization data
export const visService = {
  // Fetch total income and expenses for the pie chart
  async getTotalIncomeAndExpenses(queryParams: Record<string, any> = {}) {
    const incomeResponse = await api.get('/total-income', { params: queryParams });
    const expensesResponse = await api.get('/total-expenses', { params: queryParams });  
    return {
      income: incomeResponse.data.income,
      expenses: expensesResponse.data.expenses,
    };
  },

  // Fetch spending data for the last 30 days for the line chart
  async getSpentLast30Days() {
    const response = await api.get('/spent-in-last-30-days');
    console.log(response);
    return response.data.totalSpent30Days; // Assuming this is an array of daily spending
  },


  // Fetch spending data for the last 12 months for the line chart
  async getSpentLast12Months() {
    const response = await api.get('/spent-in-last-12-months');
    console.log(response);
    return response.data.totalSpent12Months; // Assuming this is an array of monthly spending
  },


async getBalance( queryParams: Record<string, any> = {}): Promise<number> {
  const response = await api.get(`/balance`, { params: {  ...queryParams } });
  console.log(response);
  return response.data.balance;
},

async getMinExpense( queryParams: Record<string, any> = {}): Promise<number> {
  const response = await api.get(`/min-expense`, { params: {  ...queryParams } });
  console.log(response);
  return response.data.minExpense;
  
},

async getMaxExpense( queryParams: Record<string, any> = {}): Promise<number> {
  const response = await api.get(`/max-expense`, { params: {  ...queryParams } });
  console.log(response);
  return response.data.maxExpense;
},

//updates

// Fetch income data by source
async getIncomeBySource(queryParams: Record<string, any> = {}) {
  const response = await api.get('/income-by-source', { params: queryParams });
  console.log(response);
  return response.data.incomeSources; // Assuming incomeSources is an array of { category, total }
},
};
