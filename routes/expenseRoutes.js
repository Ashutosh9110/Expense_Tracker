const express = require("express")
const router = express.Router()
const expenseController = require("../controller/expenseController")
const authenticate = require("../middleware/auth");




router.post("/addExpense", authenticate, expenseController.addExpense)
router.get("/getExpense", authenticate, expenseController.getExpense)
router.delete("/deleteExpense/:id", authenticate, expenseController.deleteExpense)
router.get("/download", authenticate, expenseController.downloadExpense)


module.exports = router