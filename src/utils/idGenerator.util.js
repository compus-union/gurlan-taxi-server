const MIN = 1000000;
const MAX = 9999999;

/**
 * @param {"client" | "driver" | "admin"} field
 */

async function createId(field) {
  const randomNumbers = Math.floor(Math.random() * (MAX - MIN + 1)) + MIN;

  if (field === "client") {
    const letterCombinations = ["CA", "CB", "CD", "CE", "CF"];

    const randomIndex = Math.floor(Math.random() * letterCombinations.length);

    const randomCombination = letterCombinations[randomIndex];

    return randomCombination + randomNumbers;
  }

  if (field === "driver") {
    const letterCombinations = ["DA", "DB", "DD", "DE", "DF"];

    const randomIndex = Math.floor(Math.random() * letterCombinations.length);

    const randomCombination = letterCombinations[randomIndex];

    return randomCombination + randomNumbers;
  }

  if (field === "admin") {
    const letterCombinations = ["AA", "AB", "AD", "AE", "AF"];

    const randomIndex = Math.floor(Math.random() * letterCombinations.length);

    const randomCombination = letterCombinations[randomIndex];

    return randomCombination + randomNumbers;
  }
}

module.exports = { createId };
