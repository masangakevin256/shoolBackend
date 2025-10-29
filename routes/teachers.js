const express = require("express");
const router = express.Router();
const handleTeachers = require("../controller/handleTeacher");
const ROLE_LIST = require("../config/role_list");
const verifyRoles = require("../middleware/verifyRoles");

router.get("/",verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher, ROLE_LIST.Parent) , handleTeachers.getAllTeachers);
router.put("/:id",verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher), handleTeachers.updateTeacher);
router.delete("/:id", verifyRoles(ROLE_LIST.Admin), handleTeachers.deleteTeacher);
router.get("/:id", verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher), handleTeachers.getTeacher);
module.exports = router