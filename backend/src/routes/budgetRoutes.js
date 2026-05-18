const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const {
  getBudgets,
  createOrUpdateBudget,
} = require("../controllers/budgetController");

router.get("/", authMiddleware, getBudgets);
router.post("/", authMiddleware, createOrUpdateBudget);

module.exports = router;
