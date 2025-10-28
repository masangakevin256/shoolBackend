const express = require("express");
const router = express.Router();
const handleParentsLogout = require("../controller/handleParentsLogout");

router.post("/", handleParentsLogout);

module.exports = router