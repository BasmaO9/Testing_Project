import { Request, Response } from 'express';
import regService from '../services/Reg.services';

class regController {
static async register (req:Request,res:Response)
{
    const {name ,email,phone ,password, securityQuestion, securityAnswer}=req.body;
    try {
        console.log("here ");
        const user =await regService.registerUser(name ,email,phone,password, securityQuestion, securityAnswer);
        res.status(201).json({message:'User registered successfully!',user});
    }
    catch (error:any) {
        res.status(400).json({ error: error.message });
      }
}
}
export default regController ;