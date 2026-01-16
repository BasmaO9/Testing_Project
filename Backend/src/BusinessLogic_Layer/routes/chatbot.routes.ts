import express from "express";
import ChatController from "../controllers/chatbot.controllers";
import GeminiService from "../services/chatbot.services";

const router = express.Router();

// Instantiate service and controller
const geminiService = new GeminiService();
const chatController = new ChatController(geminiService);

// POST: Handle chat interaction
router.post("/", (req, res) => chatController.chatWithAI(req, res));

// Optional GET route to help testers
router.get("/", (req, res) => {
  res.send("This is a POST API. Use Thunder Client or Postman to test it.");
});

export default router;
