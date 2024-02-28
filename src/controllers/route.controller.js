const { PrismaClient } = require("@prisma/client");
const RideModel = require("../mongodb/Ride");
const { createId } = require("../utils/idGenerator.util");

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
  } catch (error) {}
}
