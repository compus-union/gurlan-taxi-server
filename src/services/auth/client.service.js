const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkingServiceByPhone(phone) {
  try {
    const foundClient = await prisma.client.findUnique({ where: { phone } });

    // checks if client registered or not
    async function checkClientRegistered() {
      if (foundClient) {
        return {
          registered: true,
          data: foundClient,
        };
      }

      return {
        registered: false,
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
    const newClient = await prisma.client.create({ data });

    if (!newClient) {
      throw new Error("Couldn't create client");
    }
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
