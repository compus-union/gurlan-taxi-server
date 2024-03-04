const { default: axios } = require("axios");
const URL = "http://router.project-osrm.org/route/v1/driving";
const { convertMetersToKm } = require("../convert/convertDistance.service");
const { secondsToHms } = require("../convert/converTime.service");
const { calculateInitialPrice } = require("../price/calculatePrice.service");

/**
 * @param {{origin: {lat: number, lng: number}, destination: {lat: number, lng: number}}} coords
 */
async function getGeometryOfRoute(coords) {
  try {
    const result = await axios.get(
      URL +
        `/${coords.origin.lng},${coords.origin.lat};${coords.destination.lng},${coords.destination.lat}?geometries=geojson&overview=full`
    );

    if (!result) {
      throw new Error("getRoute.service da aloqa mavjud emas");
    }

    if (result.data.code !== "Ok") {
      throw new Error("Marshrut topilmadi, boshqatdan urinib ko'ring");
    }

    const { kmFixed, kmFull } = await convertMetersToKm(
      result.data.routes[0].distance
    );
    const { full, hours, minutes, seconds } = await secondsToHms(
      result.data.routes[0].duration
    );
    const priceDetails = await calculateInitialPrice(kmFixed);

    const responseToClient = {
      status: "ok",
      routes: result.data.routes[0],
      price: { ...priceDetails, formatter: priceDetails.formatter },
      distance: { kmFixed, kmFull },
      duration: { full, hours, minutes, seconds },
    };

    return responseToClient;
  } catch (error) {
    console.log(error);
    return { msg: error.message, error };
  }
}

module.exports = { getGeometryOfRoute };
