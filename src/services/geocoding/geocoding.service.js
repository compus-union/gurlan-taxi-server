require("dotenv").config();
const { GEOCODING_URL } = require("../../configs/geocoding.config");
const axios = require("axios").default;

async function searchPlaceService(q) {
  try {
    const response = await axios.get(GEOCODING_URL + "/search", {
      params: { q: `${q} gurlan`, format: "json", addressdetails: 1 },
    });

    if (!response) {
      throw new Error("Couldn't get response in searchPlace service");
    }

    let results = [];

    const data = await response.data;

    data.forEach(async (item) => {
      if (
        item.address.town === "Gurlan" ||
        item.address.county === "Gurlan tumani"
      ) {
        results.push(item);
      }
    });

    return results;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { searchPlaceService };
