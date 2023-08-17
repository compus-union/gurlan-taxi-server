const jwt = require("jsonwebtoken");

async function createToken(payload, keyword, options) {
  try {
    const token = jwt.sign(payload, keyword, { ...options });

    if (!token) {
      throw new Error("Couldn't create the token");
    }
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { createToken };
