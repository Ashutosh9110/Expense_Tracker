const path = require("path");
const crypto = require("crypto")
const { createOrder, getPaymentStatus: fetchPaymentStatus } = require("../services/cashfreeService");
const { Payment } = require("../models/paymentModel"); 
const { users } = require("../models/userModel")
const jwt = require("jsonwebtoken");
// console.log(jwt);
const getPaymentPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"))
}



const getPaymentStatus = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    const status = await fetchPaymentStatus(orderId);

    if (status === "Success" || status === "Failure") {
      await Payment.update(
        { paymentStatus: status },
        { where: { orderId } }
      );

      if (status === "Success") {
        const userId = req.userId;
        await users.update({ isPremium: true }, { where: { id: userId } });

        const user = await users.findOne({ where: { id: userId } });
        if (!user) {
          return res.status(404).json({ error: "User not found after payment" });
        }

        const token = jwt.sign(
          {
            userId: user.id,
            email: user.email,
            isPremium: true
          },
          process.env.JWT_SECRET,
          { expiresIn: "1h" }
        );

        return res.status(200).json({
          orderStatus: status,
          msg: "Payment verified",
          isPremium: true,
          token
        });
      }
    }

    return res.status(200).json({ orderStatus: status });
    
  } catch (error) {
    console.error("Error in getPaymentStatus:", error);
    res.status(500).json({ error: "Could not fetch payment status" });
  }
};


const processPayment = async (req, res) => {

  const orderId = `ORDER-${Date.now()}-${crypto.randomBytes(4).toString("hex")}`

  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerID = req.userId.toString() // store user ID as string
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