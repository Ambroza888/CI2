// Import all env vars from .env file
require('dotenv').config()
export const VESO = process.env.VESO
console.log(VESO) // => Hello