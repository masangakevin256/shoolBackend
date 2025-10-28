const express = require("express");
const router = express.Router();
const handleAdmin = require("../controller/handleAdmin");
const verifyRoles = require("../middleware/verifyRoles");
const ROLE_LIST = require("../config/role_list");

router.get("/", verifyRoles(ROLE_LIST.Admin), handleAdmin.getAllAdmins);
router.put("/:id",verifyRoles(ROLE_LIST.Admin), handleAdmin.updateAdmin);
router.delete("/:id",verifyRoles(ROLE_LIST.Admin), handleAdmin.deleteAdmin);
router.get("/:id",verifyRoles(ROLE_LIST.Admin), handleAdmin.getAdmin);
module.exports = router