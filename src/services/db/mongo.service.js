require("dotenv").config();
const mongoose = require("mongoose");

async function initMongoDB(url) {
  try {
    await mongoose.connect(url);

    return {
      message: `Connected to mongodb, ${new Date().toISOString()}`,
    };
  } catch (error) {
    console.log(error);
    console.log(error.message);
    return error;
  }
}

module.exports = { initMongoDB };
