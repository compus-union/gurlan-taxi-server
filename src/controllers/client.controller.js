const { CLIENT_TOKEN } = require("../configs/token.config");
const { PrismaClient } = require("@prisma/client");
const { createToken, verifyToken } = require("../utils/jwt.util");
const { checkPassword, createPassword } = require("../utils/password.util");
const { responseStatus } = require("../constants/index");
const { createId } = require("../utils/idGenerator.util");
const moment = require("moment");
const { generateConfirmationCode } = require("../utils/codeGenerator.util");
const {
  sendConfirmationCode,
} = require("../services/emailing/confirmationCode.service");

const prisma = new PrismaClient();
/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function auth(req, res) {
  try {
    const bannedPhone = await prisma.banned.findFirst({
      where: { phone: req.body.client.phone, type: "CLIENT" },
    });

    if (bannedPhone && bannedPhone.banned) {
      return res.json({
        msg: "Bu telefon raqam tizimda bloklangan",
        status: responseStatus.AUTH.BANNED,
      });
    }

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
      data: { lastLogin: new Date(moment().format()) },
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

    const existEmail = await prisma.client.findFirst({
      where: { email: client.email },
    });

    if (existEmail) {
      return res.json({
        status: responseStatus.AUTH.AUTH_WARNING,
        msg: "Bu email tizimda band qilingan, boshqasini tanlang.",
      });
    }

    const validationFullname = /^[a-zA-Z]+(\s[a-zA-Z]+)?$/g;
    if (!validationFullname.test(client.fullname)) {
      return res.json({
        status: responseStatus.AUTH.AUTH_WARNING,
        msg: "Ism familiya lotin harflarida raqam va belgilarsiz kiritilishi lozim.",
      });
    }

    const newId = await createId("client");
    const hashedPass = await createPassword(client.password);
    const confirmationCode = await generateConfirmationCode(6);

    const sentInfo = await sendConfirmationCode(client.email, confirmationCode);

    const createdClient = await prisma.client.create({
      data: {
        oneId: newId,
        password: hashedPass,
        fullname: client.fullname,
        phone: client.phone,
        createdAt: new Date(moment().format()),
        lastLogin: new Date(moment().format()),
        email: client.email,
        status: "CONFIRMING",
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
        confirmation: { create: { code: confirmationCode, confirmed: false } },
      },
    });

    const token = await createToken({ ...createdClient }, CLIENT_TOKEN);

    return res.json({
      status: responseStatus.AUTH.CONFIRMATION_CODE_SENT,
      client: createdClient,
      token,
      msg: "Emailingizga 6 xonali tasdiqlash kodi yuborildi. Shuni belgilangan qatorlarga kiritib, ro'yxatdan o'tishni yakunlang.",
      sentInfo,
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

/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function confirmClientWithCode(req, res) {
  try {
    const { code } = req.body;
    const { oneId } = req.params;

    const existClient = await prisma.client.findUnique({
      where: { oneId },
      include: { confirmation: true, ban: true },
    });

    if (!existClient) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_FOUND,
        msg: "Mijoz akkaunti topilmadi.",
      });
    }

    if (existClient.ban.banned) {
      return res.json({
        status: responseStatus.AUTH.BANNED,
        msg: "Mijoz akkaunti tizimda bloklangan",
        oneId,
      });
    }

    if (!existClient.confirmation || !existClient.confirmationId) {
      return res.json({
        status: responseStatus.AUTH.AUTH_WARNING,
        msg: "Ushbu amalni bajarish imkonsiz. Akkauntni tasdiqlashni imkoni yo'q",
      });
    }

    if (existClient.confirmation.confirmed && !existClient.confirmation.code) {
      const updatedClient = await prisma.client.update({
        where: { oneId },
        data: {
          lastLogin: new Date(moment().format()),
          status: "ONLINE",
          confirmation: {
            update: {
              where: { id: existClient.confirmation.id },
              data: { code: "", confirmed: true },
            },
          },
        },
      });

      const token = await createToken({ ...updatedClient }, CLIENT_TOKEN);

      return res.json({
        status: responseStatus.AUTH.CONFIRMATION_DONE,
        msg: "Ushbu amalni bajarish imkonsiz. Akkaunt allaqachon tasdiqlangan.",
        token,
        client: updatedClient,
      });
    }

    const codeMatches = existClient.confirmation.code === code;

    if (!codeMatches) {
      return res.json({
        status: responseStatus.AUTH.AUTH_WARNING,
        msg: "Tasdiqlash kodi noto'g'ri, boshqatdan urinib ko'ring",
      });
    }

    const updatedClient = await prisma.client.update({
      where: { oneId },
      data: {
        lastLogin: new Date(moment().format()),
        status: "ONLINE",
        confirmation: {
          update: {
            where: { id: existClient.confirmation.id },
            data: { code: "", confirmed: true },
          },
        },
      },
    });

    const token = await createToken({ ...updatedClient }, CLIENT_TOKEN);

    return res.json({
      status: responseStatus.AUTH.CONFIRMATION_DONE,
      msg: "Tizimga kirildi!",
      token,
      client: updatedClient,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

async function sendConfirmationAgain(req, res) {
  try {
    const { oneId } = req.params;

    const client = await prisma.client.findUnique({
      where: { oneId },
      include: { confirmation: true },
    });

    if (client.status !== "CONFIRMING" && client.confirmation.confirmed) {
      return res.json({
        status: responseStatus.AUTH.CONFIRMATION_DONE,
        msg: "Akkaunt allqachon tasdiqlangan.",
      });
    }

    const confirmationCode = await generateConfirmationCode(6);
    const sentInfo = await sendConfirmationCode(client.email, confirmationCode);

    return res.json({
      status: responseStatus.AUTH.CONFIRMATION_CODE_SENT,
      msg: "Kod yuborildi.",
      sentInfo,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = {
  register,
  auth,
  check,
  confirmClientWithCode,
  sendConfirmationAgain,
};
