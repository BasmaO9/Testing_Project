// transaction.service.ts
import mongoose, { ObjectId, Types } from "mongoose";
import Transaction from '../../Database_Layer/models/transaction.schema';
import Budget from '../../Database_Layer/models/budget.schema';
import User from '../../Database_Layer/models/user.schema';
import Category from "../../Database_Layer/models/category.schema";
import moment from 'moment';

// solid/clean code paradigms used =>

// descriptive endpoint names
// separation of concerns : filters handled separately
// imperative programming : Logic for Adding and Reversing Transactions
// declarative programming : MongoDB methods
// destructuring : const { type, category, amount, userId } = transactionData;
// dependency injection in constructor


class TransactionService {

// Constructor to handle dependency injection for better testability
constructor(private transactionModel = Transaction, private budgetModel = Budget, private userModel = User, private categoryModel = Category) {}

// Utility method: Validate MongoDB ObjectID
private isValidObjectId(id: string): boolean {
    return mongoose.Types.ObjectId.isValid(id);
  }

  async getAllTransactions(userId: string, queryParams: any) {
    let filter: Record<string, any> = { userId }; // Base filter for the user
  
    // Apply date filter if provided
    if (queryParams.date) {
      filter.date = { $gte: this.getStartDate(queryParams.date) };
    }
  
    // Apply category filter if provided
    if (queryParams.category) {
      const categoryFilter = await this.getCategoryFilter(queryParams.category);
      if (categoryFilter) {
        filter.category = { $in: categoryFilter }; // Match ObjectId(s) of categories
      }
    }
  
    return await this.transactionModel.find(filter).populate('category');
  }
  
  // Single responsibility: Extract logic to calculate start date
  private getStartDate(dateRange: string): Date {
    const currentDate = moment();
    switch (dateRange) {
      case 'last-week':
        return currentDate.subtract(1, 'week').startOf('week').toDate();
      case 'last-month':
        return currentDate.subtract(1, 'month').startOf('month').toDate();
      case 'last-year':
        return currentDate.subtract(1, 'year').startOf('year').toDate();
      default:
        return currentDate.subtract(1, 'year').startOf('year').toDate();
    }
  }
  
  // Single responsibility: Extract logic to calculate category filter
  private async getCategoryFilter(categoryName: string): Promise<mongoose.Types.ObjectId[] | null> {
    const categoryRegex = new RegExp(categoryName, 'i'); // Case-insensitive regex for category name
  
    // Query the Category model to find matching categories
    const matchingCategories = await this.categoryModel.find({ category: categoryRegex }).exec();
  
    if (matchingCategories.length === 0) return null; // No matching categories
  
    // Return the ObjectIds of matching categories
    return matchingCategories.map((category) => category._id);
  }
  


   // Get transaction by ID
  async getTransactionById(id: string, userId: string) {

    if (!this.isValidObjectId(id)) throw new Error("Invalid transaction ID");

    const transaction = await this.transactionModel.findOne({ _id: id, userId }).populate("category");
    if (!transaction) throw new Error("Transaction not found");
    return transaction;
  }




  // Add a new transaction
  async addTransaction(transactionData: any) {
    const { type, category, amount, userId } = transactionData;

    if (!this.isValidObjectId(category)) throw new Error("Invalid category ID");

    if (type === "expense") {
      await this.handleExpenseTransaction(category, amount, userId);
    } else if (type === "income") {
      await this.handleIncomeTransaction(amount, userId);
    } else {
      throw new Error("Invalid transaction type. Must be 'income' or 'expense'.");
    }

    return await this.transactionModel.create(transactionData);
  }

  // Single responsibility: Handle expense logic
  private async handleExpenseTransaction(category: string, amount: number, userId: string) {
    const budget = await this.budgetModel.findOne({ category, userId });

    if (!budget) throw new Error("No budget found for this category");
    if (budget.total_spent + amount > budget.limit) throw new Error("Budget limit exceeded");

    budget.total_spent += amount;
    await budget.save();
  }

  // Single responsibility: Handle income logic
  private async handleIncomeTransaction(amount: number, userId: string) {
    const user = await this.userModel.findById(userId);

    if (!user) throw new Error("User not found");

    user.total_income = (user.total_income || 0) + amount;
    await user.save();
  }



  // Delete a transaction
  async deleteTransaction(id: string, userId: string) {
    if (!this.isValidObjectId(id)) throw new Error("Invalid transaction ID");

    const transaction = await this.transactionModel.findOneAndDelete({ _id: id, userId });
    if (!transaction) throw new Error("Transaction not found");

    if (transaction.type === "expense") {
      await this.reverseExpenseTransaction(transaction.category, transaction.amount, userId);
    } else if (transaction.type === "income") {
      await this.reverseIncomeTransaction(transaction.amount, userId);
    }

    return transaction;
  }

  // Single responsibility: Reverse expense logic
  private async reverseExpenseTransaction(category: Types.ObjectId , amount: number, userId: string) {
    const budget = await this.budgetModel.findOne({ category, userId });
    if (budget) {
      budget.total_spent -= amount;
      await budget.save();
    }
  }

  // Single responsibility: Reverse income logic
  private async reverseIncomeTransaction(amount: number, userId: string) {
    const user = await this.userModel.findById(userId);
    if (user) {
      user.total_income = (user.total_income || 0) - amount;
      await user.save();
    }
  }


}

export default TransactionService;
