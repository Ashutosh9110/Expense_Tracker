const path = require("path");
const crypto = require("crypto")
const { createOrder, getPaymentStatus: fetchPaymentStatus } = require("../services/cashfreeService");
const { Payment } = require("../models/paymentModel"); 


const getPaymentPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
}


// const getPaymentStatus = (req, res) => {
//   res.sendFile(path.join(__dirname, "../services/cashfreeService.js"))
// }  



const getPaymentStatus = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const status = await fetchPaymentStatus(orderId);

    if (status === "Success" || status === "Failure") {
      await Payment.update(
        { paymentStatus: status },
        { where: { orderId } }
      );
    }

    res.status(200).json({ orderStatus: status });
  } catch (error) {
    console.error("Error in getPaymentStatus:", error);
    res.status(500).json({ error: "Could not fetch payment status" });
  }
};




// const getPaymentStatus = async (req, res) => {
//   const orderId = req.params.orderId;

//   try {
//     const orderStatus = await fetchStatusFromCashfree(orderId);
//     res.status(200).json({ orderStatus });
//   } catch (err) {
//     console.error("Failed to get payment status:", err);
//     res.status(500).json({ error: "Unable to fetch payment status" });
//   }
// };


const processPayment = async (req, res) => {

  const orderId = `ORDER-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`
  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerID = "1";
  const customerPhone = "9999999999";

  try {
    //* Create an order in Cashfree and get the payment session ID
    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      customerID,
      customerPhone,
    );

    const existingOrder = await Payment.findOne({ where: { orderId } });
    if (existingOrder) {
      return res.status(400).json({ message: "Order ID already exists" });
    }


    //* Save payment details to the database
    await Payment.create({
      orderId,
      paymentSessionId,
      orderAmount,
      orderCurrency,
      paymentStatus: "Pending",
    });

    res.status(200).json({
      paymentSessionId,
      orderId,
    });


  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({ message: "Payment processing failed" });
  }
};




module.exports = { 

  processPayment,
  getPaymentPage,
  getPaymentStatus
}