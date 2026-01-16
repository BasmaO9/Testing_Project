import loginRouter from "./BusinessLogic_Layer/routes/login.routes";
import logoutRouter from "./BusinessLogic_Layer/routes/logout.routes";
import regRouter from "./BusinessLogic_Layer/routes/reg.routes";
import profileRouter from "./BusinessLogic_Layer/routes/profile.routes";
import RecommendationRouter from './BusinessLogic_Layer/routes/recommendation.routes';
import BudgetRouter from './BusinessLogic_Layer/routes/budget.routes';
import TransactionRouter from './BusinessLogic_Layer/routes/transaction.routes';
import cookieParser from 'cookie-parser';
import visRouter from './BusinessLogic_Layer/routes/vis.routes';
import CategoryRouter from './BusinessLogic_Layer/routes/category.routes';
import chatbot from './BusinessLogic_Layer/routes/chatbot.routes';
import securityRouter from './BusinessLogic_Layer/routes/security.routes';

import cors from 'cors'; 
let express = require('express');
let connectDB = require('./Database_Layer/configdb');
import swaggerUi from 'swagger-ui-express';
import authenticateToken from "./BusinessLogic_Layer/Middleware/AuthMiddleware";
import { Request, Response } from 'express';
import fs from 'fs';
import yaml from 'js-yaml';
import { NextFunction } from "express";

const app = express();
const PORT = 3000;

// Connect to the database
connectDB();

// Load YAML file
const swaggerDocument = yaml.load(fs.readFileSync('./src/swagger.yaml', 'utf8')) as object;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Replace with your frontend URL
  credentials: true, // Allow cookies
}));
app.use(cookieParser());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Test Route
app.get('/', (req: Request, res: Response) => {
  res.send('API is running...');
});

// Routes
app.use('/api/auth/login', loginRouter);
app.use('/api/auth/logout', logoutRouter);
app.use('/api/auth/profile', profileRouter);
app.use('/api/auth/reg', regRouter);
app.use('/api/auth', securityRouter);
app.use('/recommendation', RecommendationRouter);
app.use('/budgets', BudgetRouter);
app.use('/transactions', TransactionRouter);
app.use('/analytics', visRouter);
app.use('/category', CategoryRouter);
app.use('/gemini', chatbot);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}).on('error', (err: any) => {
  console.error('Failed to start the server:', err);
});

//cd Backend , npm i
// npm install @google/generative-ai 
// npm install multer                                                                  
// npm install --save-dev @types/multer     
// npm install tesseract.js