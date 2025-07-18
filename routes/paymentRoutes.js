    const express = require("express")
    const router = express.Router()
    const paymentController = require("../controller/paymentController")
    const authenticate  = require("../middleware/auth")


    router.get("/", paymentController.getPaymentPage)
    router.post("/pay", authenticate, paymentController.processPayment)
    router.get("/payment-status/:orderId", authenticate, paymentController.getPaymentStatus)


    module.exports = router