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
    const { coords } = req.body;

    const response = await geocodingService(coords);

    if (!response) {
      return res.json({
        status: "no-connection",
        msg: "Couldn't get data from OSM",
      });
    }

    return res.json({ status: "ok", data: response });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = { searchPlace, geocoding };
