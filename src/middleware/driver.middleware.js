const { PrismaClient, StatusDriver } = require("@prisma/client");
const prisma = new PrismaClient();
const { containsUppercase, checkPassword } = require("../utils/password.util");
const { verifyToken } = require("../utils/jwt.util");
const { DRIVER_TOKEN } = require("../configs/token.config");
const { driverResponseStatus } = require("../constants");

async function checkRegister(req, res, next) {
  try {
    // Add oneId length checker

    if (!req.body.driver) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Hamma qatorlarni to'ldiring",
        field: "driver",
      });
    }

    if (!req.body.car) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Hamma qatorlarni to'ldiring",
        field: "car",
      });
    }

    const { fullname, phone, password } = req.body.driver;
    const { name, color, number } = req.body.car;

    if (!fullname) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Ism familiya to'liq kiritilishi lozim.",
      });
    }

    if (!fullname.includes(" ")) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Ism familiyangizni probel (ochiq joy) bilan birga yozing.",
        example: "Sardor Aminov",
      });
    }

    if (fullname.length <= 3) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Ism familiya 3 ta belgidan uzunroq bo'lishi kerak. Bo'sh joy bilan birga",
      });
    }

    const validationCyrilic = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
    if (!validationCyrilic.test(fullname)) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Ism familiya lotin harflarida raqam va belgilarsiz kiritilishi lozim.",
      });
    }

    if (!phone) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Telefon raqam kiritilishi lozim.",
      });
    }

    if (typeof phone === "string") {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Telefon raqam array holatida saqlanishi kerak.",
      });
    }

    if (!phone.length) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Kamida bitta raqam kiritilishi lozim.",
      });
    }

    const phoneExists = await prisma.driver.count({
      where: { phone: { has: phone[0] } },
    });

    const bannedPhone = await prisma.banned.count({
      where: { phone: phone[0] },
    });

    console.log(bannedPhone, phoneExists);

    if (phoneExists) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Bu telefon raqam orqali tizimdan ro'yxatdan o'tish mumkin emas.",
        reason: "UNAVAILABLE",
      });
    }

    if (bannedPhone) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Bu telefon raqam orqali tizimdan ro'yxatdan o'tish mumkin emas.",
        reason: "BANNED",
      });
    }

    if (!password) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Parol kiritilishi lozim.",
      });
    }

    if (password.length < 8) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Parol kamida 8 ta belgidan iborat bo'lishi kerak.",
      });
    }

    const passwordUppercaseTest = await containsUppercase(password);

    if (!passwordUppercaseTest) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Parol kamida bitta katta harfdan iborat bo'lishi kerak.",
      });
    }

    if (validationCyrilic.test(password)) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Parol lotin harflarida kiritilishi lozim",
      });
    }

    if (!name) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Mashina nomi kiritilishi zarur",
        example: "Cobalt, Nexia 3",
      });
    }

    if (!color) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Mashina rangi kiritilishi zarur",
        example: "Qora, Qizil, Oq",
      });
    }

    if (!number) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Mashina raqami kiritilishi zarur",
        example: "90 999 AAA",
      });
    }

    const numberExists = await prisma.car.count({
      where: { number },
    });

    if (numberExists) {
      return {
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Bu raqamga ega avtomobil tizimda mavjud",
      };
    }

    return next();
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
}

async function checkLogin(req, res, next) {
  try {
    const { oneId, password } = req.body;

    // Add oneId length checker

    if (!oneId) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "oneId kiritilishi kerak",
      });
    }

    const driver = await prisma.driver.findUnique({
      where: { oneId },
      include: { approval: true, ban: true },
    });

    if (!driver) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Kiritilgan oneId bo'yicha haydovchi topilmadi.",
        oneId,
      });
    }

    const passwordMatch = await checkPassword(password, driver.password);

    if (!passwordMatch) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Noto'g'ri parol",
      });
    }

    if (driver.ban.banned) {
      return res.json({
        status: driverResponseStatus.AUTH.DRIVER_BANNED,
        msg: "Haydovchi ma'lumotlari tizimda bloklangan",
        reason: driver.ban.reason,
      });
    }

    if (driver.approval.approved !== "true") {
      return res.json({
        status: driverResponseStatus.AUTH.VALIDATION_FAILED,
        msg: "Haydovchi akkaunti hali tasdiqlanmagan yoki tasdiq bekor qilindi",
        reason: driver.approval.reason || "Sabab mavjud emas",
      });
    }
    
    return next();
  } catch (error) {
    return res.json(error);
  }
}

async function checkAvailability(req, res, next) {
  try {
    const { oneId } = req.params;

    const driver = await prisma.driver.count({
      where: { oneId },
    });

    if (!driver) {
      return res.json({
        status: driverResponseStatus.AUTH.DRIVER_NOT_FOUND,
        msg: "Haydovchi akkaunti topilmadi",
        id: oneId,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkRegistered(req, res, next) {
  try {
    const headers = req.headers["authorization"];

    if (!headers) {
      return res.json({
        status: driverResponseStatus.AUTH.HEADERS_NOT_FOUND,
        msg: "Sizda tizimdan foydalanishga ruxsat yo'q. (Headers are not found)",
      });
    }

    if (!headers.split(" ")[1]) {
      return res.json({
        status: driverResponseStatus.AUTH.DRIVER_TOKEN_NOT_FOUND,
        msg: "Sizda tizimdan foydalanishga ruxsat yo'q. (Token is not found)",
      });
    }

    const token = headers.split(" ")[1];

    const verifiedToken = await verifyToken(token, DRIVER_TOKEN);

    if (!verifiedToken) {
      return res.json({
        status: driverResponseStatus.AUTH.DRIVER_TOKEN_NOT_VALID,
        msg: "Sizda tizimdan foydalanishga ruxsat yo'q. (Token is not valid)",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkBan(req, res, next) {
  try {
    const { oneId } = req.params;

    const driver = await prisma.driver.findUnique({
      where: { oneId },
      include: { ban: true },
    });

    if (driver.ban.banned) {
      return res.json({
        status: driverResponseStatus.AUTH.DRIVER_BANNED,
        msg: "Sizning akkauntingiz tizimda bloklangan.",
        ban: driver.ban,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkSelfAccess(req, res, next) {
  try {
    const { oneId } = req.params;
    const token = req.headers["authorization"].split(" ")[1];

    const verifiedToken = await verifyToken(token, DRIVER_TOKEN);

    if (verifiedToken.oneId !== oneId) {
      return res.json({
        status: driverResponseStatus.AUTH.DRIVER_SELF_ACCESS_NOT_VALID,
        msg: "Sizda ruxsat yo'q (oneId is not same)",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkImages(req, res, next) {
  try {
    const { oneId, password } = req.params;

    if (!oneId) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "oneId kiritilishi lozim.",
      });
    }

    if (!password) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Password kiritilishi lozim.",
      });
    }

    const driver = await prisma.driver.findUnique({
      where: { oneId },
    });

    if (!driver) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Haydovchi topilmadi bu oneId boyicha.",
      });
    }

    const passwordMatch = await checkPassword(password, driver.password);

    if (!passwordMatch) {
      return res.json({
        status: driverResponseStatus.AUTH.AUTH_WARNING,
        msg: "Kiritilgan parol noto'g'ri",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  checkRegister,
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  checkLogin,
  checkImages,
};
