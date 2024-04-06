const { PrismaClient } = require("@prisma/client");
const { staticNames } = require("../../constants");
const { convertPlansToAvgWords } = require("../convert/convertPlans.service");

const prisma = new PrismaClient();

async function calculatePlanPrices(starterPrice) {
  try {
    const plans = await prisma.plan.findMany();
    let UzSum = new Intl.NumberFormat("uz-UZ", {
      style: "currency",
      currency: "UZS",
    });

    let plansPrices = [];

    plans.forEach(async (plan) => {
      let finalPrice = 0;
      finalPrice = finalPrice + starterPrice;
      if (plan.cutPrice) {
        finalPrice = finalPrice - +plan.cutPrice;
      }
      if (plan.extraPrice) {
        finalPrice = finalPrice + +plan.extraPrice;
      }

      const planName = await convertPlansToAvgWords(plan.name);

      plansPrices.push({
        name: planName,
        img: plan.img,
        id: plan.id,
        price: finalPrice,
        formattedPrice: UzSum.format(finalPrice),
      });
    });

    return plansPrices;
  } catch (error) {
    console.log(error);
    return error;
  }
}

async function calculateInitialPrice(km) {
  try {
    if (!km) throw new Error("No km provided");
    const kmInt = +km;

    if (kmInt < 0 || isNaN(kmInt) || !kmInt)
      throw new Error("Failed to convert string to number");

    // 0 dan 2 gacha
    if (kmInt > 0 && kmInt < 2.1) {
      const starterPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.STARTER },
      });

      const starterPriceInt = +starterPrice.amount;

      const planPrices = await calculatePlanPrices(starterPriceInt);

      return { planPrices };
    }

    // 2.1 dan 2.9 gacha
    if (kmInt > 2 && kmInt < 3) {
      const twoKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.TWOKM },
      });

      const twoKmPriceInt = +twoKmPrice.amount;
      const calculatedPrice = kmInt * twoKmPriceInt;

      const planPrices = await calculatePlanPrices(calculatedPrice);

      return { planPrices };
    }

    // 3 dan 3.9 gacha
    if (kmInt >= 3 && kmInt < 4) {
      const threeKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.THREEKM },
      });

      const threeKmPriceInt = +threeKmPrice.amount;
      const calculatedPrice = kmInt * threeKmPriceInt;

      const planPrices = await calculatePlanPrices(calculatedPrice);

      return { planPrices };
    }

    // 4 dan 4.9 gacha
    if (kmInt >= 4 && kmInt < 5) {
      const fourKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.FOURKM },
      });
      const fourKmPriceInt = +fourKmPrice.amount;
      const calculatedPrice = kmInt * fourKmPriceInt;

      const planPrices = await calculatePlanPrices(calculatedPrice);

      return { planPrices };
    }

    // 5 dan 5.9 gacha
    if (kmInt >= 5 && kmInt < 6) {
      const fiveKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.FIVEKM },
      });

      const fiveKmPriceInt = +fiveKmPrice.amount;
      const calculatedPrice = kmInt * fiveKmPriceInt;

      const planPrices = await calculatePlanPrices(calculatedPrice);

      return { planPrices };
    }

    // 6 dan 6.9 gacha
    if (kmInt >= 6 && kmInt < 7) {
      const sixKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.SIXKM },
      });

      const sixKmPriceInt = +sixKmPrice.amount;
      const calculatedPrice = kmInt * sixKmPriceInt;

      const planPrices = await calculatePlanPrices(calculatedPrice);

      return { planPrices };
    }

    // 7 dan 7.9 gacha
    if (kmInt >= 7 && kmInt < 8) {
      const sevenKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.SEVENKM },
      });

      const sevenKmPriceInt = +sevenKmPrice.amount;
      const calculatedPrice = kmInt * sevenKmPriceInt;

      const planPrices = await calculatePlanPrices(calculatedPrice);

      return { planPrices };
    }

    // 8 dan keyingi Out of Zone
    if (kmInt >= 8) {
      const outOfZonePrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.OUTOFZONE },
      });

      const outOfZonePriceInt = +outOfZonePrice.amount;
      const calculatedPrice = kmInt * outOfZonePriceInt;

      const planPrices = await calculatePlanPrices(calculatedPrice);

      return { planPrices };
    }
  } catch (error) {
    console.log(error);
    console.log("Error in calculatePrice.service", error.message);
    return { error, msg: error.message };
  }
}

module.exports = { calculateInitialPrice };
