const express = require("express");
const router = express.Router();

const { register, login, verify } = require("../controllers/authControllers");
const { authenticateToken } = require("../middleware/authMiddleware.js");

router.post("/register", register);
router.post("/login", login);
router.get("/verify", authenticateToken, verify);

module.exports = router;
