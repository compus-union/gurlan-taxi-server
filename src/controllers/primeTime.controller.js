require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { ADMIN_TOKEN } = require("../configs/token.config");
const { createId } = require("../utils/idGenerator.util");
const { mainEvent } = require("../events");

const prisma = new PrismaClient();

async function createPrimeTime(req, res) {
  try {
    const {
      startTime,
      finishTime,
      startTimeFull,
      finishTimeFull,
      excWeekDays,
      excMonth,
      name,
    } = req.body;

    const newId = await createId("time");

    const newTime = await prisma.primeTime.create({
      data: {
        startTimeFull,
        startTime,
        finishTime,
        excMonth,
        excWeekDays,
        finishTimeFull,
        name,
        oneId: newId,
      },
    });

    mainEvent.emit("primeTimeInit", { ...newTime });

    return res.json({
      status: "ok",
      time: newTime,
      msg: "Yangi Prime Time ishga tushirildi.",
      name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

module.exports = { createPrimeTime };
