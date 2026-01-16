import TransactionService from "./transaction.service"; 
import Transaction from '../../Database_Layer/models/transaction.schema'; 
import moment from "moment"; 
import Budget from "../../Database_Layer/models/budget.schema"; 
import mongoose from "mongoose";

// Create an instance of TransactionService to use it the methods
const transactionService = new TransactionService(); 
//=================================================================================================

export class VisService {
  
//=================================================================================================
    // Calculate the total income for a user based on transactions
    async getTotalIncome(userId: string, queryParams: any): Promise<number> {
        // Fetch all transactions for the user
        const transactions = await transactionService.getAllTransactions(userId, queryParams); 
        return transactions
        // Filter transactions to include only incomes
            .filter((t) => t.type === "income") 
            //  reduce mathod used to aggregate data from an array of transactions by
            //  iterating through each element
            //  Sum the amounts of all income transactions
            .reduce((sum, t) => sum + t.amount, 0); 
    }
//=================================================================================================
    // Calculate the total expenses for a user based on transactions
    async getTotalExpenses(userId: string, queryParams: any): Promise<number> {
        // Fetch all transactions for the user
        const transactions = await transactionService.getAllTransactions(userId, queryParams); 
        return transactions
        // Filter transactions to include only expenses
            .filter((t) => t.type === "expense") 
            //  reduce mathod used to aggregate data from an array of transactions by
            //  iterating through each element
            // Sum the amounts of all expense transactions
            .reduce((sum, t) => sum + t.amount, 0); 
    }
    
//=================================================================================================
    // Calculate the balance 
    async getBalance(userId: string, queryParams: any): Promise<number> {
        const income = await this.getTotalIncome(userId, queryParams); 
        const expenses = await this.getTotalExpenses(userId, queryParams);
        return income - expenses; 
    }
//=================================================================================================
    // Find the minimum expense amount for a user
    async getMinExpense(userId: string, queryParams: any): Promise<number> {
        // Fetch all transactions for the user
        const transactions = await transactionService.getAllTransactions(userId, queryParams); 
        // Filter transactions to include only expenses
        const expenses = transactions.filter((t) => t.type === "expense"); 
        return Math.min(...expenses.map((t) => t.amount)); 
    }
//=================================================================================================
    // Find the maximum expense amount for a user
    async getMaxExpense(userId: string, queryParams: any): Promise<number> {
         // Fetch all transactions for the user
        const transactions = await transactionService.getAllTransactions(userId, queryParams);
        // Filter transactions to include only expenses
        const expenses = transactions.filter((t) => t.type === "expense"); 
        return Math.max(...expenses.map((t) => t.amount)); 
    }
//=================================================================================================
    // Calculate the total spent money for a user from the budget collection
    async getTotalSpentMoney(userId: string): Promise<number> {
        if (!userId) {
            throw new Error("User ID is required"); 
        }

        let ID = new mongoose.Types.ObjectId(userId);
        const totalSpent = await Budget.aggregate([
            // Match budgets belonging to the given user
            { $match: { userId:ID } }, 
             // Sum up the "spent" field for all matched budgets
            { $group: { _id: null, totalSpent: { $sum: "$total_spent" } } }
        ]);
        // Throw an error if no budget records are found
        if (!totalSpent.length) {
            throw new Error("No budget found"); 
        }

        return totalSpent[0].totalSpent;
    }
//=================================================================================================
    // Calculate the total expenses in the last 30 days 
    async getSpentLast30Days(userId: string): Promise<number> {
        if (!userId) {
            throw new Error("User ID is required"); 
        }

        const startDate = moment().subtract(30, 'days').toDate(); 
        const transactions = await Transaction.find({
            // Match transactions belonging to the user
            userId, 
            type: "expense", 
            // Filter for transactions from the last 30 days
            date: { $gte: startDate } 
        });
        //  reduce mathod used to aggregate data from an array of transactions by
        //  iterating through each element
        // Sum the amounts of the filtered transactions
        return transactions.reduce((sum, t) => sum + t.amount, 0); 
    } 
//=================================================================================================
    // Calculate the total expenses in the last 12 months 
    async getSpentLast12Months(userId: string): Promise<number> {
        if (!userId) {
            throw new Error("User ID is required");
        }

        const startDate = moment().subtract(12, 'months').toDate(); 
        const transactions = await Transaction.find({
            // Match transactions belonging to the user
            userId, 
            type: "expense", 
            // Filter for transactions from the last 12 months
            date: { $gte: startDate } 
        });

        return transactions.reduce((sum, t) => sum + t.amount, 0); 
    }
//=================================================================================================
//updates

async getIncomeBySource(userId: string, queryParams: any): Promise<{ category: string; total: number }[]> {
    if (!userId) throw new Error("User ID is required");
  
    let matchStage: any = {
      userId: new mongoose.Types.ObjectId(userId),
      type: "income",
    };
  
    // Add date filter based on month and year
    if (queryParams.month && queryParams.year) {
      const year = parseInt(queryParams.year);
      const month = parseInt(queryParams.month) - 1; // JS months are 0-based
  
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);
  
      matchStage.date = { $gte: startDate, $lt: endDate };
    }
  
    const result = await Transaction.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryInfo",
        }
      },
      { $unwind: "$categoryInfo" },
      {
        $group: {
          _id: "$categoryInfo.category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          category: "$_id",
          total: 1,
          _id: 0,
        },
      },
    ]);
  
    return result;
  }
  
}
