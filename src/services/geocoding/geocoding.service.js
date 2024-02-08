require("dotenv").config();
const { GEOCODING_URL } = require("../../configs/geocoding.config");
const axios = require("axios").default;

async function searchPlaceService(q) {
  try {
    const response = await axios.get(
      GEOCODING_URL +
        `/search?q=${q} Gurlan&format=json&addressdetails=1&limit=40`
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
    return error;
  }
}

async function geocodingService(coords) {
  try {
    const response = await axios.get(
      GEOCODING_URL +
        `/reverse?format=json&addressdetails=1&lat=${coords.lat}&lon=${coords.lng}`
    );

    if (!response) {
      throw new Error("Couldn't get response in geocoding service");
    }

    if (!response.data.display_name) {
      throw new Error("Ma'lumotlarni olib kelishda muammo yuzaga keldi");
    }

    const { lat, lon, name, display_name, address, place_id } = response.data;

    const finalResult = {
      lat: +lat,
      lng: +lon,
      name,
      displayName: display_name,
      road: address.road,
      houseNumber: address.house_number,
      placeId: place_id,
    };

    return { status: "ok", data: finalResult };
  } catch (error) {
    console.log(error.message);
    return error;
  }
}

module.exports = { searchPlaceService, geocodingService };
