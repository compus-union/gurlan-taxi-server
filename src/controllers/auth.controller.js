const { CLIENT_TOKEN } = require("../configs/token.config");
const { PrismaClient } = require("@prisma/client");
const {
  checkingServiceByPhone,
  editingLastLogin,
  creatingService,
} = require("../services/auth/auth.service");
const { createToken, verifyToken } = require("../utils/jwt.util");
const { checkPassword } = require("../utils/password.util");

const prisma = new PrismaClient();

async function auth(req, res) {
  try {
    const checkService = await checkingServiceByPhone(req.body.client.phone);

    const client = await checkService.checkClientRegistered();

    if (!client.registered) {
      return res.json({
        status: "ok",
        registered: false,
        msg: "Feel free to create an account",
      });
    }

    const isPasswordCorrect = await checkPassword(
      req.body.client.password,
      client.data.password
    );

    if (!isPasswordCorrect) {
      return res.json({
        status: "incorrect-password",
        msg: "Terilgan parol noto'g'ri. Boshqatdan urinib ko'ring",
      });
    }

    if (client.data.ban && client.data.ban.banned) {
      return res.json({
        registered: true,
        status: "banned",
        msg: "Kechirasiz, sizning akkauntingiz tizim tomonidan ban qilingan!",
        reason: client.data.ban.reason,
      });
    }

    const token = await createToken({ ...client.data }, CLIENT_TOKEN);

    const editedClient = await editingLastLogin(
      client.data.id,
      new Date().toISOString()
    );

    return res.json({
      status: "ok",
      registered: true,
      client: editedClient.data,
      token,
      msg: "Tizimga kirildi!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error, message: error.message });
  }
}

async function register(req, res) {
  try {
    const { client } = req.body;

    const createdClient = await creatingService(client);

    const token = await createToken({ ...createdClient.client }, CLIENT_TOKEN);

    return res.json({
      status: "ok",
      client: createdClient.client,
      token,
      msg: "Akkaunt ochildi!",
    });
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
}

async function check(req, res) {
  try {
    const { oneId } = req.params;
    const token = req.headers["authorization"].split(" ")[1];

    if (!token) {
      return res.json({ status: "forbidden", msg: "Token mavjud emas" });
    }

    const client = await prisma.client.findUnique({ where: { oneId } });

    if (!client) {
      return res.json({ status: "forbidden", msg: "Akkaunt mavjud emas" });
    }

    const verifiedToken = await verifyToken(token, CLIENT_TOKEN);

    if (!verifiedToken) {
      return res.json({ status: "forbidden", msg: "Token yaroqli emas" });
    }

    const matchingToken = (await verifiedToken.oneId) === client.oneId;

    if (!matchingToken) {
      return res.json({
        status: "forbidden",
        msg: "Token yaroqli emas (oneId problem)",
      });
    }

    if (client.ban && client.ban.banned) {
      return res.json({
        status: "forbidden",
        msg: `Akkaunt bloklangan: ${client.ban.reason}`,
      });
    }

    const newToken = await createToken({ ...client }, CLIENT_TOKEN);

    return res.json({
      status: "ok",
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
