require("dotenv").config();
const express = require("express");
const router = express.Router();
const { register, auth, check } = require("../controllers/auth.controller");

router.post("/login", auth);
router.post("/register", register);
router.get("/check/:oneId", check)

module.exports = router;
