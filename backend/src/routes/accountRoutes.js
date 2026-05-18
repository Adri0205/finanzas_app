const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getAccounts,
  createAccount,
  deleteAccount,
} = require("../controllers/accountController");

router.get("/", authMiddleware, getAccounts);
router.post("/", authMiddleware, createAccount);
router.delete("/:id", authMiddleware, deleteAccount);

module.exports = router;
