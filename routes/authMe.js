const express = require("express");
const router = express.Router();
const handleAuthMe = require("../controller/controlAuthMe");
const ROLE_LIST = require("../config/role_list");
const verifyRoles = require("../middleware/verifyRoles");

router.get("/parents",verifyRoles( ROLE_LIST.Parent) , handleAuthMe.getParent);
router.get("/teachers",verifyRoles( ROLE_LIST.Parent) , handleAuthMe.getTeacher);
router.get("/admins",verifyRoles( ROLE_LIST.Parent) , handleAuthMe.getAdmin);

module.exports = router