require("dotenv").config();
const { GEOCODING_URL } = require("../../configs/geocoding.config");
const axios = require("axios").default;

async function searchPlaceService(q) {
  try {
    const response = await axios.get(
      GEOCODING_URL + `/search?q=${q} Gurlan&format=json&addressdetails=1&limit=40`
    );

    if (!response) {
      throw new Error("Couldn't get response in searchPlace service");
    }

    let results = [];

    const data = await response.data;

    data.forEach(async (item) => {
      if (
        item.address.town === "Gurlan" ||
        item.address.town === "Gurlen" ||
        item.address.town === "Gurlan" ||
        item.address.town === "gurlan" ||
        item.address.county === "Gurlan tumani" ||
        item.address.county === "Gurlan Tumani"
      ) {
        results.push(item);
      }
    });

    return results;
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { searchPlaceService };
