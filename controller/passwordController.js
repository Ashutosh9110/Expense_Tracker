const { v4: uuidv4 } = require("uuid");
// const Sib = require("sib-api-v3-sdk");
const { users } = require("../models/userModel"); 
const { forgotPasswordRequest  } = require("../models/ForgotPasswordModel")
// const path = require("path");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/sendMail"); // or correct path


const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await users.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    } 

    const request = await forgotPasswordRequest.create({
      id: uuidv4(),
      userId: user.id,
      isActive: true,
    });


    const resetLink = `http://localhost:3000/password/resetpassword/${request.id}`;
    await sendMail(email, "Reset your password", resetLink);

    res.status(200).json({ msg: "Reset link sent to your email." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Something went wrong", error: err.message });
  }
};



const getResetForm = async (req, res) => {
  const id = req.params.id;

  try {
    const request = await forgotPasswordRequest.findOne({ where: { id, isActive: true } });

    if (!request) {
      return res.status(400).send("Invalid or expired reset link.");
    }

    // Serve basic HTML form
    res.send(`
      <form action="/password/updatepassword/${id}" method="POST">
        <input type="password" name="newPassword" placeholder="Enter new password" required />
        <button type="submit">Reset Password</button>
      </form>
    `);
  } catch (err) {
    res.status(500).send("Something went wrong.");
  }
};




const updatePassword = async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    const request = await forgotPasswordRequest.findOne({ where: { id, isActive: true } });

    if (!request) {
      return res.status(400).send("Reset link is invalid or already used.");
    }

    const user = await users.findOne({ where: { id: request.userId } });

    if (!user) {
      return res.status(404).send("User not found.");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });
    await request.update({ isActive: false });

    res.send("Password has been updated. Please log in with your new password.");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update password.");
  }
};



module.exports = { 
  forgotPassword,
  getResetForm,
  updatePassword
 };
  