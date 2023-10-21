const { CLIENT_TOKEN } = require("../configs/token.config");
const { PrismaClient } = require("@prisma/client");
const { createToken, verifyToken } = require("../utils/jwt.util");
const { checkPassword, createPassword } = require("../utils/password.util");
const { responseStatus } = require("../constants/index");
const { createId } = require("../utils/idGenerator.util");
const moment = require("moment");

const prisma = new PrismaClient();
/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function auth(req, res) {
  try {
    console.log(req.body);
    const clientExist = await prisma.client.findFirst({
      where: { phone: req.body.client.phone },
      include: { ban: true },
    });

    if (!clientExist) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_READY_TO_REGISTER,
        registered: false,
        msg: "Feel free to create an account",
      });
    }

    const bannedPhone = await prisma.banned.findFirst({
      where: { phone: req.body.client.phone, banned: true },
    });

    if (bannedPhone) {
      return res.json({
        status: responseStatus.AUTH.BANNED,
        msg: "Bu raqam tizimda bloklangan.",
      });
    }

    const isPasswordCorrect = await checkPassword(
      req.body.client.password,
      clientExist.password
    );

    if (!isPasswordCorrect) {
      return res.json({
        status: responseStatus.AUTH.AUTH_WARNING,
        msg: "Terilgan parol noto'g'ri. Boshqatdan urinib ko'ring",
      });
    }

    if (clientExist.ban.banned) {
      return res.json({
        registered: true,
        status: responseStatus.AUTH.BANNED,
        msg: "Kechirasiz, sizning akkauntingiz tizim tomonidan ban qilingan!",
        reason: clientExist.ban.reason,
      });
    }

    const edited = await prisma.client.update({
      where: { id: clientExist.id },
      data: { lastLogin: new Date().toISOString() },
    });

    const token = await createToken({ ...edited }, CLIENT_TOKEN);

    return res.json({
      status: responseStatus.AUTH.CLIENT_LOGIN_DONE,
      registered: true,
      client: edited,
      token,
      msg: "Tizimga kirildi!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error, message: error.message });
  }
}

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function register(req, res) {
  try {
    const { client } = req.body;

    const existingPhone = await prisma.client.count({
      where: { phone: client.phone },
    });

    if (existingPhone) {
      return res.json({
        status: responseStatus.AUTH.AUTH_WARNING,
        msg: "Bu telefon raqam oldin ro'yxatdan o'tgan, boshqasini tanlang",
      });
    }

    const bannedPhone = await prisma.banned.findFirst({
      where: { phone: client.phone, banned: true },
    });

    if (bannedPhone) {
      return res.json({
        registered: true,
        status: responseStatus.AUTH.BANNED,
        msg: "Kechirasiz, bu telefon raqam tizimda ban qilingan.",
        reason: bannedPhone.reason,
      });
    }

    const newId = await createId("client");
    const hashedPass = await createPassword(client.password);

    const createdClient = await prisma.client.create({
      data: {
        oneId: newId,
        password: hashedPass,
        fullname: client.fullname,
        phone: client.phone,
        createdAt: new Date(moment().format()),
        lastLogin: new Date(moment().format()),
        ban: {
          create: {
            admin: "",
            phone: client.phone,
            date: new Date(),
            reason: "",
            type: "CLIENT",
            banned: false,
          },
        },
      },
    });

    const token = await createToken({ ...createdClient }, CLIENT_TOKEN);

    return res.json({
      status: responseStatus.AUTH.CLIENT_REGISTER_DONE,
      client: createdClient,
      token,
      msg: "Akkaunt ochildi!",
    });
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
}

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function check(req, res) {
  try {
    const { oneId } = req.params;
    const token = req.headers["authorization"].split(" ")[1];

    // checks token
    if (!token) {
      return res.json({
        status: responseStatus.AUTH.TOKEN_NOT_FOUND,
        msg: "Token mavjud emas",
      });
    }

    const client = await prisma.client.findUnique({
      where: { oneId },
      include: { ban: true },
    });

    // checks client
    if (!client) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_FOUND,
        msg: "Akkaunt mavjud emas",
      });
    }

    const verifiedToken = await verifyToken(token, CLIENT_TOKEN);

    // checks token's validation
    if (!verifiedToken) {
      return res.json({
        status: responseStatus.AUTH.TOKEN_NOT_VALID,
        msg: "Token yaroqli emas",
      });
    }

    const matchingToken = (await verifiedToken.oneId) === client.oneId;

    // checks token's credentials match with client's
    if (!matchingToken) {
      return res.json({
        status: responseStatus.AUTH.TOKEN_NOT_VALID,
        msg: "Token yaroqli emas (oneId problem)",
      });
    }
    // checks if client is banned or not
    if (client.ban.banned) {
      return res.json({
        status: responseStatus.AUTH.BANNED,
        msg: `Akkaunt bloklangan: ${client.ban.reason}`,
      });
    }

    const newToken = await createToken({ ...client }, CLIENT_TOKEN);

    // everything is ok
    return res.json({
      status: responseStatus.AUTH.CLIENT_CHECK_DONE,
      msg: "Hammasi ok",
      token: newToken,
      client,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = { register, auth, check };
