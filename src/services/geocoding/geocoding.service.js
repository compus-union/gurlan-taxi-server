require("dotenv").config();
const { GEOCODING_URL } = require("../../configs/geocoding.config");
const axios = require("axios").default;

async function searchPlaceService(q) {
  try {
    const response = await axios.get(GEOCODING_URL + "/search", {
      params: { q: `${q} Gurlan`, format: "json", addressdetails: 1 },
    });

    if (!response) {
      throw new Error("Couldn't get response in searchPlace service");
    }

    return response;
  } catch (error) {
    console.log(error);
  }
}

module.exports = { searchPlaceService };
