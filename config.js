// Import all env vars from .env file
require('dotenv').config();
export const MY_ENV_VAR = process.env.MY_ENV_VAR;
export const MY_VERSION = process.env.MY_VERSION;