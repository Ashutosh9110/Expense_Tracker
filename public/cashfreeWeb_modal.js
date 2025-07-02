
const cashfree = Cashfree({
  mode: "sandbox",
});


document.getElementById("renderBtn").addEventListener("click", async () => {
  try {
    // Fetch payment session ID from backend
    const response = await fetch("http://localhost:3000/pay", {
      method: "POST",
    });

    const data = await response.json();
    const paymentSessionId = data.paymentSessionId;

    // Initialize checkout options
    let checkoutOptions = {
      paymentSessionId: paymentSessionId,

      // New page payment options
      redirectTarget: "_modal", // Default is "_self", use "_blank" for new tab
    }

    const result = await cashfree.checkout(checkoutOptions);

    if (result.error) {
      // Triggered when user closes the popup or any error occurs during payment
      console.log("User has closed the popup or there is some payment error, Check for Payment Status");
      console.log(result.error);
    }
    
    if (result.redirect) {
      // Triggered when the redirection page cannot be opened in the same window
      // (e.g. when opened inside an in-app browser)
      console.log("Payment will be redirected");
    }
    
    if (result.paymentDetails) {
      // Called when the payment is completed (regardless of success/failure)
      console.log("Payment has been completed, Check for Payment Status");
      console.log(result.paymentDetails.paymentMessage);
    
      // Call your backend to verify final payment status
      const response = await fetch(`http://localhost:3000/payments/payment-status/${orderId}`, {
        method: "GET",
      });
    
      const data = await response.json();
      alert("Your payment is " + data.orderStatus);
    }
    

  } catch (error) {
    console.error("Error:", error);
  }

  }) 