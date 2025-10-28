const express = require("express");
const router = express.Router();
const handleParentRefreshToken = require("../controller/controlParentsRefreshToken ");

router.post("/", handleParentRefreshToken);

module.exports = router