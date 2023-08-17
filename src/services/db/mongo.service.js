require("dotenv").config();
const mongoose = require("mongoose");

async function initMongoDB() {
  try {
    await mongoose.connect(process.env.MONGO_URL);

    console.log(`Connected to mongodb, ${Date.now().toLocaleString()}`);
  } catch (error) {
    console.log(error);
    console.log(error.message);
  }
}

module.exports = { initMongoDB };
