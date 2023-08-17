const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const { CLIENT_TOKEN } = require("../../configs/token.config");
const {
  checkingServiceByPhone,
  creatingService,
  editingLastLogin,
} = require("../../services/auth/client.service");
const { createToken } = require("../../utils/jwt.util");

async function auth(req, res) {
  try {
    const checkService = await checkingServiceByPhone(req.body.phone);

    const client = await checkService();

    if (!client.registered) {
      return res.json({
        status: "ok",
        registered: false,
        msg: "Feel free to create an account",
      });
    }

    if (client.data.ban.banned) {
      return res.json({
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
      client: editedClient,
      token,
    });
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
}

async function register(req, res) {
  try {
    const createdClient = await creatingService(req.body.client);

    const token = await createToken({ ...req.body.client }, CLIENT_TOKEN);

    return res.json({
      status: "ok",
      client: createdClient,
      token,
      msg: "Akkaunt ochildi!",
    });
  } catch (error) {
    return res.status(500).json({ error, message: error.message });
  }
}

module.exports = { register, auth };
