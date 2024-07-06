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
        approval: {
          create: {
            admin: "",
            phone: phone[0],
            date: new Date(),
            reason: "",
            approved: "waiting",
            type: "DRIVER",
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
      include: { approval: true },
    });
    const newToken = await createToken({ ...driver }, DRIVER_TOKEN);

    if (driver.status === "LIMITED" && driver.approval.approved === "waiting") {
      return res.json({
        status: responseStatus.AUTH.VALIDATION_WAITING,
        msg: "Hali kutasiz :)",
        token: newToken,
        driver,
      });
    }

    if (driver.status === "IGNORED" && driver.approval.approved === "false") {
      return res.json({
        status: responseStatus.AUTH.VALIDATION_FAILED,
        msg: "Ma'lumotlaringiz tasdiqlanmadi",
        reason: driver.approval.reason,
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
      include: { approval: true },
    });

    if (!driver.loggedIn && !driver.approval.approved) {
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

    await prisma.driver.delete({
      where: { oneId },
      include: { approval: true, ban: true },
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

    await prisma.car.delete({ where: { driverId: driver.id } });

    const foundApproval = await prisma.approval.findFirst({
      where: { type: "DRIVER", phone: driver.phone[0] },
    });

    await prisma.approval.delete({
      where: { id: foundApproval.id },
    });

    await prisma.driver.delete({
      where: { oneId },
      include: { approval: true, ban: false },
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
    console.log('Get Profile');
    const { oneId } = req.params;
    const userExists = await prisma.driver.findUnique({ where: { oneId } });

    if (!userExists) {
      return res.json({
        status: responseStatus.AUTH.DRIVER_NOT_FOUND,
        msg: "Haydovchi topilmadi",
      });
    }

    return res.json({ profile: userExists, status: "ok" });
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
  getProfile
};
