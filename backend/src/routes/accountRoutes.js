const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getAccounts,
  createAccount,
  deleteAccount,
  updateAccountBalance,
} = require("../controllers/accountController");

router.get("/", authMiddleware, getAccounts);
router.post("/", authMiddleware, createAccount);
router.patch("/:id/balance", authMiddleware, updateAccountBalance);
router.delete("/:id", authMiddleware, deleteAccount);

module.exports = router;
