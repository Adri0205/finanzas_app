const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");

const {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
} = require("../controllers/transactionController");

router.get("/", authMiddleware, getTransactions);

router.post("/", authMiddleware, createTransaction);

router.put("/:id", authMiddleware, updateTransaction);

router.delete("/:id", authMiddleware, deleteTransaction);

module.exports = router;
