require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { DRIVER_TOKEN } = require("../configs/token.config");
const { createId } = require("../utils/idGenerator.util");
const { createPassword } = require("../utils/password.util");
const { createToken } = require("../utils/jwt.util");
const { sendPictures } = require("../services/telegram");
const { promises } = require("fs");
const moment = require("moment");
const path = require("path");
const { responseStatus } = require("../constants");
const {
  convertRatingIntoAverage,
} = require("../services/convert/convertRating.service");

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
        status: "LIMITED",
        car: {
          create: {
            oneId: newCarId,
            name,
            color,
            number,
          },
        },
        ban: {
          create: {
            admin: "",
            phone: phone[0],
            date: new Date(),
            reason: "",
            type: "DRIVER",
            banned: false,
          },
        },
      },
    });

    const newCar = await prisma.car.findUnique({ where: { oneId: newCarId } });

    const token = await createToken({ ...newDriver }, DRIVER_TOKEN);

    return res.json({
      status: responseStatus.AUTH.DRIVER_REGISTRATION_DONE,
      token,
      driver: newDriver,
      car: newCar,
      msg: "Ro'yxatdan o'tish bajarildi.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function login(req, res) {
  try {
    const { oneId } = req.body;

    const driver = await prisma.driver.findUnique({ where: { oneId } });

    if (!driver) {
      return res.json({
        status: responseStatus.AUTH.DRIVER_NOT_FOUND,
        msg: "Bu oneId bo'yicha haydovchi topilmadi",
      });
    }

    const updateDriver = await prisma.driver.update({
      where: { oneId },
      data: { loggedIn: true },
    });

    const token = await createToken({ ...updateDriver }, DRIVER_TOKEN);

    return res.json({
      status: responseStatus.AUTH.DRIVER_LOGIN_DONE,
      driver,
      token,
      msg: "Tizimga muvafaqqiyatli kirildi.",
    });
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function sendImages(req, res) {
  try {
    const { oneId, password } = req.params;

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

    if (!result) {
      return res.json({
        status: responseStatus.AUTH.IMAGES_SENT_FAILED,
        msg: "Rasmlar yuborilmadi.",
      });
    }

    filteredFiles.forEach(async (item) => {
      await promises.unlink(path.join(__dirname, "../uploads/" + item));
    });

    return res.json({
      status: responseStatus.AUTH.IMAGES_SENT,
      msg: "Rasmlar jo'natildi",
      filteredFiles,
      result,
    });
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
      status: responseStatus.AUTH.DRIVER_EXISTS,
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

    const driver = await prisma.driver.findUnique({
      where: { oneId },
    });
    const newToken = await createToken({ ...driver }, DRIVER_TOKEN);

    if (driver.status === "LIMITED") {
      return res.json({
        status: responseStatus.AUTH.VALIDATION_WAITING,
        msg: "Hali kutasiz :)",
        token: newToken,
        driver,
      });
    }

    if (driver.status === "IGNORED") {
      return res.json({
        status: responseStatus.AUTH.VALIDATION_FAILED,
        msg: "Ma'lumotlaringiz tasdiqlanmadi",
        reason: "Sabab mavjud emas",
      });
    }

    const car = await prisma.car.findUnique({ where: { driverId: driver.id } });

    return res.json({
      car,
      driver,
      token: newToken,
      msg: "Sizning ma'lumotlaringiz tasdiqlandi",
      status: responseStatus.AUTH.VALIDATION_DONE,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function checkIfLoggedIn(req, res) {
  try {
    const { oneId } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { oneId },
    });

    if (!driver.loggedIn) {
      return res.json({
        status: responseStatus.AUTH.DRIVER_LOGIN_FAILED,
        msg: "Haydovchi tizimga kirmagan",
      });
    }

    const newToken = await createToken({ ...driver }, DRIVER_TOKEN);

    return res.json({
      status: responseStatus.AUTH.DRIVER_LOGIN_DONE,
      msg: "Tizimga kirilgan",
      token: newToken,
      driver,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function deleteSelf(req, res) {
  try {
    const { oneId } = req.params;
    // send to telegram and delete
    await prisma.driver.delete({
      where: { oneId },
      include: { ban: true, earnings: true, car: true, rides: true },
    });

    return res.json({
      status: responseStatus.AUTH.SELF_DELETION_DONE,
      msg: "Sizni ma'lumotlaringiz o'chirildi.",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}
/**
 *
 * @param {Request} req
 * @param {Response} res
 */
async function restart(req, res) {
  try {
    const { oneId } = req.params;

    const driver = await prisma.driver.findUnique({ where: { oneId } });

    await prisma.driver.delete({
      where: { oneId },
      include: { ban: false, car: true, earnings: true, rides: true },
    });

    return res.json({
      status: responseStatus.AUTH.DRIVER_RESTART_DONE,
      msg: "Boshqatdan ro'yxatdan o'tishingiz mumkin",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function getStatus(req, res) {
  try {
    const { oneId } = req.params;
    const userExists = await prisma.driver.findUnique({ where: { oneId } });

    if (!userExists) {
      return res.json({
        status: responseStatus.AUTH.DRIVER_NOT_FOUND,
        msg: "Haydovchi topilmadi",
      });
    }

    return res.json({ result: userExists.status, status: "ok" });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function getProfile(req, res) {
  try {
    console.log("Get Profile");
    const { oneId } = req.params;
    const userExists = await prisma.driver.findUnique({
      where: { oneId },
      include: { ban: true, car: true, rides: true },
    });

    if (!userExists) {
      return res.json({
        status: responseStatus.AUTH.DRIVER_NOT_FOUND,
        msg: "Haydovchi topilmadi",
      });
    }

    const convertedRating = await convertRatingIntoAverage(userExists.rating);

    return res.json({
      profile: { ...userExists, rating: convertedRating },
      status: "ok",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}
module.exports = {
  register,
  login,
  sendImages,
  checkIfExists,
  checkIfValidated,
  restart,
  deleteSelf,
  checkIfLoggedIn,
  getStatus,
  getProfile,
};
