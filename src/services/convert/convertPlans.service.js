/**
 *
 * @param {"STANDARD" | "COMFORT" | "MICROVAN" | "DELIVERY"} plan
 */
async function convertPlansToAvgWords(plan) {
  if (plan === "STANDARD") {
    return "Standard";
  }

  if (plan === "COMFORT") {
    return "Comfort";
  }

  if (plan === "MICROVAN") {
    return "Microvan";
  }

  if (plan === "DELIVERY") {
    return "Yetkazib berish";
  }

  if (typeof plan !== "string") {
    return plan;
  }

  return plan;
}

module.exports = { convertPlansToAvgWords };
