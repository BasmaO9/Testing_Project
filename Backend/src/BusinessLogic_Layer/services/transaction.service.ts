// transaction.service.ts
import mongoose, { ObjectId, Types } from "mongoose";
import Transaction from '../../Database_Layer/models/transaction.schema';
import Budget from '../../Database_Layer/models/budget.schema';
import User from '../../Database_Layer/models/user.schema';
import Category from "../../Database_Layer/models/category.schema";
import moment from 'moment';
import * as Tesseract from 'tesseract.js';
import * as fs from 'fs';

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
    let filter: Record<string, any> = { userId }; // Base filter
  
    // Filter by month and year (if both provided)
    if (queryParams.month && queryParams.year) {
      const year = parseInt(queryParams.year);
      const month = parseInt(queryParams.month) - 1;
  
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 1);
  
      filter.date = { $gte: startDate, $lt: endDate };
    }
  
    // Filter by relative date range (optional)
    else if (queryParams.date) {
      filter.date = { $gte: this.getStartDate(queryParams.date) };
    }
  
    // Filter by category name (optional)
    if (queryParams.category) {
      const categoryFilter = await this.getCategoryFilter(queryParams.category);
      if (categoryFilter) {
        filter.category = { $in: categoryFilter };
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


  
  async processReceipt(filePath: string, userId: string) {
    const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
    fs.unlinkSync(filePath); // delete temp file

    const extracted = this.extractData(text);
    if (!extracted.total || isNaN(extracted.total)) {
      throw new Error("Failed to extract a valid total amount.");
    }

    return {
      amount: extracted.total,
      date: extracted.date || new Date()
    };
  }

  private extractData(text: string) {
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const fullText = lines.join(" ");

    const priceRegex = /(\$|RM)?\s?(\d{1,3}(?:[.,]\d{2}))/gi;
    const dateRegexNumeric = /\b\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4}\b/;
    const dateRegexNamed = /\b\d{2} (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4}\b/i;
    const dateTimeRegex = /\b\d{2}[\/\-\.]\d{2}[\/\-\.]\d{2,4} \d{1,2}:\d{2}(?::\d{2})?( ?(AM|PM))?\b/i;

    const totalLine = lines.find(l =>
      /(total\s+(rm)?|total\s+amt|nett total|net\s+total|total\s+payable|cash\s+tendered|amount\s+payable)/i.test(l) &&
      priceRegex.test(l)
    );

    let total: number | undefined;
    if (totalLine) {
      const priceMatch = [...totalLine.matchAll(priceRegex)];
      if (priceMatch.length > 0) {
        const raw = priceMatch[priceMatch.length - 1][2].replace(",", ".");
        total = parseFloat(raw);
      }
    }

    if (!total) {
      const allPrices = [...fullText.matchAll(priceRegex)].map(m => parseFloat(m[2].replace(",", ".")));
      total = Math.max(...allPrices.filter(n => !isNaN(n)));
    }

    let rawDate: string | undefined;
    const timeMatch = fullText.match(dateTimeRegex);
    const namedMatch = fullText.match(dateRegexNamed);
    const numericMatch = fullText.match(dateRegexNumeric);

    if (timeMatch) rawDate = timeMatch[0];
    else if (namedMatch) rawDate = namedMatch[0];
    else if (numericMatch) rawDate = numericMatch[0];

    let date: Date | undefined;

    if (rawDate) {
      const parts = rawDate.split(/[\/\-\. ]/);
      if (parts.length >= 3 && parts[2].length === 4) {
        const day = parseInt(parts[0]);
        const month = isNaN(+parts[1]) ? this.monthToNumber(parts[1]) : parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const hour = parts.length > 3 ? parseInt(parts[3]) : 0;
        const minute = parts.length > 4 ? parseInt(parts[4]) : 0;
        date = new Date(year, month, day, hour, minute);
      } else {
        date = new Date(rawDate);
      }
    }

    return { total, date };
  }

  private monthToNumber(month: string): number {
    const months = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    return months[month.toLowerCase().slice(0, 3) as keyof typeof months] ?? 0;
  }
}

export default TransactionService;
