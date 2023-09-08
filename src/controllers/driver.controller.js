require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { DRIVER_TOKEN } = require("../configs/token.config");
const { TELEGRAM_BOT_TOKEN } = require("../configs/other.config");
const { createId } = require("../utils/idGenerator.util");
const { createPassword } = require("../utils/password.util");
const { createToken } = require("../utils/jwt.util");

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

    return res.json({ status: "ok", token, driver: newDriver, car: newCar });
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

module.exports = { register, login, validate };
