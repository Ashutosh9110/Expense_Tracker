const Brevo = require('@getbrevo/brevo'); // or whatever SDK you use
const apiInstance = new Brevo.TransactionalEmailsApi();

apiInstance.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, process.env.BREVO_SECRET);

const sendMail = async (to, subject, resetLink) => {
  const sendSmtpEmail = {
    to: [{ email: to }],
    sender: { name: "Ashutosh", email: "ashusingh19911082@gmail.com" },
    subject: subject,
    htmlContent: `<p>Click the following link to reset your password:</p><a href="${resetLink}">${resetLink}</a>`
  };

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("Reset email sent to:", to);
  } catch (error) {
    console.error("Email sending failed:", error);
  }
};

module.exports = sendMail;
