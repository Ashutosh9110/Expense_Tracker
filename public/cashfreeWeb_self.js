const cashfree = Cashfree({
  mode: "sandbox",
});

document.getElementById("renderBtn").addEventListener("click", async () => {
  try {
    const response = await fetch("http://localhost:3000/payments/pay", {
      method: "POST",
    });
    const data = await response.json();
    const paymentSessionId = data.paymentSessionId;

    let checkoutOptions = {
      paymentSessionId: paymentSessionId,
      redirectTarget: "_self",
    };
    await cashfree.checkout(checkoutOptions);
  } catch (error) {
    console.error("Error during payment session or checkout:", error);
  }
}); 