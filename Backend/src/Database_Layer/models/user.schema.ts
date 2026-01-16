import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for User model to ensure correct data types and properties at compile time
export interface IUser extends Document {
  name: string;  // User's name
  email: string; // User's email
  password: string; // User's hashed password
  phone: string; // User's phone number
  total_income: number; // User's total income 
  securityQuestion: string; // User's security question
  securityAnswerHash: string; // Hashed security answer

  // Method to compare plain password with hashed password in the database
  comparePassword(password: string): Promise<boolean>;
  // Method to compare security answer with hashed answer in the database
  compareSecurityAnswer(answer: string): Promise<boolean>;
}

// Define the schema for the User model
const userSchema = new mongoose.Schema({
  name: {
    type: String, // Name should be a string
    required: true, // Name is required
  },
  email: {
    type: String, // Email should be a string
    required: true, // Email is required
    unique: true, // Email must be unique
  },
  phone: {
    type: String, // Phone should be a string
    required: true, // Phone is required
  },
  created_date: {
    type: Date, // Created date should be a date
    default: Date.now, // Default value is the current date and time
  },
  password: {
    type: String, // Password should be a string
    required: true, // Password is required
  },
  total_income: {
    type: Number, // Total income should be a number
    required: false, // It's optional
  },
  securityQuestion: {
    type: String,
    required: true
  },
  securityAnswerHash: {
    type: String,
    required: true
  }
});

// Pre-save hook to hash the password and security answer before saving the user document
userSchema.pre('save', async function (next) {
  if (this.isModified('password')) { // Check if the password has been modified
    // Hash the password with bcrypt before saving
    this.password = await bcrypt.hash(this.password, 10);
  }
  if (this.isModified('securityAnswerHash')) {
    this.securityAnswerHash = await bcrypt.hash(this.securityAnswerHash, 10);
  }
  next(); // Proceed to save the user document
});

// Method to compare the entered password with the hashed password in the database
userSchema.methods.comparePassword = async function (password: string) {
  // Use bcrypt to compare the password
  return await bcrypt.compare(password, this.password);
};

// Method to compare the entered security answer with the hashed answer in the database
userSchema.methods.compareSecurityAnswer = async function (answer: string) {
  return await bcrypt.compare(answer, this.securityAnswerHash);
};

// Create the User model with the IUser interface and schema
const User = mongoose.model<IUser>('User', userSchema);

export default User;
