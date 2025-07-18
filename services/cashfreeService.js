const { Cashfree, CFEnvironment } = require("cashfree-pg"); 

const cashfree = new Cashfree(
  CFEnvironment.SANDBOX,
  process.env.CASHFREE_APP_ID,
  process.env.CASHFREE_SECRET
);

exports.createOrder = async (
  orderId,
  orderAmount,
  orderCurrency = "INR",
  customerID,
  customerPhone
) => {
  try {
    const expiryDate = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
    const formattedExpiryDate = expiryDate.toISOString();

    const request = {
      order_amount: orderAmount,
      order_currency: orderCurrency,
      order_id: orderId,

      customer_details: {
        customer_id: customerID,
        customer_phone: customerPhone,
      },

      order_meta: {
        return_url : `http://localhost:3000/success.html?order_id=${orderId}`,
        payment_method : "ccc, upi, nb"
      },
      order_expiry_time: formattedExpiryDate,  
    };

    const response = await cashfree.PGCreateOrder(request);
    return response.data.payment_session_id;
    } catch (error) {
      console.error("Error creating order:", error.message);
    }
  }   

  exports.getPaymentStatus = async (orderId) => {
    try {
      const response = await cashfree.PGOrderFetchPayments(orderId);
  
      let getOrderResponse = response.data;
      let orderStatus;
  
      if (
        getOrderResponse.filter(
          (transaction) => transaction.payment_status === "SUCCESS"
        ).length > 0
      ) {
        orderStatus = "Success";
      } else if (
        getOrderResponse.filter(
          (transaction) => transaction.payment_status === "PENDING"
        ).length > 0
      ) {
        orderStatus = "Pending";
      } else {
        orderStatus = "Failure";
      }
  
      return orderStatus;
    } catch (error) {
      console.error("Error fetching payment status:", error);
      return "Error";
    }
  };
  
  

