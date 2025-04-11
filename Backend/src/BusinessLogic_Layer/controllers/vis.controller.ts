import { Request, Response } from "express";
import { VisService } from "../services/vis.service"; 
import { JwtPayload } from "jsonwebtoken"; 
import authenticateToken from "../Middleware/AuthMiddleware";

//=================================================================================================

class VisController {
    // inject service
    constructor(private visService : VisService ) {}
    
//=================================================================================================
    // Handler to get the total income
    async getTotalIncome(req: Request & { user?: JwtPayload }, res: Response) {
        try {
            // Extract the user ID from the request token payload
            const userId = req.user?.id; 
            if (!userId) {
                res.status(401).json({ error: 'Sorry Unauthorized :(' });
                return;
            }
            // Call the service to calculate total income
            const income = await this.visService.getTotalIncome(userId, req.query); 
            res.status(200).json({ income }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message }); 
        }
    }
//=================================================================================================
    // Handler to get the total expenses 
    async getTotalExpenses(req: Request & { user?: JwtPayload }, res: Response) {
        try {
             // Extract the user ID from the request token payload
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Sorry Unauthorized :(' }); 
                return;
            }
            const expenses = await this.visService.getTotalExpenses(userId, req.query); 
            res.status(200).json({ expenses }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message }); 
        }
    }
//=================================================================================================
    // Handler to calculate the user's balance 
    async getBalance(req: Request & { user?: JwtPayload }, res: Response) {
        try {
            // Extract the user ID from the request token payload
            const userId = req.user?.id; 
            if (!userId) {
                res.status(401).json({ error: 'Sorry Unauthorized :(' });
                return;
            }
            const balance = await this.visService.getBalance(userId, req.query); 
            res.status(200).json({ balance }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message }); 
        }
    }
//=================================================================================================
    // Handler to get the user's minimum expense
    async getMinExpense(req: Request & { user?: JwtPayload }, res: Response) {
        try {
             // Extract the user ID from the request token payload
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Sorry Unauthorized :(' }); 
                return;
            }
            const minExpense = await this.visService.getMinExpense(userId, req.query); 
            res.status(200).json({ minExpense }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
//=================================================================================================
    // Handler to get the user's maximum expense
    async getMaxExpense(req: Request & { user?: JwtPayload }, res: Response) {
        try {
            // Extract the user ID from the request token payload
            const userId = req.user?.id; 
            if (!userId) {
                res.status(401).json({ error: 'Sorry Unauthorized :(' });
                return;
            }
            const maxExpense = await this.visService.getMaxExpense(userId, req.query); 
            res.status(200).json({ maxExpense }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message }); 
        }
    }
//=================================================================================================
    // Handler to get the user's total spent money from budgets
    async getTotalSpentMoney(req: Request & { user?: JwtPayload }, res: Response) {
        try {
            // Extract the user ID from the request token payload
            const userId = req.user?.id; 
            if (!userId) {
                res.status(401).json({ error: "Sorry Unauthorized :(" }); 
                return;
            }

            const totalSpentMoney = await this.visService.getTotalSpentMoney(userId); 
            res.status(200).json({ totalSpentMoney }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message }); 
        }
    }
//=================================================================================================
    // Handler to get the total spent in the last 30 days
    async getSpentLast30Days(req: Request & { user?: JwtPayload }, res: Response) {
        try {
            // Extract the user ID from the request token payload
            const userId = req.user?.id; 
            if (!userId) {
                res.status(401).json({ error: "Sorry Unauthorized :(" }); 
                return;
            }

            const totalSpent30Days = await this.visService.getSpentLast30Days(userId); 
            res.status(200).json({ totalSpent30Days }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message }); 
        }
    }
//=================================================================================================
    // Handler to get the total spent in the last 12 months
    async getSpentLast12Months(req: Request & { user?: JwtPayload }, res: Response) {
        try {
            // Extract the user ID from the request token payload
            const userId = req.user?.id; 
            if (!userId) {
                res.status(401).json({ error: "Sorry Unauthorized :(" }); 
                return;
            }

            const totalSpent12Months = await this.visService.getSpentLast12Months(userId); 
            res.status(200).json({ totalSpent12Months }); 
        } catch (error: any) {
            res.status(500).json({ error: error.message }); 
        }
    }
//=================================================================================================
//updates

async getIncomeBySource(req: Request & { user?: JwtPayload }, res: Response): Promise<void> {
    try {
        const userId = req.user?.id;
        if (!userId) {
             res.status(401).json({ error: "Sorry Unauthorized :(" });
             return;
        }

        const incomeSources = await this.visService.getIncomeBySource(userId);
        res.status(200).json({ incomeSources });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
}
}
export default VisController; 
