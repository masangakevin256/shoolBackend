const express = require("express");
const router = express.Router();
const handleAdminLogout = require("../controller/handleAdminsLogout");

router.post("/", handleAdminLogout);

module.exports = router