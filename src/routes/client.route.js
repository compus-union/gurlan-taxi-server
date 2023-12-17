require("dotenv").config();
const express = require("express");
const router = express.Router();
const { register, auth, check, confirmClientWithCode } = require("../controllers/client.controller");

router.post("/login", auth);
router.post("/register", register);
router.get("/check/:oneId", check)
router.put("/confirm/:oneId", confirmClientWithCode)

module.exports = router;
