const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { createPassword } = require("../../utils/password.util");
const { createId } = require("../../utils/idGenerator.util");
const moment = require("moment")


async function checkingServiceByPhone(phone) {
  try {
    const foundClient = await prisma.client.findUnique({ where: { phone } });

    // checks if client registered or not
    async function checkClientRegistered() {
      if (foundClient) {
        return {
          registered: true,
          data: foundClient,
          status: "ok",
        };
      }

      return {
        registered: false,
        status: "unregistered",
      };
    }

    return {
      checkClientRegistered,
    };
  } catch (error) {
    console.log(error);
  }
}

// async function checkingServiceByOneId(oneId) {}

async function creatingService(data) {
  try {
    const { fullname, phone, password } = data;

    const hashedPass = await createPassword(password);
    const newOneId = await createId("client");

    const newClient = await prisma.client.create({
      data: {
        fullname,
        phone,
        password: hashedPass,
        oneId: newOneId,
        createdAt: new Date(moment().format()),
        lastLogin: new Date(moment().format())
      },
    });

    if (!newClient) {
      throw new Error("Couldn't create client");
    }

    return { client: newClient, status: "ok" };
  } catch (error) {
    console.log(error.message);
  }
}

async function editingLastLogin(id, lastLogin) {
  try {
    const edited = await prisma.client.update({
      where: { id },
      data: { lastLogin },
    });

    if (!edited) {
      throw new Error("Couldn't edit the client's lastLogin");
    }

    return {
      status: "ok",
      data: edited,
    };
  } catch (error) {
    console.log(error.message);
  }
}

module.exports = { checkingServiceByPhone, creatingService, editingLastLogin };
