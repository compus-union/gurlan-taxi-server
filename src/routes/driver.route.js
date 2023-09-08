require("dotenv").config();
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  validate,
} = require("../controllers/driver.controller");
const { checkRegister, checkLogin } = require("../middleware/driver.middleware");
const {
  checkAdmin,
  checkAvailability,
  checkBan,
  checkRegistered,
  checkSuperAdmin,
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

module.exports = router;
