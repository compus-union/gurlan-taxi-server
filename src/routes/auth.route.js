require("dotenv").config();
const express = require("express");
const router = express.Router();
const { register, auth } = require("../controllers/auth/auth.controller");

router.post("/login", auth);
router.post("/register", register);

module.exports = router;
