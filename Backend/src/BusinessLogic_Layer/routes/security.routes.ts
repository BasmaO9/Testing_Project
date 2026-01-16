import express from 'express';
import SecurityController from '../controllers/security.controller';
import authenticateToken from '../Middleware/AuthMiddleware';

const router = express.Router();

// Get security question
router.get('/security-question', authenticateToken, (req, res) => {
  SecurityController.getSecurityQuestion(req, res);
});

// Verify security answer
router.post('/verify-security-question', authenticateToken, (req, res) => {
  SecurityController.verifySecurityAnswer(req, res);
});

export default router; 