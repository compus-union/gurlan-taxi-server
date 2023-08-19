const { PrismaClient } = require("@prisma/client");
const { CLIENT_TOKEN } = require("../../configs/token.config");
const {
  checkingServiceByPhone,
  editingLastLogin,
  creatingService,
} = require("../../services/auth/client.service");
const { createToken } = require("../../utils/jwt.util");
const { checkPassword } = require("../../utils/password.util");
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

    const token = await createToken({ ...client }, CLIENT_TOKEN);

    console.log(token);

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

module.exports = { register, auth };
