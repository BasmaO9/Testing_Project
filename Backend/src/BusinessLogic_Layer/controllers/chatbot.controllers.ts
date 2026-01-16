import { Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import GeminiService from "../services/chatbot.services";

class ChatController {
  constructor(private geminiService: GeminiService) {}

  async chatWithAI(req: Request & { user?: JwtPayload }, res: Response): Promise<void> {
    try {
      const { message } = req.body;

      if (!message) {
        res.status(400).json({ error: "Message is required" });
        return;
      }

      const aiResponse = await this.geminiService.generateAIResponse(message);
      res.status(200).json({ response: aiResponse });
    } catch (error: any) {
      console.error("ChatWithAI Error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
}

export default ChatController;
