const express = require("express");
const router = express.Router();
const handleParents = require("../controller/handleParents");
const ROLE_LIST = require("../config/role_list");
const verifyRoles = require("../middleware/verifyRoles");

router.get("/",verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher, ROLE_LIST.Parent) , handleParents.getAllParents);
router.put("/:id", verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher, ROLE_LIST.Parent) , handleParents.updateParent);
router.delete("/:id",verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher) , handleParents.deleteParent);
router.get("/:id",verifyRoles(ROLE_LIST.Admin, ROLE_LIST.Teacher, ROLE_LIST.Parent) , handleParents.getParent);
module.exports = router