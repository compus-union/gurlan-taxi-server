const { PrismaClient } = require("@prisma/client");
const RideModel = require("../mongodb/Ride");
const { createId } = require("../utils/idGenerator.util");
const {responseStatus} = require("../constants")

const prisma = new PrismaClient();

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

    return {status: responseStatus.RIDE.RIDE_CREATED, msg: "Haydovchi qidirilmoqda"}
  } catch (error) {
    console.log(error);
    return res.status(500).json(error)
  }
}
