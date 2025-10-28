const express = require("express");
const router = express.Router();
const addNewTeacher = require("../controller/handleTeacherRegister");

router.post("/", addNewTeacher);

module.exports = router;