/**
 * @param {Number[]} rating
 */
async function convertRatingIntoAverage(rating) {
  if (!rating.length) return 0;
  
  const sum = rating.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  const average = Math.floor(sum / rating.length);

  return average;
}

module.exports = { convertRatingIntoAverage };
