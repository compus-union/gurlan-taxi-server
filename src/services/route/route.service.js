const { default: axios } = require("axios");
const URL = "http://router.project-osrm.org/route/v1/driving";
const { convertMetersToKm } = require("../convert/convertDistance.service");
const { secondsToHms } = require("../convert/converTime.service");

/**
 * @param {{origin: {lat: number, lng: number}, destination: {lat: number, lng: number}}} coords
 */
async function getGeometryOfRoute(coords) {
  try {
    const result = await axios.get(
      URL +
        `/${coords.origin.lng},${coords.origin.lat};${coords.destination.lng},${coords.destination.lat}`
    );

    if (!result) {
      throw new Error("getRoute.service da aloqa mavjud emas");
    }

    if (result.data.status !== "Ok") {
      throw new Error("Marshrut topilmadi, boshqatdan urinib ko'ring");
    }

    const { kmFixed } = await convertMetersToKm(result.data.routes[0].distance);
    const { full } = await secondsToHms(result.data.routes[0].duration);

    const responseToClient = {
      status: "ok",
      routes: result.data.routes[0],
    };

    return {
      status: "ok",
      routes: result.data.routes[0],
    };
  } catch (error) {
    console.log(error);
    return error;
  }
}

module.exports = { getGeometryOfRoute };
