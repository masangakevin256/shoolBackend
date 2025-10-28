const express = require("express");
const router = express.Router();
const handleTeachersLogout = require("../controller/handleTeachersLogout");

router.post("/", handleTeachersLogout);

module.exports = router