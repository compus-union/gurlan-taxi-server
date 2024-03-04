const { PrismaClient } = require("@prisma/client");
const { staticNames } = require("../../constants");

const prisma = new PrismaClient();

async function calculateInitialPrice(km) {
  try {
    if (!km) throw new Error("No price provided");
    const kmInt = +km;

    if (kmInt < 0 || isNaN(kmInt) || !kmInt)
      throw new Error("Failed to convert string to number");

    // 0 dan 2 gacha
    if (kmInt > 0 && kmInt < 2.1) {
      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const starterPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.STARTER },
      });

      const starterPriceInt = +starterPrice.amount;
      const priceCurrencyFormat = UzSum.format(starterPriceInt);

      return {
        price: starterPriceInt,
        formatted: priceCurrencyFormat,
        async formatter(payload) {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }

    // 2.1 dan 2.9 gacha
    if (kmInt > 2 && kmInt < 3) {
      const twoKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.TWOKM },
      });

      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const twoKmPriceInt = +twoKmPrice.amount;
      const calculatedPrice = kmInt * twoKmPriceInt;
      const priceCurrencyFormat = UzSum.format(calculatedPrice);

      return {
        price: calculatedPrice,
        formatted: priceCurrencyFormat,
        async formatter(payload) {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }

    // 3 dan 3.9 gacha
    if (kmInt >= 3 && kmInt < 4) {
      const threeKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.THREEKM },
      });
      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const threeKmPriceInt = +threeKmPrice.amount;
      const calculatedPrice = kmInt * threeKmPriceInt;
      const priceCurrencyFormat = UzSum.format(calculatedPrice);

      return {
        price: calculatedPrice,
        formatted: priceCurrencyFormat,
        async formatter() {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }

    // 4 dan 4.9 gacha
    if (kmInt >= 4 && kmInt < 5) {
      const fourKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.FOURKM },
      });
      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const fourKmPriceInt = +fourKmPrice.amount;
      const calculatedPrice = kmInt * fourKmPriceInt;
      const priceCurrencyFormat = UzSum.format(calculatedPrice);

      return {
        price: calculatedPrice,
        formatted: priceCurrencyFormat,
        async formatter() {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }

    // 5 dan 5.9 gacha
    if (kmInt >= 5 && kmInt < 6) {
      const fiveKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.FIVEKM },
      });
      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const fiveKmPriceInt = +fiveKmPrice.amount;
      const calculatedPrice = kmInt * fiveKmPriceInt;
      const priceCurrencyFormat = UzSum.format(calculatedPrice);

      return {
        price: calculatedPrice,
        formatted: priceCurrencyFormat,
        async formatter() {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }

    // 6 dan 6.9 gacha
    if (kmInt >= 6 && kmInt < 7) {
      const sixKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.SIXKM },
      });
      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const sixKmPriceInt = +sixKmPrice.amount;
      const calculatedPrice = kmInt * sixKmPriceInt;
      const priceCurrencyFormat = UzSum.format(calculatedPrice);

      return {
        price: calculatedPrice,
        formatted: priceCurrencyFormat,
        async formatter() {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }

    // 7 dan 7.9 gacha
    if (kmInt >= 7 && kmInt < 8) {
      const sevenKmPrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.SEVENKM },
      });
      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const sevenKmPriceInt = +sevenKmPrice.amount;
      const calculatedPrice = kmInt * sevenKmPriceInt;
      const priceCurrencyFormat = UzSum.format(calculatedPrice);

      return {
        price: calculatedPrice,
        formatted: priceCurrencyFormat,
        async formatter() {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }

    // 8 dan keyingi Out of Zone
    if (kmInt >= 8) {
      const outOfZonePrice = await prisma.price.findUnique({
        where: { name: staticNames.PRICE_NAMES.OUTOFZONE },
      });
      let UzSum = new Intl.NumberFormat("uz-UZ", {
        style: "currency",
        currency: "UZS",
      });

      const outOfZonePriceInt = +outOfZonePrice.amount;
      const calculatedPrice = kmInt * outOfZonePriceInt;
      const priceCurrencyFormat = UzSum.format(calculatedPrice);

      return {
        price: calculatedPrice,
        formatted: priceCurrencyFormat,
        async formatter() {
          let formatter = new Intl.NumberFormat("uz-UZ", {
            style: "currency",
            currency: "UZS",
          });

          return formatter.format(payload);
        },
      };
    }
  } catch (error) {
    console.log("Error in calculatePrice.service", error.message);
    return { error, msg: error.message };
  }
}

module.exports = { calculateInitialPrice };
