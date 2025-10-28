const express = require("express");
const router = express.Router();
const handleTeachersRefreshToken = require("../controller/controlTeachersRefreshToken");

router.post("/", handleTeachersRefreshToken);

module.exports = router