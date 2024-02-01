const {
  searchPlaceService,
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

module.exports = { searchPlace };
