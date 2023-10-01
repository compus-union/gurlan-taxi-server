require("dotenv").config();
const express = require("express");
const { upload } = require("../uploads");
const router = express.Router();
const {
  register,
  login,
  validate,
  sendImages,
  checkIfExists,
  checkIfValidated,
} = require("../controllers/driver.controller");
const {
  checkRegister,
  checkLogin,
  checkImages,
  checkAvailability: driverAvailability,
  checkRegistered: driverRegistered,
  checkBan: driverBan,
} = require("../middleware/driver.middleware");
const {
  checkAdmin,
  checkAvailability,
  checkBan,
  checkRegistered,
} = require("../middleware/admin.middleware");

router.post("/register", checkRegister, register);
router.post("/login", checkLogin, login);
router.post(
  "/validate",
  checkAvailability,
  checkRegistered,
  checkBan,
  checkAdmin,
  validate
);
router.post(
  "/send-images/:oneId/:password",
  checkImages,
  upload.array("images"),
  sendImages
);
router.get(
  "/check/:oneId",
  driverAvailability,
  driverRegistered,
  driverBan,
  checkIfExists
);
router.get(
  "/check-validation/:oneId",
  driverAvailability,
  driverRegistered,
  driverBan,
  checkIfValidated
);

module.exports = router;
