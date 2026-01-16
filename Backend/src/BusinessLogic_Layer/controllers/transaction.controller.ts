// Why class-based version of controllers???->

// The controller focuses only on request/response handling, while the service layer
// handles the business logic (database interactions, calculations, etc.). 
// This separation of concerns helps maintain clarity and simplifies unit testing.

// transaction.controller.ts
import { Request, Response } from "express";
import TransactionService from "../services/transaction.service";
import { JwtPayload } from 'jsonwebtoken';

//const transactionService = new TransactionService();

class TransactionController {

   constructor(private transactionService: TransactionService ){}
 

  async getAllTransactions(req: Request  & { user?: JwtPayload }, res: Response) {
    try {
        const user = req.user;
        if (!user || !user.id) {
        res.status(401).json({ error: 'User not authenticated or invalid token' });
         return ;
        }
      const queryParams = req.query;      
      const transactions = await this.transactionService.getAllTransactions(user.id,queryParams);
      res.status(200).json(transactions);
    } catch (err: unknown) {
        res.status(500).json({ error: (err as Error).message });
      }
  }




  async getTransactionById(req: Request & { user?: JwtPayload }, res: Response) {
    try {
        const user = req.user;
        if (!user || !user.id) {
          res.status(401).json({ error: "User not authenticated or invalid token" });
          return;
        }
        
      const transaction = await this.transactionService.getTransactionById(req.params.id, user.id);
      res.status(200).json(transaction);
    } catch (err: unknown) {
        res.status(500).json({ error: (err as Error).message });
      }
  }




  async addTransaction(req: Request & { user?: JwtPayload }, res: Response) {
    try {

        const user = req.user;
        if (!user || !user.id) {
          res.status(401).json({ error: "User not authenticated or invalid token" });
          return;
        }

      const transaction = await this.transactionService.addTransaction({ ...req.body, userId: user.id });
      res.status(201).json(transaction);
    } catch (err: unknown) {
      console.error("Error adding transaction:", (err as Error).message); // ← add this

        res.status(500).json({ error: (err as Error).message });
      }
  }




  async deleteTransaction(req: Request & { user?: JwtPayload }, res: Response) {
    try {

        const user = req.user;
        if (!user || !user.id) {
          res.status(401).json({ error: "User not authenticated or invalid token" });
          return;
        }
      const transaction = await this.transactionService.deleteTransaction(req.params.id, user.id);
      res.status(200).json({ message: "Transaction deleted successfully", transaction });
    } catch (err: unknown) {
        res.status(500).json({ error: (err as Error).message });
    }
  }


  
  async scanReceipt(req: Request & { user?: JwtPayload }, res: Response) {
    try {
      const user = req.user;
      if (!user || !user.id) {
        res.status(401).json({ error: "User not authenticated or invalid token" });
        return;
      }
  
      if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
      }
  
      const result = await this.transactionService.processReceipt(req.file.path, user.id);
      res.status(200).json(result);
    } catch (err: unknown) {
      res.status(500).json({ error: (err as Error).message });
    }}
}

export default TransactionController;
