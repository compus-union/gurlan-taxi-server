require("dotenv").config()
module.exports = {
  CLIENT_TOKEN: process.env.CLIENT_TOKEN,
  DRIVER_TOKEN: process.env.DRIVER_TOKEN,
  ADMIN_TOKEN: process.env.ADMIN_TOKEN,
  SUPER_ADMIN_TOKEN: process.env.SUPER_ADMIN_TOKEN
};
