const RideModel = require("../mongodb/Ride");
const { createId } = require("../utils/idGenerator.util");
const { responseStatus } = require("../constants");
const { getGeometryOfRoute } = require("../services/route/route.service");

async function calculateRoute(req, res) {
  try {
    const { destination, origin } = req.body;

    console.log(req.body);

    if (!destination) {
      return res.json({
        status: "bad",
        msg: "destination obyekti kiritilishi kerak",
      });
    }

    if (!origin) {
      return res.json({
        status: "bad",
        msg: "origin obyekti kiritilishi kerak",
      });
    }

    const result = await getGeometryOfRoute({ destination, origin }, true);

    if (!result) {
      return res.json({
        status: "bad",
        msg: "Marshrutni olishda muammo yuzaga keldi, boshqatdan urinib ko'ring",
      });
    }

    return res.json(result);
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function creatRoute(req, res) {
  try {
    const { ride } = req.body;
    const { client } = req.body;

    const rideOneId = await createId("ride");
    const newRide = await RideModel.create({
      oneId: rideOneId,
      clientId: client.oneId,
      ...ride,
    });

    await newRide.save();

    // socket will be written

    return {
      status: responseStatus.RIDE.RIDE_CREATED,
      msg: "Haydovchi qidirilmoqda",
    };
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = { calculateRoute, creatRoute };
