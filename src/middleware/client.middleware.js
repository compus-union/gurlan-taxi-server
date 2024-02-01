const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { verifyToken } = require("../utils/jwt.util");
const { CLIENT_TOKEN } = require("../configs/token.config");
const { responseStatus } = require("../constants/index");

async function checkAvailability(req, res, next) {
  try {
    const { oneId } = req.params;

    const client = await prisma.client.count({
      where: { oneId },
    });

    if (!client) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_FOUND,
        msg: "Akkaunt topilmadi",
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
        status: responseStatus.AUTH.TOKEN_NOT_FOUND,
        msg: "Sizda tizimdan foydalanishga ruxsat yo'q. (Headers are not found)",
      });
    }

    if (!headers.split(" ")[1]) {
      return res.json({
        status: responseStatus.AUTH.TOKEN_NOT_FOUND,
        msg: "Sizda tizimdan foydalanishga ruxsat yo'q. (Token is not found)",
      });
    }

    const token = headers.split(" ")[1];

    const verifiedToken = await verifyToken(token, CLIENT_TOKEN);

    if (!verifiedToken) {
      return res.json({
        status: responseStatus.AUTH.TOKEN_NOT_VALID,
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

    const client = await prisma.client.findUnique({
      where: { oneId },
      include: { ban: true },
    });

    if (client.ban.banned) {
      return res.json({
        status: responseStatus.AUTH.BANNED,
        msg: "Sizning akkauntingiz tizimda bloklangan.",
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

    const verifiedToken = await verifyToken(token, CLIENT_TOKEN);

    if (verifiedToken.oneId !== oneId) {
      return res.json({
        status: responseStatus.AUTH.TOKEN_NOT_VALID,
        msg: "Sizda ruxsat yo'q (oneId is not same)",
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
};
