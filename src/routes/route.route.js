const router = require("express").Router();
const { calculateRoute } = require("../controllers/route.controller");

router.get("/calculate", calculateRoute);

module.exports = router