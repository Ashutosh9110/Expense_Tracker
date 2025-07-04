const Sib = require("sib-api-v3-sdk");
const { users } = require("../models/userModel"); 

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    } 

    const client = Sib.ApiClient.instance;
    const apiKey = client.authentications["api-key"];
    // console.log("Brevo Key:", process.env.BREVO_SECRET)
    apiKey.apiKey = process.env.BREVO_SECRET; 
    const tranEmailApi = new Sib.TransactionalEmailsApi();

    await tranEmailApi.sendTransacEmail({
      sender: { email: "youremail@example.com", name: "Expense Tracker" },
      to: [{ email }],
      subject: "Reset your password",
      htmlContent: `
        <p>Hello ${user.name},</p>
        <p>Click the link below to reset your password:</p>
        <a href="http://localhost:3000/reset-password/${user.id}">Reset Password</a>
      `
    });

    res.status(200).json({ msg: "Reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong", error: err.message });
  }
};

module.exports = { forgotPassword };
  