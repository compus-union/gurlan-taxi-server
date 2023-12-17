async function generateConfirmationCode(length) {
  let min = Math.pow(10, length - 1);
  let max = Math.pow(10, length) - 1;
  let result = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(result.toString());
  return result.toString()
}

module.exports = { generateConfirmationCode };
