import { Request, Response } from 'express';
import User from '../../Database_Layer/models/user.schema';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config/dotenvConfig';

class SecurityController {
  // Get the security question for the logged-in user
  static async getSecurityQuestion(req: Request, res: Response) {
    try {
      const token = req.cookies[process.env.COOKIE_NAME as string];
      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const decoded = jwt.verify(token, JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({ question: user.securityQuestion });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  // Verify the security answer
  static async verifySecurityAnswer(req: Request, res: Response) {
    try {
      const { answer } = req.body;
      const token = req.cookies[process.env.COOKIE_NAME as string];

      if (!token) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const decoded = jwt.verify(token, JWT_SECRET as string) as { id: string };
      const user = await User.findById(decoded.id);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const isAnswerCorrect = await user.compareSecurityAnswer(answer);
      if (!isAnswerCorrect) {
        return res.status(400).json({ error: 'Incorrect security answer' });
      }

      // Generate a new token for full authentication
      const newToken = jwt.sign({ id: user._id, verified: true }, JWT_SECRET as string, {
        expiresIn: '1h',
      });

      // Update the cookie with the new token
      res.cookie(process.env.COOKIE_NAME as string, newToken, {
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 3600000,
      });

      res.json({ verified: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default SecurityController; 