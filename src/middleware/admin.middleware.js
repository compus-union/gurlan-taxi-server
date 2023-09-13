const { PrismaClient, AdminType } = require("@prisma/client");
const prisma = new PrismaClient();
const { verifyToken } = require("../utils/jwt.util");
const { ADMIN_TOKEN } = require("../configs/token.config");

async function checkAvailability(req, res, next) {
  try {
    const { adminId } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { oneId: adminId },
    });

    if (!admin) {
      return res.json({
        status: "forbidden",
        msg: "Admin akkaunti topilmadi",
        id: adminId,
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

    const verifiedToken = await verifyToken(token, ADMIN_TOKEN);

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
    const { adminId } = req.body;

    const admin = await prisma.admin.findUnique({
      where: { oneId: adminId },
    });

    if (admin.ban && admin.ban.banned) {
      return res.json({
        status: "forbidden",
        msg: "Sizning akkauntingiz tizimda bloklangan.",
        ban: admin.ban,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkSelfAccess(req, res, next) {
  try {
    const { adminId } = req.body;
    const token = req.headers["authorization"].split(" ")[1];

    const verifiedToken = await verifyToken(token, ADMIN_TOKEN);

    if (verifiedToken.oneId !== adminId) {
      return res.json({
        status: "forbidden",
        msg: "Sizda ruxsat yo'q (oneId is not same)",
        ids: `${adminId}, ${verifiedToken.oneId}`,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkAdmin(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];

    const verifiedToken = await verifyToken(token, ADMIN_TOKEN);

    if (
      verifiedToken.type !== AdminType.ADMIN ||
      verifiedToken.type !== AdminType.SUPERADMIN
    ) {
      return res.json({
        status: "forbidden",
        msg: "Sizda ruxsat yo'q (not admin)",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkSuperAdmin(req, res, next) {
  try {
    const token = req.headers["authorization"].split(" ")[1];

    const verifiedToken = await verifyToken(token, ADMIN_TOKEN);

    if (verifiedToken.type !== AdminType.SUPERADMIN) {
      return res.json({
        status: "forbidden",
        msg: "Sizda ruxsat yo'q (not super-admin)",
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

async function checkValidationDriver(req, res, next) {
  try {
    const { driverId, adminId } = req.body;

    if (!driverId) {
      return res.json({
        status: "bad",
        msg: "driverId kiritilishi lozim.",
      });
    }

    if (!adminId) {
      return res.json({
        status: "bad",
        msg: "adminId kiritilishi lozim.",
      });
    }

    const driver = await prisma.driver.findUnique({
      where: { oneId: driverId },
    });

    if (!driver) {
      return res.json({
        status: "bad",
        msg: "Kiritilgan oneId bo'yicha haydovchi ma'lumoti topilmadi.",
        oneId,
      });
    }

    return next();
  } catch (error) {
    return res.status(500).json(error);
  }
}

module.exports = {
  checkAvailability,
  checkRegistered,
  checkBan,
  checkSelfAccess,
  checkAdmin,
  checkSuperAdmin,
  checkValidationDriver,
};
