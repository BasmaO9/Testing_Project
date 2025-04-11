import { Router } from "express";
import VisController from "../controllers/vis.controller"; 
import { VisService } from "../services/vis.service";
import authenticateToken from "../Middleware/AuthMiddleware";

//=================================================================================================
// Createing instance from the service and inject it in the controller
const router = Router();
const visService = new VisService();
const visController = new VisController(visService);
//=================================================================================================

// Protect the routes with the authenticateToken
router.get('/total-income', authenticateToken, (req, res) => visController.getTotalIncome(req, res));
//=================================================================================================
router.get('/total-expenses', authenticateToken, (req, res) => visController.getTotalExpenses(req, res));
//=================================================================================================
router.get('/balance', authenticateToken, (req, res) => visController.getBalance(req, res));
//=================================================================================================
router.get('/min-expense', authenticateToken, (req, res) => visController.getMinExpense(req, res));
//=================================================================================================
router.get('/max-expense', authenticateToken, (req, res) => visController.getMaxExpense(req, res));
//=================================================================================================
router.get('/all-spent', authenticateToken, (req, res) => visController.getTotalSpentMoney(req, res));
//=================================================================================================
router.get('/spent-in-last-30-days', authenticateToken, (req, res) => visController.getSpentLast30Days(req, res));
//=================================================================================================
router.get('/spent-in-last-12-months', authenticateToken, (req, res) => visController.getSpentLast12Months(req, res));
//=================================================================================================
//updates
router.get('/income-by-source', authenticateToken, (req, res) => visController.getIncomeBySource(req, res));

export default router;

