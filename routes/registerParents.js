const express = require("express");
const router = express.Router();
const addNewParent = require("../controller/controlParentRegister");

router.post("/", addNewParent)

module.exports = router;