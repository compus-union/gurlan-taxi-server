async function generateConfirmationCode(length) {
  let min = Math.pow(10, length - 1);
  let max = Math.pow(10, length) - 1;
  let result = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(result.toString());
  return result.toString()
}

async function generatePromocode(length) {
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let promoCode = '';
  for (let i = 0; i < length; i++) {
      promoCode += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return promoCode;
}

module.exports = { generateConfirmationCode, generatePromocode };
