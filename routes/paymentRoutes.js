const express = require("express")
const router = express.Router()
const paymentController = require("../controller/paymentController")



router.get("/", paymentController.getPaymentPage)
router.post("/pay", paymentController.processPayment)
router.get("/payment-status/:orderId", paymentController.getPaymentStatus)


module.exports = router