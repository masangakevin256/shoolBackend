const express = require("express");
const router = express.Router();
const handleLogin = require("../controller/controlLogin");

// Define each login route separately
router.post("/parents", handleLogin.handleParentsLogin);
router.post("/teachers", handleLogin.handleTeachersLogin);
router.post("/admins", handleLogin.handleAdminLogin);

module.exports = router;


