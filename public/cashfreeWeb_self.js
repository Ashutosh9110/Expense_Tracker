
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
      redirectTarget: "_self", // Default is "_self", use "_blank" for new tab
    };

    // Start the checkout process
    await cashfree.checkout(checkoutOptions);

  } catch (error) {
    console.error("Error during payment session or checkout:", error);
  }
}); 