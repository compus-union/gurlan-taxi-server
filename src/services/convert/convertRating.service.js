/**
 * @param {Number[]} rating
 */
async function convertRatingIntoAverage(rating) {
  const sum = rating.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );

  const average = Math.floor(sum / rating.length);

  return average;
}

module.exports = { convertRatingIntoAverage };
