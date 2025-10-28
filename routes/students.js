const express = require("express");
const router = express.Router();
const handleStudents = require("../controller/handleStudents");
const ROLE_LIST = require("../config/role_list");
const verifyRoles = require("../middleware/verifyRoles");

router.get("/", verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher) ,handleStudents.getAllStudents);
router.post("/", verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher) , handleStudents.addNewStudent);
router.put("/:id", verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher) , handleStudents.updateStudent);
router.delete("/:id",verifyRoles(ROLE_LIST.Admin) , handleStudents.deleteStudent);
router.get("/:id",verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher) , handleStudents.getStudent);
module.exports = router