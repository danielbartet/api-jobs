require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "user",
  DB_PASSWORD: process.env.DB_PASSWORD || "password",
  DB_NAME: process.env.DB_NAME || "leadsdb",
  DB_PORT: process.env.DB_PORT || 3306,
  corsOrigins: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['https://jobsandjobs.com', 'https://www.jobsandjobs.com'],
};