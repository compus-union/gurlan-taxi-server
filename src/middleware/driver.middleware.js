const { PrismaClient, StatusDriver } = require("@prisma/client");
const prisma = new PrismaClient();
const { containsUppercase } = require("../utils/password.util");
const { verifyToken } = require("../utils/jwt.util");
const { DRIVER_TOKEN } = require("../configs/token.config");

async function checkRegister(req, res, next) {
  try {
    if (!req.body.driver) {
      return res.json({
        status: "bad",
        msg: "Hamma qatorlarni to'ldiring",
        field: "driver",
      });
    }

    if (!req.body.car) {
      return res.json({
        status: "bad",
        msg: "Hamma qatorlarni to'ldiring",
        field: "car",
      });
    }

    const { fullname, phone, password } = req.body.driver;
    const { name, color, number } = req.body.car;

    if (!fullname) {
      return res.json({
        status: "bad",
        msg: "Ism familiya to'liq kiritilishi lozim.",
      });
    }

    if (!fullname.includes(" ")) {
      return res.json({
        status: "bad",
        msg: "Ism familiyangizni probel (ochiq joy) bilan birga yozing.",
        example: "Sardor Aminov",
      });
    }

    if (fullname.length <= 3) {
      return res.json({
        status: "bad",
        msg: "Ism familiya 3 ta belgidan uzunroq bo'lishi kerak. Bo'sh joy bilan birga",
      });
    }

    const validationCyrilic = /^[a-zA-Z]+(\s[a-zA-Z]+)*$/;
    if (!validationCyrilic.test(fullname)) {
      return res.json({
        status: "bad",
        msg: "Ism familiya lotin harflarida raqam va belgilarsiz kiritilishi lozim.",
      });
    }

    if (!phone) {
      return res.json({
        status: "bad",
        msg: "Telefon raqam kiritilishi lozim.",
      });
    }

    if (typeof phone === "string") {
      return res.json({
        status: "bad",
        msg: "Telefon raqam array holatida saqlanishi kerak.",
      });
    }

    if (!phone.length) {
      return res.json({
        status: "bad",
        msg: "Kamida bitta raqam kiritilishi lozim.",
      });
    }

    if (!password) {
      return res.json({
        status: "bad",
        msg: "Parol kiritilishi lozim.",
      });
    }

    if (password.length < 8) {
      return res.json({
        status: "bad",
        msg: "Parol kamida 8 ta belgidan iborat bo'lishi kerak.",
      });
    }

    const passwordUppercaseTest = await containsUppercase(password);

    if (!passwordUppercaseTest) {
      return res.json({
        status: "bad",
        msg: "Parol kamida bitta katta harfdan iborat bo'lishi kerak.",
      });
    }

    if (validationCyrilic.test(password)) {
      return res.json({
        status: "bad",
        msg: "Parol lotin harflarida kiritilishi lozim",
      });
    }

    if (!name) {
      return res.json({
        status: "bad",
        msg: "Mashina nomi kiritilishi zarur",
        example: "Cobalt, Nexia 3",
      });
    }

    if (!color) {
      return res.json({
        status: "bad",
        msg: "Mashina rangi kiritilishi zarur",
        example: "Qora, Qizil, Oq",
      });
    }

    if (!number) {
      return res.json({
        status: "bad",
        msg: "Mashina raqami kiritilishi zarur",
        example: "90 999 AAA",
      });
    }

    return next();
  } catch (error) {
    console.log(error);
    return res.json(error);
  }
}

async function checkLogin(req, res, next) {
  try {
    const { oneId } = req.body;
    if (!oneId) {
      return res.json({
        status: "bad",
        msg: "oneId kiritilishi kerak",
      });
    }

    const driver = await prisma.driver.findUnique({ where: { oneId } });

    if (!driver) {
      return res.json({
        status: "bad",
        msg: "Kiritilgan oneId bo'yicha haydovchi topilmadi.",
        oneId,
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

    const driver = await prisma.driver.findUnique({
      where: { oneId },
    });

    if (!driver) {
      return res.json({
        status: "forbidden",
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
    const token = req.headers["authorization"].split(" ")[1];

    if (!token) {
      return res.json({
        status: "forbidden",
        msg: "Sizda tizimdan foydalanishga ruxsat yo'q. (Token is not found)",
      });
    }

    const verifiedToken = await verifyToken(token, DRIVER_TOKEN);

    if (!verifiedToken) {
      return res.json({
        status: "forbidden",
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
    });

    if (driver.ban && driver.ban.banned) {
      return res.json({
        status: "forbidden",
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
        status: "forbidden",
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
    const { oneId, password } = req.body;

    if (!oneId) {
      return res.json({ status: "bad", msg: "oneId kiritilishi lozim." });
    }

    if (!password) {
      return res.json({ status: "bad", msg: "Password kiritilishi lozim." });
    }

    const driver = await prisma.driver.findUnique({
      where: { oneId },
    });

    if (!driver) {
      return res.json({
        status: "bad",
        msg: "Haydovchi topilmadi bu oneId boyicha.",
      });
    }

    if (!req.files) {
      return res.json({ status: "bad", msg: "Rasmlar topilmadi." });
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
