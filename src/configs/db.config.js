require("dotenv").config()
module.exports = {
  MONGO_URL: process.env.MONGO_URL,
  PSQL_URL: process.env.PSQL_URL,
};