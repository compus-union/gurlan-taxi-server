require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { DRIVER_TOKEN } = require("../configs/token.config");
const { TELEGRAM_BOT_TOKEN } = require("../configs/other.config");
const { createId } = require("../utils/idGenerator.util");
const { createPassword } = require("../utils/password.util");
const { createToken } = require("../utils/jwt.util");
const { sendPictures } = require("../services/telegram");
const { upload } = require("../uploads");
const { promises } = require("fs");
const { checkPassword } = require("../utils/password.util");
const moment = require("moment");

const prisma = new PrismaClient();

async function register(req, res) {
  try {
    const { fullname, phone, password } = req.body.driver;
    const { name, color, number } = req.body.car;

    const newDriverId = await createId("driver");
    const newCarId = await createId("car");

    const hashedPass = await createPassword(password);

    const newDriver = await prisma.driver.create({
      data: {
        oneId: newDriverId,
        fullname,
        password: hashedPass,
        phone,
        ban: { banned: false, admin: "", reason: "" },
        approval: { approved: false, admin: "", date: "" },
        car: {
          create: {
            oneId: newCarId,
            name,
            color,
            number,
          },
        },
      },
    });

    const newCar = await prisma.car.findUnique({ where: { oneId: newCarId } });

    const token = await createToken({ ...newDriver }, DRIVER_TOKEN);

    return res.json({ status: "ok", token, driver: newDriver, car: newCar, msg: "Ro'yxatdan o'tish bajarildi." });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function login(req, res) {
  try {
    const { oneId } = req.body;

    const driver = await prisma.driver.findUnique({ where: { oneId } });

    const token = await createToken({ ...driver }, DRIVER_TOKEN);

    return res.json({ status: "ok", driver, token });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function validate(req, res) {
  try {
    const { driverId, adminId } = req.body;

    const updateDriver = await prisma.driver.update({
      where: { oneId: driverId },
      data: {
        license: "VALID",
        registration: "VALID",
        status: "APPROVED",
        approval: { approved: true, admin: adminId },
      },
    });

    return res.json({ status: "ok", driver: updateDriver });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function invalidate(req, res) {
  try {
    const { driverId, adminId } = req.body;

    const updateDriver = await prisma.driver.update({
      where: { oneId: driverId },
      data: {
        license: "INVALID",
        registration: "INVALID",
        status: "BANNED",
        approval: { approved: false, admin: adminId },
        deleted: true,
      },
    });

    return res.json({ status: "ok", driver: updateDriver });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function sendImages(req, res) {
  try {
    const { oneId, password } = req.params

    const driver = await prisma.driver.findUnique({
      where: { oneId },
      include: { car: true },
    });

    const files = await promises.readdir("./src/uploads"); 

    const filteredFiles = files.filter((item) => {
      return item.includes("haydovchi");
    });

    const result = await sendPictures(filteredFiles, {
      oneId,
      fullname: driver.fullname,
      phone: driver.phone,
      password,
      carName: driver.car.name,
      carColor: driver.car.color,
      carNumber: driver.car.number,
      date: moment().format(),
    });

    console.log(result);

    return res.json({ status: "ok", msg: "Rasmlar jo'natildi", filteredFiles, result  });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function checkIfExists(req, res) {
  try {
    const { oneId } = req.params;

    const driver = await prisma.driver.findUnique({ where: { oneId } });
    const car = await prisma.car.findUnique({ where: { driverId: driver.id } });

    const newToken = await createToken({ ...driver }, DRIVER_TOKEN);

    return res.json({
      status: "ok",
      msg: "Akkaunt topildi",
      token: newToken,
      driver,
      car,
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkIfValidated(req, res) {
  try {
    const { oneId } = req.params;

    const driver = await prisma.driver.findUnique({ where: { oneId } });

    if (!driver.approval || !driver.approval.approved) {
      console.log("comeon");
      return res.json({ status: "bad", msg: "Hali kutasiz :)" });
    }

    const newToken = await createToken({ ...driver }, DRIVER_TOKEN);
    const car = await prisma.car.findUnique({ where: { driverId: driver.id } });

    return res.json({
      car,
      driver,
      token: newToken,
      msg: "Sizning ma'lumotlaringiz tasdiqlandi",
      status: "ok",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}
module.exports = {
  register,
  login,
  validate,
  invalidate,
  sendImages,
  checkIfExists,
  checkIfValidated,
};
