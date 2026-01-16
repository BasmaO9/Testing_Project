import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Fetch environment variables and assign default values if not provided
export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION ;
export const COOKIE_NAME = process.env.COOKIE_NAME ;
export const NODE_ENV = process.env.NODE_ENV ;
export const geminiApiKey = process.env.GEMINI_API_KEY || "";
export const PORT = process.env.PORT || 5000;

// Validate all required environment variables

// Validate JWT_SECRET: must be defined for authentication to work
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not set in .env");
}

// Validate JWT_EXPIRATION: ensure it's set to a valid format, fallback is '1h'
if (!process.env.JWT_EXPIRATION) {
  console.warn("JWT_EXPIRATION is not set. Using default value '1h'.");
}

// Validate COOKIE_NAME: should be defined for cookie handling
if (!process.env.COOKIE_NAME) {
  console.warn("COOKIE_NAME is not set. Using default value 'authToken'.");
}

// Validate NODE_ENV: should be set to development, production, or another valid environment
if (!process.env.NODE_ENV) {
  console.warn("NODE_ENV is not set. Using default value 'development'.");
}


// import * as dotenv from "dotenv";

// // Load environment variables from .env file
// dotenv.config();

// // Structured configuration object
// export const config = {
//   port: process.env.PORT || 5000,
//   geminiApiKey: process.env.GEMINI_API_KEY || "",
//   jwtSecret: process.env.JWT_SECRET as string,
//   jwtExpiration: process.env.JWT_EXPIRATION || "1h",
//   cookieName: process.env.COOKIE_NAME || "authToken",
//   nodeEnv: process.env.NODE_ENV || "development",
// };

// // Validate required environment variables
// if (!config.jwtSecret) {
//   throw new Error("JWT_SECRET is not set in .env");
// }

// if (!process.env.JWT_EXPIRATION) {
//   console.warn("JWT_EXPIRATION is not set. Using default value '1h'.");
// }

// if (!process.env.COOKIE_NAME) {
//   console.warn("COOKIE_NAME is not set. Using default value 'authToken'.");
// }

// if (!process.env.NODE_ENV) {
//   console.warn("NODE_ENV is not set. Using default value 'development'.");
// }

// if (!config.geminiApiKey) {
//   console.warn("GEMINI_API_KEY is not set. Gemini services will not function correctly.");
// }
