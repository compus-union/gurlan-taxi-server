const { CLIENT_TOKEN } = require("../configs/token.config");
const { PrismaClient } = require("@prisma/client");
const { createToken, verifyToken } = require("../utils/jwt.util");
const { checkPassword, createPassword } = require("../utils/password.util");
const { responseStatus } = require("../constants/index");
const { createId } = require("../utils/idGenerator.util");
const moment = require("moment");
const { generateConfirmationCode } = require("../utils/codeGenerator.util");

const { sendCode } = require("../services/sms/sendSms");

const prisma = new PrismaClient();
/**
 * @param {Request} req
 * @param {Response} res
 * @returns
 */
async function auth(req, res) {
  try {
    const { phone, password } = req.body.client;

    const bannedPhone = await prisma.banned.findFirst({ where: { phone } });

    if (bannedPhone && bannedPhone.banned) {
      return res.json({
        msg: "Bu telefon raqam tizimda bloklangan",
        status: responseStatus.AUTH.BANNED,
      });
    }

    const clientExist = await prisma.client.findFirst({
      where: { phone },
      include: { ban: true, confirmation: true },
    });

    if (!clientExist) {
      const newOneId = await createId("client");
      const newConfirmationCode = await generateConfirmationCode(6);
      const hashedPass = await createPassword(password);

      const updatedClient = await prisma.client.create({
        data: {
          oneId: newOneId,
          phone,
          fullname: "Taxi Mijoz",
          password: hashedPass,
          createdAt: new Date(moment().format()),
          lastLogin: new Date(moment().format()),
          status: "CONFIRMING",
          confirmation: {
            create: { code: newConfirmationCode, confirmed: false },
          },
          ban: {
            create: {
              admin: "",
              phone: phone,
              date: new Date(),
              reason: "",
              type: "CLIENT",
              banned: false,
            },
          },
        },
      });

      // const sentInfo = await sendCode(phone, newConfirmationCode);

      // if (sentInfo.status !== "ok") {
      //   return res.json({
      //     status: responseStatus.AUTH.AUTH_WARNING,
      //     msg: "Tasdiqlash kodini yuborishda xatolik yuzaga keldi, boshqatdan urinib ko'ring",
      //     sentInfo,
      //   });
      // }

      return res.json({
        status: responseStatus.AUTH.CONFIRMATION_CODE_SENT,
        msg: "Tizimga kirish uchun telefon raqamingizga tasdiqlash kodi yuborildi",
        // sentInfo,
        clientStatus: updatedClient.status,
        oneId: updatedClient.oneId,
      });
    }

    if (clientExist.ban.banned) {
      return res.json({
        msg: "Bu telefon raqam tizimda bloklangan",
        status: responseStatus.AUTH.BANNED,
      });
    }

    const isPasswordCorrect = await checkPassword(
      password,
      clientExist.password
    );

    if (!isPasswordCorrect) {
      return res.json({
        status: responseStatus.AUTH.AUTH_WARNING,
        msg: "Terilgan parol noto'g'ri. Boshqatdan urinib ko'ring",
      });
    }

    if (
      !clientExist.confirmation.confirmed &&
      clientExist.status === "CONFIRMING"
    ) {
      const newConfirmationCode = await generateConfirmationCode(6);
      const updatedClient = await prisma.client.update({
        where: { id: clientExist.id },
        data: {
          confirmation: {
            update: {
              id: clientExist.confirmationId,
              code: newConfirmationCode,
              confirmed: false,
            },
          },
        },
      });

      // const sentInfo = await sendCode(updatedClient.phone, newConfirmationCode);
      // if (sentInfo.status !== "ok") {
      //   return res.json({
      //     status: responseStatus.AUTH.AUTH_WARNING,
      //     msg: "Tasdiqlash kodi yuborilmadi, boshqatdan urinib ko'ring",
      //   });
      // }

      return res.json({
        status: responseStatus.AUTH.CONFIRMATION_CODE_SENT,
        msg: "Telefon raqamingizga yana bir bor tasdiqlash kodi yuborildi",
        clientStatus: updatedClient.status,
        oneId: updatedClient.oneId,
      });
    }

    const edited = await prisma.client.update({
      where: { id: clientExist.id },
      data: { lastLogin: new Date(moment().format()), status: "ONLINE" },
    });

    const token = await createToken({ ...edited }, CLIENT_TOKEN);

    return res.json({
      status: responseStatus.AUTH.CLIENT_LOGIN_DONE,
      msg: "Tizimga kirildi",
      token,
      client: edited,
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
      include: { ban: true, confirmation: true },
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

    // checks if client is confirmed
    if (client.status === "CONFIRMING" && !client.confirmation.confirmed) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_CONFIRMED,
        msg: "Mijoz akkaunti hali tasdiqlanmagan",
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
              code: "",
              confirmed: true,
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
            code: "",
            confirmed: true,
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
        msg: "Akkaunt allaqachon tasdiqlangan.",
        client,
      });
    }

    const confirmationCode = await generateConfirmationCode(6);
    const updatedClient = await prisma.client.update({
      where: { oneId },
      data: {
        confirmation: {
          update: {
            code: confirmationCode,
            confirmed: false,
          },
        },
      },
    });

    console.log("Client updated: ", updatedClient);

    // const sentInfo = await sendCode(client.phone, confirmationCode);

    // if (sentInfo.status !== "ok") {
    //   return res.json({
    //     status: responseStatus.AUTH.AUTH_WARNING,
    //     msg: "Tasdiqlash kodini yuborishda xatolik yuzaga keldi, boshqatdan urinib ko'ring",
    //     // sentInfo,
    //   });
    // }

    return res.json({
      status: responseStatus.AUTH.CONFIRMATION_CODE_SENT,
      msg: "Tasdiqlash kodi yuborildi",
      // sentInfo,
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
async function getSelf(req, res) {
  try {
    const { oneId } = req.params;

    const clientAccount = await prisma.client.findUnique({
      where: { oneId },
      include: { ban: true, confirmation: true },
    });

    if (!clientAccount) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_FOUND,
        msg: "Foydalanuvchi akkaunti topilmadi",
      });
    }

    const newToken = await createToken({ ...clientAccount }, CLIENT_TOKEN);

    return res.json({
      client: clientAccount,
      status: "ok",
      msg: "Hammasi joyida",
      token: newToken,
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
async function getAccount(req, res) {
  try {
    const { oneId } = req.params;

    const clientAccount = await prisma.client.findUnique({
      where: { oneId },
      include: { ban: true, confirmation: true, rides: true },
    });

    if (!clientAccount) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_FOUND,
        msg: "Foydalanuvchi akkaunti topilmadi",
      });
    }

    const newToken = await createToken({ ...clientAccount }, CLIENT_TOKEN);

    return res.json({
      client: clientAccount,
      status: "ok",
      msg: "Akkaunt topildi",
      token: newToken,
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
async function updateAccount(req, res) {
  try {
    const { oneId } = req.params;
    const { account } = req.body;

    const clientAccount = await prisma.client.count({
      where: { oneId },
    });

    if (!clientAccount) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_FOUND,
        msg: "Foydalanuvchi akkaunti topilmadi",
      });
    }

    const updateClient = await prisma.client.update({
      where: { oneId },
      data: account,
    });

    const newToken = await createToken({ ...updateClient }, CLIENT_TOKEN);

    return res.json({
      client: updateClient,
      status: "ok",
      msg: "Akkaunt yangilandi",
      token: newToken,
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
async function deleteAccount(req, res) {
  try {
    const { oneId } = req.params;

    const clientAccount = await prisma.client.count({
      where: { oneId },
    });

    if (!clientAccount) {
      return res.json({
        status: responseStatus.AUTH.CLIENT_NOT_FOUND,
        msg: "Foydalanuvchi akkaunti topilmadi",
      });
    }

    await prisma.client.delete({
      where: { oneId },
      include: { ban: true, rides: true, confirmation: true },
    });

    return res.json({
      status: "ok",
      msg: "Akkaunt o'chirildi",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json(error);
  }
}

module.exports = {
  auth,
  check,
  confirmClientWithCode,
  sendConfirmationAgain,
  getSelf,
  getAccount,
  updateAccount,
  deleteAccount,
};
