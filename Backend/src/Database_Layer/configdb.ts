import mongoose from 'mongoose';
//import dotenv from 'dotenv';

// Load environment variables
//dotenv.config();

// Get the database URL from environment variables
const dbURI: string = 'mongodb+srv://MRB:Radwa234@cluster0.83945.mongodb.net/financeTracker';

// Database connection function
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(dbURI);  
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;
