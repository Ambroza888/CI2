// Import all env vars from .env file
require('dotenv').config()
export const VESO_ENV = process.env.VESO_ENV
console.log(VESO_ENV) // => Hello