const express = require("express");
const router = express.Router();
const handleLogin = require("../controller/controlLogin");

// Define each login route separately
router.post("/parent", handleLogin.handleParentsLogin);
router.post("/teacher", handleLogin.handleTeachersLogin);
router.post("/admin", handleLogin.handleAdminLogin);

module.exports = router;


