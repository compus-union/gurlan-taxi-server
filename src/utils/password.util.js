const { hash, compare } = require("bcrypt");

async function createPassword(plainText) {
  try {
    const hashedPass = await hash(plainText, 10);

    if (!hashedPass) {
      throw new Error("Couldn't hash the password");
    }

    return hashedPass;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function checkPassword(plainText, hash) {
  try {
    const result = await compare(plainText, hash);

    return result;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function containsUppercase(plainText) {
  const pattern = /[A-Z]/;

  return pattern.test(plainText);
}

module.exports = { createPassword, checkPassword, containsUppercase };
