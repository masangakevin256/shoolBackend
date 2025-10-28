const express = require("express");
const router = express.Router();
const addNewAdmin = require("../controller/controlAdminRegister");

router.post("/", addNewAdmin)

module.exports = router;