// Import all env vars from .env file
require('dotenv').config();
export const MY_PROD = process.env.MY_PROD;
export const MY_VERSION = process.env.MY_VERSION;