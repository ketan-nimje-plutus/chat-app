const express = require("express");
const router = express.Router();
const {
  register,
  login,
  searchUser,
  getUser,
} = require("../controller/userController");
const { isAuthenticated } = require("../middleware/validateToken");

router.post("/register", register);
router.post("/login", login);
router.get("/getUser", isAuthenticated, getUser);
router.post("/searchUser", isAuthenticated, searchUser);

module.exports = router;
