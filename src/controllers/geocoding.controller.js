const {
  searchPlaceService,
  geocodingService,
} = require("../services/geocoding/geocoding.service");

async function searchPlace(req, res) {
  try {
    const { place } = req.params;

    const response = await searchPlaceService(place);
    if (!response) {
      return res.json({
        status: "no-connection",
        msg: "Couldn't get data from OSM",
      });
    }

    if (!response.length) {
      return res.json({ status: "not-found", msg: "Joy topilmadi" });
    }

    return res.json({ status: "ok", data: response });
  } catch (error) {
    return res.json(error);
  }
}

async function geocoding(req, res) {
  try {
    const { lat, lng } = req.params;

    const response = await geocodingService({ lat, lng });

    if (!response) {
      return res.json({
        status: "no-connection",
        msg: "Couldn't get data from OSM",
      });
    }

    if (response.status !== "ok") {
      return res.json({
        status: "no-connection",
        msg: "No way in getting data from OSM",
      });
    }

    return res.json({ status: "ok", data: response.data });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = { searchPlace, geocoding };
