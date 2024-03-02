async function convertMetersToKm(meters) {
  const km = meters / 1000;
  const kmFixed = km.toFixed(1);
  const kmFull = kmFixed + " km";

  async function fixKm(km) {
    return { km: km.toFixed(1) + " km" };
  }

  return {
    km,
    kmFixed,
    kmFull,
    fixKm,
  };
}

module.exports = { convertMetersToKm };
