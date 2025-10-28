const express = require("express");
const router = express.Router();
const handleAdminRefreshToken = require("../controller/controlAdminsRefreshToken");

router.post("/", handleAdminRefreshToken);

module.exports = router