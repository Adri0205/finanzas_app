const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getAccounts,
  createAccount,
} = require("../controllers/accountController");

router.get("/", authMiddleware, getAccounts);
router.post("/", authMiddleware, createAccount);

module.exports = router;
